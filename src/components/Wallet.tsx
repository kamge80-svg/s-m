import { useState } from 'react';
import { X, DollarSign, Send, Download, CreditCard } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface WalletProps {
  balance: number;
  onClose: () => void;
}

type Tab = 'overview' | 'withdraw' | 'transfer';

export default function Wallet({ balance, onClose }: WalletProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [method, setMethod] = useState<'bank' | 'mobile'>('mobile');
  const [accountNumber, setAccountNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      showToast('Enter a valid amount', 'error');
      return;
    }

    if (withdrawAmount > balance) {
      showToast('Insufficient balance', 'error');
      return;
    }

    if (!accountNumber) {
      showToast('Enter account number', 'error');
      return;
    }

    setProcessing(true);
    
    // Simuler le traitement
    setTimeout(() => {
      showToast(`Withdrawal of $${withdrawAmount.toFixed(2)} initiated!`, 'success');
      setProcessing(false);
      setAmount('');
      setAccountNumber('');
      onClose();
    }, 2000);
  };

  const handleTransfer = async () => {
    const transferAmount = parseFloat(amount);
    
    if (!transferAmount || transferAmount <= 0) {
      showToast('Enter a valid amount', 'error');
      return;
    }

    if (transferAmount > balance) {
      showToast('Insufficient balance', 'error');
      return;
    }

    if (!recipient) {
      showToast('Enter recipient username', 'error');
      return;
    }

    setProcessing(true);
    
    // Simuler le traitement
    setTimeout(() => {
      showToast(`$${transferAmount.toFixed(2)} sent to @${recipient}!`, 'success');
      setProcessing(false);
      setAmount('');
      setRecipient('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="gradient-dark rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="sticky top-0 glass-effect border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">My Wallet</h2>
              <p className="text-sm text-white/70">Manage your earnings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass-effect hover:bg-white/20 rounded-xl transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-6">
          <div className="glass-effect rounded-2xl p-6 border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <p className="text-white/70 text-sm mb-2">Available Balance</p>
              <h3 className="text-5xl font-bold text-gradient mb-4">
                ${balance.toFixed(2)}
              </h3>
              <p className="text-white/50 text-xs">
                From {Math.floor(balance / 25)} product sales
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'gradient-primary text-white shadow-glow'
                  : 'glass-effect text-white/70 hover:bg-white/20'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'withdraw'
                  ? 'gradient-primary text-white shadow-glow'
                  : 'glass-effect text-white/70 hover:bg-white/20'
              }`}
            >
              Withdraw
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'transfer'
                  ? 'gradient-primary text-white shadow-glow'
                  : 'glass-effect text-white/70 hover:bg-white/20'
              }`}
            >
              Transfer
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="glass-effect rounded-xl p-4 flex items-center justify-between hover:bg-white/20 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Total Earned</p>
                    <p className="text-white/70 text-sm">${balance.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4 flex items-center justify-between hover:bg-white/20 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Send className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Withdrawn</p>
                    <p className="text-white/70 text-sm">$0.00</p>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4">
                <p className="text-white/70 text-sm mb-2">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="glass-effect hover:bg-white/20 rounded-lg p-3 text-white text-sm font-medium transition"
                  >
                    Withdraw Money
                  </button>
                  <button
                    onClick={() => setActiveTab('transfer')}
                    className="glass-effect hover:bg-white/20 rounded-lg p-3 text-white text-sm font-medium transition"
                  >
                    Send Money
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Withdrawal Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMethod('mobile')}
                    className={`p-4 rounded-xl font-medium transition-all ${
                      method === 'mobile'
                        ? 'gradient-primary text-white shadow-glow'
                        : 'glass-effect text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2" />
                    Mobile Money
                  </button>
                  <button
                    onClick={() => setMethod('bank')}
                    className={`p-4 rounded-xl font-medium transition-all ${
                      method === 'bank'
                        ? 'gradient-primary text-white shadow-glow'
                        : 'glass-effect text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <DollarSign className="w-6 h-6 mx-auto mb-2" />
                    Bank Transfer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50 text-lg font-bold"
                />
                <p className="text-white/50 text-xs mt-1">
                  Available: ${balance.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  {method === 'mobile' ? 'Mobile Money Number' : 'Bank Account Number'}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={method === 'mobile' ? '+237 6XX XXX XXX' : 'Account number'}
                  className="w-full px-4 py-3 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50"
                />
              </div>

              <button
                onClick={handleWithdraw}
                disabled={processing || !amount || !accountNumber}
                className="w-full gradient-primary text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow hover:scale-105"
              >
                {processing ? 'Processing...' : 'Withdraw Money'}
              </button>

              <p className="text-white/50 text-xs text-center">
                Processing time: 1-3 business days
              </p>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Recipient Username
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-3 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50 text-lg font-bold"
                />
                <p className="text-white/50 text-xs mt-1">
                  Available: ${balance.toFixed(2)}
                </p>
              </div>

              <button
                onClick={handleTransfer}
                disabled={processing || !amount || !recipient}
                className="w-full gradient-primary text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow hover:scale-105"
              >
                {processing ? 'Sending...' : 'Send Money'}
              </button>

              <p className="text-white/50 text-xs text-center">
                Instant transfer to other users
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
