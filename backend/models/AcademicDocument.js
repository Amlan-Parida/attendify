const mongoose = require('mongoose');

const academicDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
    },
    extractedText: {
      type: String,
      required: [true, 'Extracted text is required'],
    },
    summary: {
      overview: { type: String },
      takeaways: [{ type: String }],
      sentiment: { type: String },
      readingTime: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AcademicDocument', academicDocumentSchema);
