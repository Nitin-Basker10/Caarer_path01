// ============================================
// models/User.js
// ============================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Educational Information
  college: {
    type: String,
    required: [true, 'College is required'],
    trim: true
  },
  
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    enum: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'IT', 'Other']
  },
  
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1,
    max: 4
  },
  
  // Gamification
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Career Path
  selectedPath: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerPath',
    default: null
  },
  
  mindset: {
    type: String,
    enum: ['confused', 'stressed', 'motivated', 'goal', null],
    default: null
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ level: -1 });

// Virtual: Progress to next level
userSchema.virtual('levelProgress').get(function() {
  const XP_PER_LEVEL = 1000;
  const currentLevelXP = this.xp % XP_PER_LEVEL;
  return Math.round((currentLevelXP / XP_PER_LEVEL) * 100);
});

// Virtual: XP needed for next level
userSchema.virtual('nextLevelXP').get(function() {
  const XP_PER_LEVEL = 1000;
  const currentLevelXP = this.xp % XP_PER_LEVEL;
  return XP_PER_LEVEL - currentLevelXP;
});

// Pre-save middleware
userSchema.pre('save', function(next) {
  this.lastActive = Date.now();
  
  // Auto-calculate level from XP
  const XP_PER_LEVEL = 1000;
  const calculatedLevel = Math.floor(this.xp / XP_PER_LEVEL) + 1;
  if (calculatedLevel > this.level) {
    this.level = calculatedLevel;
  }
  
  next();
});

// Instance method: Add XP
userSchema.methods.addXP = function(amount) {
  this.xp += amount;
  const XP_PER_LEVEL = 1000;
  const newLevel = Math.floor(this.xp / XP_PER_LEVEL) + 1;
  const leveledUp = newLevel > this.level;
  
  if (leveledUp) {
    this.level = newLevel;
  }
  
  return { leveledUp, newLevel: this.level, totalXP: this.xp };
};

// Static method: Find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);