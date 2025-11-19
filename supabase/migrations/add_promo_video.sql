-- Ajouter le champ promo_video_url pour la vidéo de promotion dans le feed
-- La vidéo principale (media_url) reste pour le profil produit

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS promo_video_url TEXT;

-- Commentaire pour clarifier l'usage
COMMENT ON COLUMN products.media_url IS 'Vidéo/Image principale du produit (affichée dans le profil)';
COMMENT ON COLUMN products.promo_video_url IS 'Vidéo de promotion (affichée dans le feed, optionnelle)';

-- Si promo_video_url est null, on utilise media_url dans le feed
-- Cela permet la rétrocompatibilité avec les produits existants
