import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Feed from './components/Feed';
import CreateProduct from './components/CreateProduct';
import Profile from './components/Profile';
import Comments from './components/Comments';
import Search from './components/Search';
import Trending from './components/Trending';
import Bookmarks from './components/Bookmarks';
import BottomNav from './components/BottomNav';
import ProductDetail from './components/ProductDetail';
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import PurchaseHistory from './components/PurchaseHistory';
import Analytics from './components/Analytics';
import Reviews from './components/Reviews';
import Categories from './components/Categories';
import AccessibilityMenu from './components/AccessibilityMenu';
import CreateBundle from './components/CreateBundle';
import PromoCodeManager from './components/PromoCodeManager';
import { CoursesPage } from './pages/CoursesPage';

type View = 'feed' | 'create' | 'profile' | 'search' | 'trending' | 'bookmarks' | 'bundles' | 'promos' | 'courses';

function App() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<View>('feed');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState<{ userId: string; productId?: string } | null>(null);
  const [showProductDetail, setShowProductDetail] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showReviews, setShowReviews] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateBundle, setShowCreateBundle] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [refreshFeed, setRefreshFeed] = useState(0);

  // Handle hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'promos') setActiveView('promos');
      else if (hash === 'create-course') setShowCreateCourse(true);
      else if (hash === 'courses') setActiveView('courses');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleCreateSuccess = () => {
    setActiveView('feed');
    setRefreshFeed((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black">
      {activeView === 'feed' && (
        <>
          <BottomNav 
            activeView={activeView} 
            onViewChange={setActiveView}
            onNotificationsClick={() => setShowNotifications(true)}
            onMessagesClick={() => setShowMessages(true)}
            onCategoriesClick={() => setShowCategories(true)}
          />
          <Feed
            key={`${refreshFeed}-${selectedCategory}`}
            onUserClick={(userId, productId) => setShowUserProfile({ userId, productId })}
            onCommentClick={(productId) => setShowComments(productId)}
            categoryFilter={selectedCategory}
          />
        </>
      )}

      {activeView === 'create' && (
        <CreateProduct
          onClose={() => setActiveView('feed')}
          onSuccess={handleCreateSuccess}
        />
      )}

      {activeView === 'profile' && (
        <Profile 
          onClose={() => setActiveView('feed')}
          onPurchaseHistoryClick={() => setShowPurchaseHistory(true)}
          onAnalyticsClick={() => setShowAnalytics(true)}
        />
      )}

      {activeView === 'promos' && (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
          <div className="max-w-4xl mx-auto p-4">
            <button
              onClick={() => setActiveView('feed')}
              className="mb-4 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow"
            >
              ← Back
            </button>
            <PromoCodeManager />
          </div>
        </div>
      )}

      {activeView === 'courses' && (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
          <div className="max-w-4xl mx-auto p-4">
            <button
              onClick={() => setActiveView('feed')}
              className="mb-4 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow text-slate-900 dark:text-white"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowCreateCourse(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
            >
              Create New Course
            </button>
          </div>
        </div>
      )}

      {activeView === 'search' && (
        <Search
          onClose={() => setActiveView('feed')}
          onProductClick={(productId) => {
            console.log('Product clicked:', productId);
            setActiveView('feed');
          }}
          onUserClick={(userId) => {
            setShowUserProfile({ userId });
            setActiveView('feed');
          }}
        />
      )}

      {activeView === 'trending' && (
        <Trending
          onClose={() => setActiveView('feed')}
          onProductClick={(productId) => {
            setActiveView('feed');
          }}
        />
      )}

      {activeView === 'bookmarks' && (
        <Bookmarks
          onClose={() => setActiveView('feed')}
          onProductClick={(productId) => {
            setActiveView('feed');
          }}
        />
      )}

      {showComments && (
        <Comments
          productId={showComments}
          onClose={() => setShowComments(null)}
        />
      )}

      {showUserProfile && (
        <Profile
          userId={showUserProfile.userId}
          highlightProductId={showUserProfile.productId}
          onClose={() => setShowUserProfile(null)}
          onProductClick={(productId) => {
            setShowUserProfile(null);
            setShowProductDetail(productId);
          }}
        />
      )}

      {showProductDetail && (
        <ProductDetail
          productId={showProductDetail}
          onClose={() => setShowProductDetail(null)}
          onUserClick={(userId) => {
            setShowProductDetail(null);
            setShowUserProfile({ userId });
          }}
          onReviewsClick={(productId) => {
            setShowProductDetail(null);
            setShowReviews(productId);
          }}
        />
      )}

      {showNotifications && (
        <Notifications
          onClose={() => setShowNotifications(false)}
          onNavigate={(link) => {
            setShowNotifications(false);
            // Handle navigation based on link
          }}
        />
      )}

      {showMessages && (
        <Messages
          onClose={() => setShowMessages(false)}
        />
      )}

      {showPurchaseHistory && (
        <PurchaseHistory
          onClose={() => setShowPurchaseHistory(false)}
          onProductClick={(productId) => {
            setShowPurchaseHistory(false);
            setShowProductDetail(productId);
          }}
        />
      )}

      {showAnalytics && (
        <Analytics
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {showReviews && (
        <Reviews
          productId={showReviews}
          onClose={() => setShowReviews(null)}
        />
      )}

      {showCategories && (
        <Categories
          onClose={() => setShowCategories(false)}
          onCategorySelect={(category) => {
            setSelectedCategory(category);
            setActiveView('feed');
          }}
        />
      )}

      {showCreateBundle && (
        <CreateBundle
          onClose={() => setShowCreateBundle(false)}
          onSuccess={() => {
            setShowCreateBundle(false);
            setRefreshFeed((prev) => prev + 1);
          }}
        />
      )}

      {showCreateCourse && (
        <CoursesPage
          onClose={() => setShowCreateCourse(false)}
          onSuccess={() => {
            setShowCreateCourse(false);
            setRefreshFeed((prev) => prev + 1);
          }}
        />
      )}

      <AccessibilityMenu />
    </div>
  );
}

export default App;
