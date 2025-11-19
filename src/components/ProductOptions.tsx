import { useState, useEffect } from 'react';
import { Trash2, Edit2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import ConfirmDialog from './ConfirmDialog';

interface ProductOptionsProps {
  productId: string;
  onClose: () => void;
  onDeleted: () => void;
  onEdited: () => void;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
}

export default function ProductOptions({
  productId,
  onClose,
  onDeleted,
  onEdited,
}: ProductOptionsProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setFormData(data);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        showToast('Failed to load product', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId, showToast]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      
      showToast('Product deleted successfully', 'success');
      onDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          tags: formData.tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);
      
      if (error) throw error;
      
      showToast('Product updated successfully', 'success');
      onEdited();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      showToast('Failed to update product', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Product Options</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!showDelete && !showEdit ? (
            <>
              <button
                onClick={() => setShowEdit(true)}
                className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 transition text-left"
              >
                <Edit2 className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-900">Edit Product</div>
                  <div className="text-sm text-slate-600">Update title, description, and price</div>
                </div>
              </button>

              <button
                onClick={() => setShowDelete(true)}
                className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-red-50 transition text-left"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-semibold text-slate-900">Delete Product</div>
                  <div className="text-sm text-slate-600">This action cannot be undone</div>
                </div>
              </button>
            </>
          ) : showEdit ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEdit(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Product?"
        message="This will permanently delete your product and cannot be undone. All likes, comments, and views will be lost."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
