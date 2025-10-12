const mongoose = require('mongoose');

const pfeBookSchema = new mongoose.Schema({
  googleDriveId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: 'Unknown Author'
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  summary: {
    type: String,
    default: ''
  },
  keywords: [{
    type: String
  }],
  thumbnailPath: {
    type: String,
    default: ''
  },
  downloadUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

pfeBookSchema.index({ title: 'text', author: 'text', summary: 'text' });
pfeBookSchema.index({ department: 1 });
pfeBookSchema.index({ year: 1 });
pfeBookSchema.index({ keywords: 1 });

module.exports = mongoose.model('PFEBook', pfeBookSchema);
