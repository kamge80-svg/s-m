import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { validateMediaFile } from '../utils/validation';

interface CreateProductProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProduct({ onClose, onSuccess }: CreateProductProps) {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [promoVideoFile, setPromoVideoFile] = useState<File | null>(null);
  const [promoVideoPreview, setPromoVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promoVideoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateMediaFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      showToast(validation.error || 'Invalid file', 'error');
      return;
    }

    const isImage = file.type.startsWith('image/');

    setMediaFile(file);
    setMediaType(isImage ? 'image' : 'video');
    setMediaPreview(URL.createObjectURL(file));
    setError('');
  };

  const handlePromoVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider que c'est une vidéo
    if (!file.type.startsWith('video/')) {
      setError('Promo must be a video');
      showToast('Promo must be a video', 'error');
      return;
    }

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      showToast(validation.error || 'Invalid file', 'error');
      return;
    }

    setPromoVideoFile(file);
    setPromoVideoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider que c'est une image
    if (!file.type.startsWith('image/')) {
      setError('Thumbnail must be an image');
      showToast('Thumbnail must be an image', 'error');
      return;
    }

    // Vérifier la taille (max 5MB pour thumbnail)
    if (file.size > 5 * 1024 * 1024) {
      setError('Thumbnail must be less than 5MB');
      showToast('Thumbnail must be less than 5MB', 'error');
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mediaFile || !mediaType) return;

    setUploading(true);
    setError('');

    try {
      console.log('Starting upload...', { userId: user.id, mediaType, fileSize: mediaFile.size });
      
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${mediaType}s/${fileName}`;

      console.log('Uploading to storage:', filePath);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('products')
        .upload(filePath, mediaFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Upload thumbnail si présent
      let thumbnailUrl = mediaType === 'video' ? publicUrl : '';
      if (thumbnailFile) {
        console.log('Uploading thumbnail...');
        const thumbFileExt = thumbnailFile.name.split('.').pop();
        const thumbFileName = `${user.id}-thumb-${Date.now()}.${thumbFileExt}`;
        const thumbFilePath = `thumbnails/${thumbFileName}`;

        const { error: thumbUploadError } = await supabase.storage
          .from('products')
          .upload(thumbFilePath, thumbnailFile);

        if (thumbUploadError) {
          console.error('Thumbnail upload error:', thumbUploadError);
          throw thumbUploadError;
        }

        const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(thumbFilePath);

        thumbnailUrl = thumbPublicUrl;
        console.log('Thumbnail uploaded:', thumbnailUrl);
      }

      const productData = {
        user_id: user.id,
        title,
        short_description: shortDescription || null,
        description,
        price: parseFloat(price) || 0,
        media_url: publicUrl,
        media_type: mediaType,
        thumbnail_url: thumbnailUrl,
        category,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };

      console.log('Inserting product:', productData);

      // Upload promo video si présente
      let promoVideoUrl = null;
      if (promoVideoFile) {
        console.log('Uploading promo video...');
        const promoFileExt = promoVideoFile.name.split('.').pop();
        const promoFileName = `${user.id}-promo-${Date.now()}.${promoFileExt}`;
        const promoFilePath = `videos/${promoFileName}`;

        const { error: promoUploadError } = await supabase.storage
          .from('products')
          .upload(promoFilePath, promoVideoFile);

        if (promoUploadError) {
          console.error('Promo upload error:', promoUploadError);
          throw promoUploadError;
        }

        const { data: { publicUrl: promoPublicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(promoFilePath);

        promoVideoUrl = promoPublicUrl;
        console.log('Promo video uploaded:', promoVideoUrl);
      }

      // Ajouter promo_video_url au productData
      const finalProductData = {
        ...productData,
        promo_video_url: promoVideoUrl,
      };

      const { error: insertError, data: insertData } = await supabase
        .from('products')
        .insert(finalProductData)
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Product created successfully:', insertData);
      showToast('Product published successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Full error:', error);
      setError(error.message);
      showToast(error.message || 'Failed to publish product', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Create Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Media
            </label>
            {!mediaPreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <Upload className="w-12 h-12 text-slate-400" />
                <div className="text-center">
                  <p className="text-slate-700 font-medium">
                    Upload Image or Video
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    Click to browse files
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> JPG, PNG
                  </span>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs flex items-center gap-1">
                    <Video className="w-3 h-3" /> MP4, MOV
                  </span>
                </div>
              </button>
            ) : (
              <div className="relative">
                <div className="w-full h-64 bg-black rounded-xl overflow-hidden">
                  {mediaType === 'video' ? (
                    <video src={mediaPreview} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                    setMediaType(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Thumbnail (Optional) - Only for videos */}
          {mediaType === 'video' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cover Photo (Optional)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Upload a cover photo that will be shown in your profile grid.
              </p>
              {!thumbnailPreview ? (
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                  <p className="text-slate-700 font-medium text-sm">
                    Upload Cover Photo
                  </p>
                  <p className="text-slate-500 text-xs">
                    Image shown during loading (optional)
                  </p>
                </button>
              ) : (
                <div className="relative">
                  <div className="w-full h-32 bg-black rounded-xl overflow-hidden">
                    <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </div>
          )}

          {/* Promo Video (Optional) - Only for videos */}
          {mediaType === 'video' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Promo Video (Optional)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Upload a short promo video (30-60s) for the feed. Main video will be shown in profile.
              </p>
              {!promoVideoPreview ? (
                <button
                  type="button"
                  onClick={() => promoVideoInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <Video className="w-8 h-8 text-slate-400" />
                  <p className="text-slate-700 font-medium text-sm">
                    Upload Promo Video
                  </p>
                  <p className="text-slate-500 text-xs">
                    Short video for feed (optional)
                  </p>
                </button>
              ) : (
                <div className="relative">
                  <div className="w-full h-32 bg-black rounded-xl overflow-hidden">
                    <video src={promoVideoPreview} controls className="w-full h-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoVideoFile(null);
                      setPromoVideoPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                ref={promoVideoInputRef}
                type="file"
                accept="video/*"
                onChange={handlePromoVideoChange}
                className="hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="Product title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Short Description (Feed)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              A catchy hook shown in the feed (optional, max 100 characters)
            </p>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={2}
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              placeholder="Quick catchy description for the feed..."
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {shortDescription.length}/100
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Description (Profile)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Complete product details shown in profile and product page
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              placeholder="Detailed description of your product..."
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="e.g. Digital Art"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !mediaFile || !title}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
