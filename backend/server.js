// import express from 'express'
// import mongoose from 'mongoose'
// import cors from 'cors'
// import dotenv from 'dotenv'
// import { createServer } from 'http'
// import { Server } from 'socket.io'
// import path from 'path'
// import { fileURLToPath } from 'url'

// // Routes
// import authRoutes from './routes/auth.js'
// import doubtRoutes from './routes/doubts.js'
// import userRoutes from './routes/users.js'
// import chatRoutes from './routes/chat.js'

// // Socket handlers
// import { handleConnection } from './socket/socketHandlers.js'

// dotenv.config()

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// const app = express()
// const server = createServer(app)
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:3000",
//       'https://your-vercel-app.vercel.app'],
//     methods: ["GET", "POST"]
//   }
// })

// // Middleware
// app.use(cors())
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// // Serve uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// // Make io accessible to routes
// app.use((req, res, next) => {
//   req.io = io
//   next()
// })

// // Routes
// app.use('/api/auth', authRoutes)
// app.use('/api/doubts', doubtRoutes)
// app.use('/api/users', userRoutes)
// app.use('/api/chat', chatRoutes)

// // Socket.IO connection handling
// io.on('connection', (socket) => {
//   handleConnection(socket, io)
// })

// // Connect to MongoDB with better error handling
// // server/server.js

// const connectDB = async () => {
//   try {
//     const mongoURI = process.env.MONGODB_URI;

//     if (!mongoURI) {
//       throw new Error('MONGODB_URI not found in environment variables');
//     }

//     await mongoose.connect(mongoURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 5000, // Timeout after 5s
//     });

//     console.log('✅ MongoDB connected successfully');
//   } catch (error) {
//     console.error('❌ MongoDB connection error:', error.message);
//     process.exit(1); // Exit process with failure
//   }
// };

// // Call this before starting your server
// await connectDB();

// connectDB()

// const PORT = process.env.PORT || 5000

// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`)
// })

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'

// Routes
import authRoutes from './routes/auth.js'
import doubtRoutes from './routes/doubts.js'
import userRoutes from './routes/users.js'
import chatRoutes from './routes/chat.js'

// Socket handlers
import { handleConnection } from './socket/socketHandlers.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://peer-bridge.vercel.app",
  "https://peer-bridge-git-main-sameer-77.vercel.app",
  "https://peer-bridge-sameer-77.vercel.app"
];

const app = express()
const server = createServer(app)

// Apply CORS middleware before other middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

// Other middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/doubts', doubtRoutes)
app.use('/api/users', userRoutes)
app.use('/api/chat', chatRoutes)

// Socket.IO connection handling
io.on('connection', (socket) => {
  handleConnection(socket, io)
})

// Improved MongoDB connection with retry logic
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    // Connection options for better handling
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    };

    // Connection with retry logic
    let retries = 5;
    while (retries) {
      try {
        await mongoose.connect(mongoURI, options);
        console.log('✅ MongoDB connected successfully');
        return;
      } catch (err) {
        console.error(`❌ MongoDB connection error (${retries} retries left):`, err.message);
        retries--;
        await new Promise(res => setTimeout(res, 5000));
      }
    }
    throw new Error('Could not connect to MongoDB after several retries');
  } catch (error) {
    console.error('❌ Fatal MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server function
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🛡️  CORS-enabled for origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

// Start the server
startServer();