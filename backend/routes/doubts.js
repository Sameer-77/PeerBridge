import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { auth, authorize } from '../middleware/auth.js'
import Doubt from '../models/Doubt.js'
import User from '../models/User.js'
import { analyzeDoubtWithAI } from '../services/aiService.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/doubts'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Get all doubts (for seniors) or user's doubts (for juniors)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, tags, search } = req.query

    let query = {}

    // Filter by status
    if (status && status !== 'all') {
      query.status = status
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim())
      query.tags = { $in: tagArray }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    const doubts = await Doubt.find(query)
      .populate('postedBy', 'name email role')
      .populate('claimedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Doubt.countDocuments(query)

    res.json({
      doubts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('Get doubts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's doubts
router.get('/my-doubts', auth, async (req, res) => {
  try {
    const doubts = await Doubt.find({ postedBy: req.user._id })
      .populate('claimedBy', 'name email role')
      .sort({ createdAt: -1 })

    res.json(doubts)
  } catch (error) {
    console.error('Get my doubts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single doubt
router.get('/:id', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('postedBy', 'name email role skills')
      .populate('claimedBy', 'name email role skills')
      .populate('responses.responder', 'name email role')

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' })
    }

    // Increment view count
    doubt.views += 1
    await doubt.save()

    res.json(doubt)
  } catch (error) {
    console.error('Get doubt error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new doubt
router.post('/', auth, authorize('junior'), upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, priority } = req.body
    let { tags } = req.body

    // Parse tags if it's a string
    if (typeof tags === 'string') {
      tags = JSON.parse(tags)
    }

    // Process uploaded images
    const images = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : []

    // Create doubt
    const doubt = new Doubt({
      title,
      description,
      tags: tags || [],
      priority: priority || 'medium',
      postedBy: req.user._id,
      images
    })

    await doubt.save()

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { doubtsPosted: 1 }
    })

    // Analyze with AI in background
    analyzeDoubtWithAI(doubt._id, title, description, tags || [])

    await doubt.populate('postedBy', 'name email role')

    res.status(201).json(doubt)
  } catch (error) {
    console.error('Create doubt error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Claim doubt (seniors only)
router.post('/:id/claim', auth, authorize('senior'), async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' })
    }

    if (doubt.status !== 'open') {
      return res.status(400).json({ message: 'Doubt is not available for claiming' })
    }

    if (doubt.claimedBy) {
      return res.status(400).json({ message: 'Doubt is already claimed' })
    }

    doubt.claimedBy = req.user._id
    doubt.status = 'in_progress'
    await doubt.save()

    await doubt.populate('claimedBy', 'name email role')

    res.json(doubt)
  } catch (error) {
    console.error('Claim doubt error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Add response to doubt
router.post('/:id/response', auth, async (req, res) => {
  try {
    const { content } = req.body
    const doubt = await Doubt.findById(req.params.id)

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' })
    }

    // Check if user can respond
    const canRespond = req.user.role === 'senior' ||
      doubt.postedBy.toString() === req.user._id.toString()

    if (!canRespond) {
      return res.status(403).json({ message: 'Not authorized to respond' })
    }

    const response = {
      content,
      responder: req.user._id
    }

    doubt.responses.push(response)
    await doubt.save()

    await doubt.populate('responses.responder', 'name email role')

    res.json(doubt)
  } catch (error) {
    console.error('Add response error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update doubt status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    const doubt = await Doubt.findById(req.params.id)

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' })
    }

    // Check permissions
    const canUpdate = doubt.postedBy.toString() === req.user._id.toString() ||
      doubt.claimedBy?.toString() === req.user._id.toString()

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update status' })
    }

    doubt.status = status

    // Update user stats if resolved
    if (status === 'resolved') {
      await User.findByIdAndUpdate(doubt.postedBy, {
        $inc: { doubtsResolved: 1, points: 10 }
      })

      if (doubt.claimedBy) {
        await User.findByIdAndUpdate(doubt.claimedBy, {
          $inc: { doubtsHelped: 1, points: 20 }
        })
      }
    }

    await doubt.save()
    res.json(doubt)
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Vote on doubt
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { type } = req.body // 'up' or 'down'
    const doubt = await Doubt.findById(req.params.id)

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' })
    }

    // Remove existing votes by this user
    doubt.upvotes = doubt.upvotes.filter(vote => vote.user.toString() !== req.user._id.toString())
    doubt.downvotes = doubt.downvotes.filter(vote => vote.user.toString() !== req.user._id.toString())

    // Add new vote
    if (type === 'up') {
      doubt.upvotes.push({ user: req.user._id })
    } else if (type === 'down') {
      doubt.downvotes.push({ user: req.user._id })
    }

    await doubt.save()
    res.json({
      upvotes: doubt.upvotes.length,
      downvotes: doubt.downvotes.length,
      netVotes: doubt.upvotes.length - doubt.downvotes.length
    })
  } catch (error) {
    console.error('Vote error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router