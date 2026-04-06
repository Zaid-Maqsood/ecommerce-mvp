const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// POST /api/upload/image — admin only
router.post('/image', auth, admin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image provided' });
  const url = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
