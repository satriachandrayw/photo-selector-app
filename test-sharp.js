import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const BASE_DIR = '/home/satria/Downloads/';
const testFile = path.join(BASE_DIR, 'IMG_6440.JPEG'); // Replace with an actual image file name

console.log('Testing file:', testFile);
console.log('File exists:', fs.existsSync(testFile));

sharp(testFile)
  .resize(100, 100)
  .toBuffer((err, buffer) => {
    if (err) {
      console.error('Sharp error:', err);
    } else {
      console.log('Thumbnail generated successfully');
    }
  });
