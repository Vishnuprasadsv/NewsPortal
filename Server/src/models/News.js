import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Politics', 'Economy', 'Technology', 'Culture', 'Science']
  },
  author: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  imageUrl: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'In-review', 'Published'],
    default: 'Draft'
  },
  scheduleDate: {
    type: Date
  },
  approvedAt: {
    type: Date,
    default: null
  },
  isBreaking: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);
export default News;
