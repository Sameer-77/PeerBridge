import Chat from '../models/Chat.js'
import User from '../models/User.js'

const connectedUsers = new Map()

export const handleConnection = (socket, io) => {
  console.log('User connected:', socket.id)

  // Handle user joining
  socket.on('join', async (userId) => {
    try {
      connectedUsers.set(userId, socket.id)
      socket.userId = userId

      // Update user online status
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date()
      })

      // Emit updated online users list
      const onlineUsers = Array.from(connectedUsers.keys())
      io.emit('getOnlineUsers', onlineUsers)

      console.log(`User ${userId} joined`)
    } catch (error) {
      console.error('Join error:', error)
    }
  })

  // Handle joining chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId)
    console.log(`User ${socket.userId} joined chat ${chatId}`)
  })

  // Handle leaving chat room
  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId)
    console.log(`User ${socket.userId} left chat ${chatId}`)
  })

  // Handle sending message
  socket.on('sendMessage', async (data) => {
    try {
      const { chatId, content, messageType = 'text' } = data

      // Find chat and verify user is participant
      const chat = await Chat.findById(chatId)
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' })
        return
      }

      const isParticipant = chat.participants.some(
        participant => participant.toString() === socket.userId
      )

      if (!isParticipant) {
        socket.emit('error', { message: 'Not authorized' })
        return
      }

      // Add message to chat
      const message = {
        content,
        sender: socket.userId,
        messageType,
        createdAt: new Date()
      }

      chat.messages.push(message)
      chat.lastMessage = new Date()
      await chat.save()

      // Populate sender info
      await chat.populate('messages.sender', 'name email role')
      const newMessage = chat.messages[chat.messages.length - 1]

      // Emit message to all participants in the chat room
      io.to(chatId).emit('newMessage', {
        chatId,
        message: newMessage
      })

      // Send notification to offline users
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== socket.userId && !connectedUsers.has(participantId.toString())) {
          // TODO: Send push notification or email
          console.log(`Sending notification to offline user ${participantId}`)
        }
      })

    } catch (error) {
      console.error('Send message error:', error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { chatId, isTyping } = data
    socket.to(chatId).emit('userTyping', {
      userId: socket.userId,
      isTyping
    })
  })

  // Handle doubt updates
  socket.on('doubtUpdate', (data) => {
    const { doubtId, update } = data
    socket.broadcast.emit('doubtUpdated', {
      doubtId,
      update
    })
  })

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      if (socket.userId) {
        connectedUsers.delete(socket.userId)

        // Update user offline status
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        })

        // Emit updated online users list
        const onlineUsers = Array.from(connectedUsers.keys())
        io.emit('getOnlineUsers', onlineUsers)

        console.log(`User ${socket.userId} disconnected`)
      }
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  })
}

export { connectedUsers }