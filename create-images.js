const fs = require('fs');
const path = require('path');

const images = [
    'logo_skipro.png',
    'product-ski.jpg', 
    'product-gym.jpg',
    'resort-manzherok.jpg',
    'resort-kirovsk.jpg',
    'resort-sakhalin.jpg',
    'resort-kamchatka.jpg',
    'resort-abzakovo.jpg',
    'img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg',
    'img6.jpg', 'img7.jpg', 'img8.jpg', 'img9.jpg', 'img10.jpg',
    'img11.jpg', 'img12.jpg'
];

// Создаем простые SVG изображения как заглушки
images.forEach(imageName => {
    const ext = path.extname(imageName);
    const name = path.basename(imageName, ext);
    
    let content = '';
    
    if (ext === '.png' || ext === '.jpg') {
        // Создаем SVG как заглушку
        content = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a6fa4"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="20">
    ${name}
  </text>
</svg>`;
        
        // Сохраняем как SVG
        fs.writeFileSync(`images/${name}.svg`, content);
        console.log(`Создано: images/${name}.svg`);
    }
});

console.log('✅ Все изображения-заглушки созданы!');