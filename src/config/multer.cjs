const multer = require('multer');
const { resolve } = require('node:path');
const { v4 } = require('uuid');

module.exports = {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Apenas imagens são permitidas'));
    }
    callback(null, true);
  },
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'uploads'),
    filename: (_request, file, callback) => {
      const uniqueName = v4().concat(`-${file.originalname}`);
      return callback(null, uniqueName);
    },
  }),
};
