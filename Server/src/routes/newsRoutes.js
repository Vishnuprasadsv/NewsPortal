import express from 'express';
import { 
  getNews, 
  getAdminNews,
  getNewsById, 
  createNews, 
  updateNews, 
  deleteNews 
} from '../controllers/newsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getNews)
  .post(protect, createNews);

router.route('/admin')
  .get(protect, getAdminNews);

router.route('/:id')
  .get(getNewsById)
  .put(protect, updateNews)
  .delete(protect, deleteNews);

export default router;
