import { useState, useEffect } from 'react';
import { X, Grid, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CategoriesProps {
  onClose: () => void;
  onCategorySelect: (category: string) => void;
}

interface CategoryData {
  category: string;
  count: number;
}

export default function Categories({ onClose, onCategorySelect }: CategoriesProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category');

      if (error) throw error;

      const categoryCounts = (data || []).reduce((acc: Record<string, number>, item) => {
        const cat = item.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const categoryArray = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count: count as number }))
        .sort((a, b) => b.count - a.count);

      setCategories(categoryArray);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons: Record<string, string> = {
    'Digital Art': '🎨',
    'Music': '🎵',
    'Video': '🎬',
    'Photography': '📸',
    'Design': '✨',
    'Education': '📚',
    'Software': '💻',
    'Templates': '📄',
    'Uncategorized': '📦',
  };

  return (
    <div className="fixed inset-0 gradient-dark z-50 flex flex-col">
      <div className="glass-effect border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Grid className="w-6 h-6 text-yellow-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Categories</h2>
              <p className="text-sm text-white/70">Browse by category</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Grid className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">No categories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => {
                  onCategorySelect(cat.category);
                  onClose();
                }}
                className="glass-effect rounded-xl p-6 hover:bg-white/20 transition-all hover:scale-105 group"
              >
                <div className="text-4xl mb-3">
                  {categoryIcons[cat.category] || '📦'}
                </div>
                <h3 className="font-bold text-white mb-1 group-hover:text-gradient transition">
                  {cat.category}
                </h3>
                <div className="flex items-center justify-center gap-1 text-white/70 text-sm">
                  <TrendingUp className="w-3 h-3" />
                  <span>{cat.count} products</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
