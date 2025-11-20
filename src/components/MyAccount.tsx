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
      <div className="sticky top-0 glass-effect border-b border-white/10 p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">My Account</h2>
        <div className="w-10" />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'revenue'
                ? 'gradient-primary text-white shadow-glow'
                : 'glass-effect text-white/70 hover:bg-white/20'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Revenue
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'analytics'
                ? 'gradient-primary text-white shadow-glow'
                : 'glass-effect text-white/70 hover:bg-white/20'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Analytics
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'revenue' && (
            <Wallet balance={revenue} onClose={() => {}} />
          )}
          {activeTab === 'analytics' && (
            <Analytics onClose={() => {}} />
          )}
        </div>
      </div>
    </div>
  );
}
