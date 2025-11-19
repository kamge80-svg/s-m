import { useState, useEffect, useRef } from 'react';
import { X, Send, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface MessagesProps {
  onClose: () => void;
  initialUserId?: string;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message: string;
  last_message_at: string;
  other_user: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function Messages({ onClose, initialUserId }: MessagesProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_id_fkey(id, username, avatar_url),
          user2:profiles!conversations_user2_id_fkey(id, username, avatar_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const formattedConversations = data?.map(conv => ({
        ...conv,
        other_user: conv.user1_id === user.id ? conv.user2 : conv.user1,
      })) || [];

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user!.id)
        .eq('read', false);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const receiverId = conversation.user1_id === user.id 
      ? conversation.user2_id 
      : conversation.user1_id;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        receiver_id: receiverId,
        content: newMessage.trim(),
      });

      if (error) throw error;

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString(),
        })
        .eq('id', selectedConversation);

      setNewMessage('');
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 gradient-dark z-50 flex">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-white/10`}>
        <div className="glass-effect border-b border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <button
              onClick={onClose}
              className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-white/70">No conversations yet</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-3 rounded-xl transition-all mb-2 ${
                    selectedConversation === conv.id
                      ? 'gradient-primary shadow-glow'
                      : 'glass-effect hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 overflow-hidden flex-shrink-0">
                      {conv.other_user.avatar_url ? (
                        <img
                          src={conv.other_user.avatar_url}
                          alt={conv.other_user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {conv.other_user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="font-semibold text-white truncate">
                        {conv.other_user.username}
                      </h4>
                      <p className="text-white/70 text-sm truncate">
                        {conv.last_message}
                      </p>
                    </div>
                    <div className="text-white/50 text-xs">
                      {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages View */}
      {selectedConversation && (
        <div className="flex-1 flex flex-col">
          <div className="glass-effect border-b border-white/10 p-4 flex items-center gap-3">
            <button
              onClick={() => setSelectedConversation(null)}
              className="md:hidden p-2 glass-effect hover:bg-white/20 rounded-xl transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            {conversations.find(c => c.id === selectedConversation)?.other_user && (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 overflow-hidden">
                  {conversations.find(c => c.id === selectedConversation)?.other_user.avatar_url ? (
                    <img
                      src={conversations.find(c => c.id === selectedConversation)!.other_user.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {conversations.find(c => c.id === selectedConversation)!.other_user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-white">
                  {conversations.find(c => c.id === selectedConversation)!.other_user.username}
                </h3>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user!.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    message.sender_id === user!.id
                      ? 'gradient-primary text-white'
                      : 'glass-effect text-white'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p className="text-xs text-white/50 mt-1">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="glass-effect border-t border-white/10 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-3 gradient-primary rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
