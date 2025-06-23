import express from 'express'
import { auth } from '../middleware/auth.js'
import Chat from '../models/Chat.js'
import Doubt from '../models/Doubt.js'

const router = express.Router()

// Get or create chat for a doubt
router.get('/doubt/:doubtId', auth, async (req, res) => {
  try {
    const { doubtId } = req.params

    // Verify doubt exists and user has access
    const doubt = await Doubt.findById(doubtId)
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' })
    }

    // Check if user is authorized to access this chat
    const isAuthorized = doubt.postedBy.toString() === req.user._id.toString() ||
      doubt.claimedBy?.toString() === req.user._id.toString()

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to access this chat' })
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({ doubt: doubtId })
      .populate('participants', 'name email role')
      .populate('messages.sender', 'name email role')

    if (!chat) {
      // Create new chat
      const participants = [doubt.postedBy]
      if (doubt.claimedBy) {
        participants.push(doubt.claimedBy)
      }

      chat = new Chat({
        doubt: doubtId,
        participants,
        messages: []
      })

      await chat.save()
      await chat.populate('participants', 'name email role')
    }

    res.json(chat)
  } catch (error) {
    console.error('Get chat error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Send message
router.post('/doubt/:doubtId/message', auth, async (req, res) => {
  try {
    const { doubtId } = req.params
    const { content, messageType = 'text' } = req.body

    // Find chat
    const chat = await Chat.findOne({ doubt: doubtId })
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      participant => participant.toString() === req.user._id.toString()
    )

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to send messages' })
    }

    // Add message
    const message = {
      content,
      sender: req.user._id,
      messageType
    }

    chat.messages.push(message)
    chat.lastMessage = new Date()
    await chat.save()

    // Populate the new message
    await chat.populate('messages.sender', 'name email role')

    // Get the newly added message
    const newMessage = chat.messages[chat.messages.length - 1]

    res.json(newMessage)
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Mark messages as read
router.put('/doubt/:doubtId/read', auth, async (req, res) => {
  try {
    const { doubtId } = req.params

    const chat = await Chat.findOne({ doubt: doubtId })
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    // Mark all messages not sent by current user as read
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user._id.toString()) {
        message.isRead = true
      }
    })

    await chat.save()
    res.json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get user's active chats
router.get('/my-chats', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true
    })
      .populate('doubt', 'title status')
      .populate('participants', 'name email role')
      .sort({ lastMessage: -1 })

    // Add unread count for each chat
    const chatsWithUnread = chats.map(chat => {
      const unreadCount = chat.messages.filter(
        message => message.sender.toString() !== req.user._id.toString() && !message.isRead
      ).length

      return {
        ...chat.toObject(),
        unreadCount,
        lastMessagePreview: chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1].content.substring(0, 50) + '...'
          : 'No messages yet'
      }
    })

    res.json(chatsWithUnread)
  } catch (error) {
    console.error('Get my chats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router