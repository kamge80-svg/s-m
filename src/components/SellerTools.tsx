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
      <div className="sticky top-0 glass-effect border-b border-white/10 p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Seller Tools</h2>
        <div className="w-10" />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => setActiveTab('promos')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'promos'
                ? 'gradient-primary text-white shadow-glow'
                : 'glass-effect text-white/70 hover:bg-white/20'
            }`}
          >
            <Tag className="w-5 h-5" />
            Promos
          </button>
          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'bundles'
                ? 'gradient-primary text-white shadow-glow'
                : 'glass-effect text-white/70 hover:bg-white/20'
            }`}
          >
            <Package className="w-5 h-5" />
            Bundles
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'courses'
                ? 'gradient-primary text-white shadow-glow'
                : 'glass-effect text-white/70 hover:bg-white/20'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            Courses
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'promos' && (
            <PromoCodeManager onClose={() => {}} />
          )}
          {activeTab === 'bundles' && (
            <CreateBundle onClose={() => {}} />
          )}
          {activeTab === 'courses' && (
            <div className="glass-effect rounded-xl p-8 text-center">
              <GraduationCap className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Create Courses</h3>
              <p className="text-white/70 mb-6">
                Share your knowledge and create online courses
              </p>
              <button
                onClick={() => window.location.hash = 'create-course'}
                className="px-6 py-3 gradient-primary text-white rounded-xl font-bold hover:shadow-glow transition-all hover:scale-105"
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
