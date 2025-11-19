import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          bio: string;
          avatar_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string;
          bio?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          bio?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          price: number;
          media_url: string;
          media_type: 'image' | 'video';
          thumbnail_url: string;
          category: string;
          tags: string[];
          view_count: number;
          like_count: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          price?: number;
          media_url: string;
          media_type: 'image' | 'video';
          thumbnail_url?: string;
          category?: string;
          tags?: string[];
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          price?: number;
          media_url?: string;
          media_type?: 'image' | 'video';
          thumbnail_url?: string;
          category?: string;
          tags?: string[];
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: never;
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          updated_at?: string;
        };
      };
      views: {
        Row: {
          id: string;
          user_id: string | null;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          product_id: string;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
};
