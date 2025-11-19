// Script simple pour créer des icônes placeholder
// Nécessite: npm install canvas

const fs = require('fs');

// Fonction pour créer une icône SVG simple
function createSVGIcon(size) {
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#EAB308;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#22C55E;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">M</text>
</svg>
  `.trim();
}

// Créer les SVG
const svg192 = createSVGIcon(192);
const svg512 = createSVGIcon(512);

// Sauvegarder les SVG (vous pouvez les convertir en PNG avec un outil en ligne)
fs.writeFileSync('public/icon-192.svg', svg192);
fs.writeFileSync('public/icon-512.svg', svg512);

console.log('✅ Icônes SVG créées dans public/');
console.log('📝 Pour convertir en PNG, utilisez :');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - Ou ImageMagick: magick convert icon-192.svg icon-192.png');
