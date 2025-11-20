import { useState } from 'react';
import { X, Tag, Package, GraduationCap } from 'lucide-react';
import PromoCodeManager from './PromoCodeManager';
import CreateBundle from './CreateBundle';
import { useToast } from '../contexts/ToastContext';

interface SellerToolsProps {
  onClose: () => void;
}

type Tab = 'promos' | 'bundles' | 'courses';

export default function SellerTools({ onClose }: SellerToolsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('promos');
  const { showToast } = useToast();

  return (
    <div className="fixed inset-0 gradient-dark z-50 overflow-y-auto">
      <div className="sticky top-0 glass-effect border-b border-white/10 p-4 flex items-center justify-between backdrop-blur-xl shadow-xl">
        <button
          onClick={onClose}
          className="p-2 glass-effect hover:bg-white/20 rounded-xl transition-all hover:scale-110"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-2xl font-bold text-white">Seller Tools</h2>
        <div className="w-10" />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => setActiveTab('promos')}
            className={`px-6 py-5 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-2 shadow-xl ${
              activeTab === 'promos'
                ? 'gradient-primary text-white shadow-glow scale-105'
                : 'glass-effect text-white/70 hover:bg-white/20 hover:scale-105'
            }`}
          >
            <Tag className="w-6 h-6" />
            <span className="text-sm">Promos</span>
          </button>
          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-6 py-5 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-2 shadow-xl ${
              activeTab === 'bundles'
                ? 'gradient-primary text-white shadow-glow scale-105'
                : 'glass-effect text-white/70 hover:bg-white/20 hover:scale-105'
            }`}
          >
            <Package className="w-6 h-6" />
            <span className="text-sm">Bundles</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-6 py-5 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-2 shadow-xl ${
              activeTab === 'courses'
                ? 'gradient-primary text-white shadow-glow scale-105'
                : 'glass-effect text-white/70 hover:bg-white/20 hover:scale-105'
            }`}
          >
            <GraduationCap className="w-6 h-6" />
            <span className="text-sm">Courses</span>
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 animate-fadeIn">
          {activeTab === 'promos' && (
            <div className="glass-effect rounded-2xl p-6 shadow-2xl">
              <PromoCodeManager />
            </div>
          )}
          {activeTab === 'bundles' && (
            <div className="glass-effect rounded-2xl p-6 shadow-2xl">
              <CreateBundle onClose={() => {}} onSuccess={() => showToast('Bundle created!', 'success')} />
            </div>
          )}
          {activeTab === 'courses' && (
            <div className="glass-effect rounded-2xl p-12 text-center shadow-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Create Courses</h3>
              <p className="text-white/80 mb-8 text-lg max-w-md mx-auto">
                Share your knowledge and create engaging online courses for your audience
              </p>
              <button
                onClick={() => window.location.hash = 'create-course'}
                className="px-8 py-4 gradient-primary text-white rounded-2xl font-bold hover:shadow-glow transition-all hover:scale-110 text-lg"
              >
                Create New Course
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
