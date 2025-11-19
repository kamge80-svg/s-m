-- Ajouter un champ pour la description courte (feed)
-- La description existante devient la description complète (profil)

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Commentaires pour clarifier l'usage
COMMENT ON COLUMN products.description IS 'Description complète du produit (affichée dans le profil et la page de détail)';
COMMENT ON COLUMN products.short_description IS 'Description courte/accroche (affichée dans le feed, optionnelle)';

-- Si short_description est null, on utilise description dans le feed
-- Cela permet la rétrocompatibilité avec les produits existants
