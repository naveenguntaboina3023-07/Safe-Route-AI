const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createReport, getApprovedReports, getMyReports,
  getReport, updateReport, deleteReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// Multer config for optional image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed (jpeg, jpg, png, webp).'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB

router.get('/',      protect, getApprovedReports);
router.post('/',     protect, upload.single('image'), createReport);
router.get('/my',    protect, getMyReports);
router.get('/:id',  protect, getReport);
router.put('/:id',  protect, upload.single('image'), updateReport);
router.delete('/:id', protect, deleteReport);

module.exports = router;
