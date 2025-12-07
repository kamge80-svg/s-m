import { Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminButtonProps {
  onClick: () => void;
}

export const AdminButton = ({ onClick }: AdminButtonProps) => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show admin button for authenticated users
    // In production, check for is_admin flag
    if (user) {
      setShow(true);
    }
  }, [user]);

  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-40 p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
      title="Admin Dashboard"
    >
      <Shield className="w-6 h-6 text-white" />
      <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Admin
      </span>
    </button>
  );
};

export default AdminButton;
