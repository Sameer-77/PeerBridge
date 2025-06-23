import express from 'express'
import { auth } from '../middleware/auth.js'
import User from '../models/User.js'
import Doubt from '../models/Doubt.js'

const router = express.Router()

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id
    
    // Get user's basic stats
    const user = await User.findById(userId).select('doubtsPosted doubtsResolved doubtsHelped points')
    
    // Get additional stats based on role
    let stats = {
      totalPoints: user.points,
      doubtsPosted: user.doubtsPosted,
      doubtsResolved: user.doubtsResolved,
      doubtsHelped: user.doubtsHelped
    }
    
    if (req.user.role === 'junior') {
      // For juniors, get their doubt statistics
      const doubtStats = await Doubt.aggregate([
        { $match: { postedBy: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
      
      stats.totalDoubts = user.doubtsPosted
      stats.openDoubts = doubtStats.find(s => s._id === 'open')?.count || 0
      stats.inProgressDoubts = doubtStats.find(s => s._id === 'in_progress')?.count || 0
      stats.resolvedDoubts = doubtStats.find(s => s._id === 'resolved')?.count || 0
    } else {
      // For seniors, get doubts they've helped with
      const helpedStats = await Doubt.aggregate([
        { $match: { claimedBy: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
      
      const totalHelpedDoubts = await Doubt.countDocuments({ claimedBy: userId })
      
      stats.totalDoubts = totalHelpedDoubts
      stats.inProgressDoubts = helpedStats.find(s => s._id === 'in_progress')?.count || 0
      stats.resolvedDoubts = helpedStats.find(s => s._id === 'resolved')?.count || 0
      stats.openDoubts = 0 // Seniors don't have "open" doubts they're working on
    }
    
    res.json(stats)
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user profile
router.get('/profile/:id?', auth, async (req, res) => {
  try {
    const userId = req.params.id || req.user._id
    
    const user = await User.findById(userId).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Get user's activity stats
    const doubtsPosted = await Doubt.countDocuments({ postedBy: userId })
    const doubtsHelped = await Doubt.countDocuments({ claimedBy: userId })
    const doubtsResolved = await Doubt.countDocuments({ 
      postedBy: userId, 
      status: 'resolved' 
    })
    
    const profile = {
      ...user.toObject(),
      stats: {
        doubtsPosted,
        doubtsHelped,
        doubtsResolved,
        averageRating: user.calculateAverageRating()
      }
    }
    
    res.json(profile)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, skills } = req.body
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || req.user.name,
        bio: bio || req.user.bio,
        skills: skills || req.user.skills
      },
      { new: true, runValidators: true }
    ).select('-password')
    
    res.json(updatedUser)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { type = 'points', limit = 10 } = req.query
    
    let sortField = 'points'
    if (type === 'doubts_helped') sortField = 'doubtsHelped'
    if (type === 'doubts_resolved') sortField = 'doubtsResolved'
    
    const users = await User.find({ role: 'senior' })
      .select('name email role points doubtsHelped doubtsResolved rating totalRatings')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user.toObject(),
      averageRating: user.calculateAverageRating()
    }))
    
    res.json(leaderboard)
  } catch (error) {
    console.error('Get leaderboard error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Rate a user (after doubt resolution)
router.post('/rate/:userId', auth, async (req, res) => {
  try {
    const { rating, doubtId } = req.body
    const userToRate = await User.findById(req.params.userId)
    
    if (!userToRate) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Verify that the rating is valid
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }
    
    // Verify that the user can rate (must be involved in the doubt)
    const doubt = await Doubt.findById(doubtId)
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' })
    }
    
    const canRate = doubt.postedBy.toString() === req.user._id.toString() ||
                   doubt.claimedBy?.toString() === req.user._id.toString()
    
    if (!canRate) {
      return res.status(403).json({ message: 'Not authorized to rate this user' })
    }
    
    // Update user rating
    userToRate.rating += rating
    userToRate.totalRatings += 1
    await userToRate.save()
    
    res.json({ 
      message: 'Rating submitted successfully',
      averageRating: userToRate.calculateAverageRating()
    })
  } catch (error) {
    console.error('Rate user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router