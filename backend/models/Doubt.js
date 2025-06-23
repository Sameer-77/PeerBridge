import mongoose from 'mongoose'

const responseSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
})

const doubtSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responses: [responseSchema],
  images: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  aiAnalysis: {
    suggestedTags: [String],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    estimatedTime: String,
    requiredSkills: [String]
  },
  views: {
    type: Number,
    default: 0
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  downvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
})

// Index for search functionality
doubtSchema.index({ title: 'text', description: 'text', tags: 'text' })

// Calculate net votes
doubtSchema.virtual('netVotes').get(function () {
  return this.upvotes.length - this.downvotes.length
})

export default mongoose.model('Doubt', doubtSchema)