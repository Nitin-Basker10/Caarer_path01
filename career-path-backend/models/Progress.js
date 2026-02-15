// ============================================
// models/Progress.js
// ============================================

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Skills Tracking
  skills: {
    completed: [{
      name: String,
      completedAt: { type: Date, default: Date.now },
      xpEarned: { type: Number, default: 100 }
    }],
    inProgress: [{
      name: String,
      progress: { type: Number, min: 0, max: 100, default: 0 },
      startedAt: { type: Date, default: Date.now },
      lastUpdated: { type: Date, default: Date.now }
    }],
    pending: [String]
  },
  
  // Current Level Category
  currentLevel: {
    type: String,
    enum: ['Beginner', 'Junior', 'Mid-Level', 'Senior'],
    default: 'Beginner'
  },
  
  // Streak Tracking
  streak: {
    days: { type: Number, default: 0 },
    lastUpdated: Date,
    longestStreak: { type: Number, default: 0 }
  },
  
  // Weekly Goals
  weeklyGoal: {
    target: { type: Number, default: 2 },
    completed: { type: Number, default: 0 },
    weekStart: {
      type: Date,
      default: () => {
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);
        monday.setHours(0, 0, 0, 0);
        return monday;
      }
    }
  },
  
  // Milestones
  milestones: [{
    name: String,
    description: String,
    achievedAt: { type: Date, default: Date.now },
    xpEarned: Number
  }],
  
  // Cached Statistics
  stats: {
    totalSkillsCompleted: { type: Number, default: 0 },
    totalXPEarned: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Pre-save middleware
progressSchema.pre('save', function(next) {
  this.stats.lastActivityDate = Date.now();
  this.stats.totalSkillsCompleted = this.skills.completed.length;
  this.stats.totalXPEarned = this.skills.completed.reduce((sum, skill) => {
    return sum + (skill.xpEarned || 100);
  }, 0);
  next();
});

// Update streak
progressSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastUpdate = this.streak.lastUpdated;
  
  if (!lastUpdate) {
    this.streak.days = 1;
    this.streak.lastUpdated = now;
    this.streak.longestStreak = 1;
    return;
  }

  const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate < 24) {
    return; // Same day
  } else if (hoursSinceUpdate < 48) {
    this.streak.days += 1;
    this.streak.lastUpdated = now;
    this.streak.longestStreak = Math.max(this.streak.longestStreak, this.streak.days);
  } else {
    this.streak.days = 1;
    this.streak.lastUpdated = now;
  }
};

// Check weekly reset
progressSchema.methods.checkWeeklyReset = function() {
  const now = new Date();
  const daysSinceStart = (now - this.weeklyGoal.weekStart) / (1000 * 60 * 60 * 24);
  
  if (daysSinceStart >= 7) {
    this.weeklyGoal.completed = 0;
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    this.weeklyGoal.weekStart = monday;
    return true;
  }
  return false;
};

// Complete a skill
progressSchema.methods.completeSkill = function(skillName, xpEarned = 100) {
  // Remove from inProgress and pending
  this.skills.inProgress = this.skills.inProgress.filter(s => s.name !== skillName);
  this.skills.pending = this.skills.pending.filter(s => s !== skillName);
  
  // Check if already completed
  const alreadyCompleted = this.skills.completed.some(s => s.name === skillName);
  
  if (!alreadyCompleted) {
    this.skills.completed.push({
      name: skillName,
      completedAt: new Date(),
      xpEarned
    });
    
    this.checkWeeklyReset();
    this.weeklyGoal.completed += 1;
    this.updateStreak();
    
    return { completed: true, xpEarned };
  }
  
  return { completed: false, message: 'Skill already completed' };
};

module.exports = mongoose.model('Progress', progressSchema);