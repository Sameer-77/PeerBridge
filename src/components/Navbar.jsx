// import React, { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../contexts/AuthContext'
// import {
//   BookOpen,
//   User,
//   LogOut,
//   Menu,
//   X,
//   Plus,
//   MessageCircle,
//   BarChart3,
//   Moon,
//   Sun
// } from 'lucide-react'

// const Navbar = () => {
//   const { user, logout } = useAuth()
//   const navigate = useNavigate()
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//   const [scrolled, setScrolled] = useState(false)
//   const [darkMode, setDarkMode] = useState(() => {
//     return localStorage.getItem('darkMode') === 'true' ||
//       (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
//   })

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 10)
//     }

//     window.addEventListener('scroll', handleScroll)
//     return () => window.removeEventListener('scroll', handleScroll)
//   }, [])

//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add('dark')
//       localStorage.setItem('darkMode', 'true')
//     } else {
//       document.documentElement.classList.remove('dark')
//       localStorage.setItem('darkMode', 'false')
//     }
//   }, [darkMode])

//   const handleLogout = () => {
//     logout()
//     navigate('/')
//     setIsMenuOpen(false)
//   }

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen)
//   }

//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode)
//   }

//   return (
//     <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled
//       ? 'bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm shadow-sm'
//       : 'bg-white dark:bg-gray-900 shadow-lg'
//       }`}>
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center space-x-2">
//             <BookOpen className="w-8 h-8 text-primary-500" />
//             <span className="text-xl font-bold text-gray-800 dark:text-white">PeerBridge</span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-6">
//             {user ? (
//               <>
//                 <Link
//                   to="/dashboard"
//                   className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
//                 >
//                   <BarChart3 className="w-4 h-4" />
//                   <span>Dashboard</span>
//                 </Link>

//                 {user.role === 'junior' && (
//                   <Link
//                     to="/post-doubt"
//                     className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
//                   >
//                     <Plus className="w-4 h-4" />
//                     <span>Post Doubt</span>
//                   </Link>
//                 )}

//                 <Link
//                   to="/messages"
//                   className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
//                 >
//                   <MessageCircle className="w-4 h-4" />
//                   <span>Messages</span>
//                 </Link>

//                 <Link
//                   to="/profile"
//                   className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
//                 >
//                   <User className="w-4 h-4" />
//                   <span>Profile</span>
//                 </Link>

//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm text-gray-600 dark:text-gray-400">
//                     {user.name.split(' ')[0]}
//                   </span>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'senior'
//                     ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
//                     : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
//                     }`}>
//                     {user.role}
//                   </span>
//                 </div>

//                 <button
//                   onClick={toggleDarkMode}
//                   className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
//                 >
//                   {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//                 </button>

//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   <span>Logout</span>
//                 </button>
//               </>
//             ) : (
//               <div className="flex items-center space-x-4">
//                 <Link
//                   to="/login"
//                   className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   to="/register"
//                   className="btn-primary px-4 py-2"
//                 >
//                   Register
//                 </Link>
//                 <button
//                   onClick={toggleDarkMode}
//                   className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
//                 >
//                   {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Mobile menu button */}
//           <div className="flex items-center gap-4 md:hidden">
//             <button
//               onClick={toggleDarkMode}
//               className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
//             >
//               {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//             </button>
//             <button
//               onClick={toggleMenu}
//               className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
//             >
//               {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {isMenuOpen && (
//           <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
//             {user ? (
//               <div className="flex flex-col space-y-3">
//                 <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
//                   <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
//                   <p className={`text-xs font-medium ${user.role === 'senior'
//                     ? 'text-green-600 dark:text-green-400'
//                     : 'text-blue-600 dark:text-blue-400'
//                     }`}>
//                     {user.role}
//                   </p>
//                 </div>

//                 <Link
//                   to="/dashboard"
//                   className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   <BarChart3 className="w-4 h-4" />
//                   <span>Dashboard</span>
//                 </Link>

//                 {user.role === 'junior' && (
//                   <Link
//                     to="/post-doubt"
//                     className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <Plus className="w-4 h-4" />
//                     <span>Post Doubt</span>
//                   </Link>
//                 )}

//                 <Link
//                   to="/messages"
//                   className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   <MessageCircle className="w-4 h-4" />
//                   <span>Messages</span>
//                 </Link>

//                 <Link
//                   to="/profile"
//                   className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   <User className="w-4 h-4" />
//                   <span>Profile</span>
//                 </Link>

//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   <span>Logout</span>
//                 </button>
//               </div>
//             ) : (
//               <div className="flex flex-col space-y-3">
//                 <Link
//                   to="/login"
//                   className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   to="/register"
//                   className="btn-primary px-4 py-2 text-center"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Register
//                 </Link>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </nav>
//   )
// }

// export default Navbar


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  MessageCircle,
  BarChart3,
  Moon,
  Sun
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' ||
      (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <nav className={`fixed w-full top-0 z-40 transition-all duration-300 ${scrolled
      ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm'
      : 'bg-white dark:bg-gray-900 shadow-lg'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">PeerBridge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {user.role === 'junior' && (
                  <Link
                    to="/post-doubt"
                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Doubt</span>
                  </Link>
                )}

                <Link
                  to="/messages"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Messages</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'senior'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}>
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={toggleDarkMode}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-4 py-2"
                >
                  Register
                </Link>
                <button
                  onClick={toggleDarkMode}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <div className="flex flex-col space-y-3">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
                  <p className={`text-xs font-medium ${user.role === 'senior'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                    }`}>
                    {user.role}
                  </p>
                </div>

                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {user.role === 'junior' && (
                  <Link
                    to="/post-doubt"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Doubt</span>
                  </Link>
                )}

                <Link
                  to="/messages"
                  className={`flex items-center space-x-1 ${location.pathname.startsWith('/messages')
                    ? 'text-primary-500 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400'
                    } transition-colors`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Messages</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-4 py-2 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;