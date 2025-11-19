import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatDistanceToNow } from 'date-fns';

interface ReviewsProps {
  productId: string;
  onClose: () => void;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

export default function Reviews({ productId, onClose }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadReviews();
  }, [productId, user]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);

      if (user) {
        const userRev = data?.find(r => r.user_id === user.id);
        setUserReview(userRev || null);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      if (userReview) {
        const { error } = await supabase
          .from('reviews')
          .update({ rating, comment })
          .eq('id', userReview.id);

        if (error) throw error;
        showToast('Review updated!', 'success');
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert({ product_id: productId, user_id: user.id, rating, comment });

        if (error) throw error;
        showToast('Review posted!', 'success');
      }

      setShowForm(false);
      setComment('');
      setRating(5);
      await loadReviews();
    } catch (error) {
      showToast('Failed to post review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="fixed inset-0 gradient-dark z-50 flex flex-col">
      <div className="glass-effect border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(avgRating)
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/70 text-sm">
                {avgRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {!userReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mt-4 py-3 gradient-primary rounded-xl text-white font-bold hover:shadow-glow transition"
          >
            Write a Review
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="glass-effect rounded-xl p-4 mb-4">
            <div className="mb-4">
              <label className="block text-white font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-white/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-white font-medium mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50 resize-none"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setComment('');
                  setRating(5);
                }}
                className="flex-1 py-3 glass-effect rounded-xl text-white font-medium hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 gradient-primary rounded-xl text-white font-bold hover:shadow-glow transition disabled:opacity-50"
              >
                {submitting ? 'Posting...' : userReview ? 'Update' : 'Post'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">No reviews yet</p>
            <p className="text-white/50 text-sm mt-1">Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="glass-effect rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-green-500 overflow-hidden flex-shrink-0">
                    {review.profiles?.avatar_url ? (
                      <img
                        src={review.profiles.avatar_url}
                        alt={review.profiles.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {review.profiles?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">
                        @{review.profiles?.username || 'user'}
                      </span>
                      <span className="text-white/50 text-xs">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-white/90">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
