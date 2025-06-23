import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PostDoubt from './pages/PostDoubt'
import DoubtDetails from './pages/DoubtDetails'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import Messages from './pages/Messages';
function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main className="w-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-doubt"
                  element={
                    <ProtectedRoute>
                      <PostDoubt />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages/:conversationId?"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doubt/:id"
                  element={
                    <ProtectedRoute>
                      <DoubtDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App