// import mongoose from 'mongoose'
// import bcrypt from 'bcryptjs'

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   role: {
//     type: String,
//     enum: ['junior', 'senior'],
//     required: true
//   },
//   skills: [{
//     type: String,
//     trim: true
//   }],
//   bio: {
//     type: String,
//     trim: true
//   },
//   points: {
//     type: Number,
//     default: 0
//   },
//   doubtsPosted: {
//     type: Number,
//     default: 0
//   },
//   doubtsResolved: {
//     type: Number,
//     default: 0
//   },
//   doubtsHelped: {
//     type: Number,
//     default: 0
//   },
//   rating: {
//     type: Number,
//     default: 0
//   },
//   totalRatings: {
//     type: Number,
//     default: 0
//   },
//   isOnline: {
//     type: Boolean,
//     default: false
//   },
//   lastSeen: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// })

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next()

//   try {
//     const salt = await bcrypt.genSalt(10)
//     this.password = await bcrypt.hash(this.password, salt)
//     next()
//   } catch (error) {
//     next(error)
//   }
// })

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password)
// }

// // Calculate average rating
// userSchema.methods.calculateAverageRating = function() {
//   if (this.totalRatings === 0) return 0
//   return this.rating / this.totalRatings
// }

// export default mongoose.model('User', userSchema)


// models/User.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['junior', 'senior'],
    default: 'junior'
  },
  skills: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 0
  },
  doubtsPosted: {
    type: Number,
    default: 0
  },
  doubtsResolved: {
    type: Number,
    default: 0
  },
  doubtsHelped: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) {
    return false
  }
  return await bcrypt.compare(enteredPassword, this.password)
}

// Calculate average rating
userSchema.methods.calculateAverageRating = function () {
  return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0
}

export default mongoose.model('User', userSchema)