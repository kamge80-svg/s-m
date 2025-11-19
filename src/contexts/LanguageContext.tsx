import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

const translations: Translations = {
  home: { en: 'Home', fr: 'Accueil' },
  profile: { en: 'Profile', fr: 'Profil' },
  create: { en: 'Create', fr: 'Créer' },
  search: { en: 'Search', fr: 'Rechercher' },
  trending: { en: 'Trending', fr: 'Tendances' },
  bookmarks: { en: 'Bookmarks', fr: 'Favoris' },
  notifications: { en: 'Notifications', fr: 'Notifications' },
  messages: { en: 'Messages', fr: 'Messages' },
  categories: { en: 'Categories', fr: 'Catégories' },
  signOut: { en: 'Sign Out', fr: 'Déconnexion' },
  myPurchases: { en: 'My Purchases', fr: 'Mes Achats' },
  analytics: { en: 'Analytics', fr: 'Statistiques' },
  reviews: { en: 'Reviews', fr: 'Avis' },
  price: { en: 'Price', fr: 'Prix' },
  buy: { en: 'Buy', fr: 'Acheter' },
  likes: { en: 'likes', fr: 'j\'aime' },
  views: { en: 'views', fr: 'vues' },
  comments: { en: 'comments', fr: 'commentaires' },
  products: { en: 'products', fr: 'produits' },
  followers: { en: 'Followers', fr: 'Abonnés' },
  following: { en: 'Following', fr: 'Abonnements' },
  revenue: { en: 'Revenue', fr: 'Revenus' },
  writeReview: { en: 'Write a Review', fr: 'Écrire un avis' },
  rating: { en: 'Rating', fr: 'Note' },
  comment: { en: 'Comment', fr: 'Commentaire' },
  post: { en: 'Post', fr: 'Publier' },
  cancel: { en: 'Cancel', fr: 'Annuler' },
  update: { en: 'Update', fr: 'Mettre à jour' },
  delete: { en: 'Delete', fr: 'Supprimer' },
  edit: { en: 'Edit', fr: 'Modifier' },
  share: { en: 'Share', fr: 'Partager' },
  save: { en: 'Save', fr: 'Enregistrer' },
  loading: { en: 'Loading...', fr: 'Chargement...' },
  noResults: { en: 'No results found', fr: 'Aucun résultat trouvé' },
  purchaseSuccess: { en: 'Purchase successful!', fr: 'Achat réussi !' },
  purchaseFailed: { en: 'Purchase failed', fr: 'Achat échoué' },
  paymentMethod: { en: 'Payment Method', fr: 'Mode de paiement' },
  mobileMoney: { en: 'Mobile Money', fr: 'Mobile Money' },
  creditCard: { en: 'Credit Card', fr: 'Carte bancaire' },
  totalSpent: { en: 'Total Spent', fr: 'Total dépensé' },
  purchaseHistory: { en: 'Purchase History', fr: 'Historique des achats' },
  all: { en: 'All', fr: 'Tous' },
  completed: { en: 'Completed', fr: 'Complétés' },
  pending: { en: 'Pending', fr: 'En attente' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
