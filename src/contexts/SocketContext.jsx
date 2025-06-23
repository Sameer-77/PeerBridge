import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

// Create context with proper typing
const SocketContext = createContext({
  socket: null,
  onlineUsers: []
})

// Create a separate named provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const socketConnection = io('http://localhost:5000', {
        query: {
          userId: user._id
        }
      })

      setSocket(socketConnection)

      socketConnection.on('getOnlineUsers', (users) => {
        setOnlineUsers(users)
      })

      return () => {
        socketConnection.close()
        setSocket(null)
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
      }
    }
  }, [user])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    socket,
    onlineUsers
  }), [socket, onlineUsers])

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

// Create a named custom hook
export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

// Default export the context itself for direct access if needed
export default SocketContext