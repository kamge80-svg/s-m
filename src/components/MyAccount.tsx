import { useState } from 'react';
import { X, DollarSign, TrendingUp } from 'lucide-react';
import Wallet from './Wallet';
import Analytics from './Analytics';

interface MyAccountProps {
  onClose: () => void;
  revenue: number;
}

type Tab = 'revenue' | 'analytics';

export default function MyAccount({ onClose, revenue }: MyAccountProps) {
  const [activeTab, setActiveTab] = useState<Tab>('revenue');

  return (
    <div className="fixed inset-0 gradient-dark z-50 overflow-y-auto">
      <div className="sticky top-0 glass-effect border-b border-white/10 p-4 flex items-center justify-between backdrop-blur-xl shadow-xl">
        <button
          onClick={onClose}
          className="p-2 glass-effect hover:bg-white/20 rounded-xl transition-all hover:scale-110"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-2xl font-bold text-white">My Account</h2>
        <div className="w-10" />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-8 py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl ${
              activeTab === 'revenue'
                ? 'gradient-primary text-white shadow-glow scale-105'
                : 'glass-effect text-white/70 hover:bg-white/20 hover:scale-105'
            }`}
          >
            <DollarSign className="w-6 h-6" />
            <span className="text-lg">Revenue</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-8 py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl ${
              activeTab === 'analytics'
                ? 'gradient-primary text-white shadow-glow scale-105'
                : 'glass-effect text-white/70 hover:bg-white/20 hover:scale-105'
            }`}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-lg">Analytics</span>
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 animate-fadeIn">
          {activeTab === 'revenue' && (
            <div className="glass-effect rounded-2xl p-6 shadow-2xl">
              <Wallet balance={revenue} onClose={() => {}} />
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="glass-effect rounded-2xl p-6 shadow-2xl">
              <Analytics onClose={() => {}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
