// ============================================
// routes/progress.routes.js
// ============================================

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');
const User = require('../models/User');

// GET /api/progress
router.get('/', auth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.userId });

    if (!progress) {
      progress = new Progress({
        userId: req.userId,
        skills: { completed: [], inProgress: [], pending: [] }
      });
      await progress.save();
    }

    progress.checkWeeklyReset();
    await progress.save();

    res.json({ 
      success: true, 
      progress 
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/progress/complete-skill
router.post('/complete-skill', auth, async (req, res) => {
  try {
    const { skillName } = req.body;

    if (!skillName) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const progress = await Progress.findOne({ userId: req.userId });
    
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const XP_EARNED = 100;
    const result = progress.completeSkill(skillName, XP_EARNED);

    if (!result.completed) {
      return res.status(400).json({ error: result.message });
    }

    await progress.save();

    // Update user XP
    const user = await User.findById(req.userId);
    const xpResult = user.addXP(XP_EARNED);
    await user.save();

    res.json({
      success: true,
      message: `Skill "${skillName}" completed!`,
      xpEarned: XP_EARNED,
      levelUp: xpResult.leveledUp ? {
        oldLevel: xpResult.newLevel - 1,
        newLevel: xpResult.newLevel,
        message: `🎉 Level Up! You're now level ${xpResult.newLevel}!`
      } : null,
      streak: {
        days: progress.streak.days,
        message: `🔥 ${progress.streak.days} day streak!`
      },
      weeklyProgress: {
        completed: progress.weeklyGoal.completed,
        target: progress.weeklyGoal.target
      },
      progress: progress.skills,
      user: {
        level: user.level,
        xp: user.xp
      }
    });
  } catch (error) {
    console.error('Complete skill error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/progress/start-skill
router.post('/start-skill', auth, async (req, res) => {
  try {
    const { skillName } = req.body;

    if (!skillName) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const progress = await Progress.findOne({ userId: req.userId });
    
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    // Remove from pending
    progress.skills.pending = progress.skills.pending.filter(s => s !== skillName);
    
    // Add to inProgress
    const exists = progress.skills.inProgress.some(s => s.name === skillName);
    if (!exists) {
      progress.skills.inProgress.push({
        name: skillName,
        progress: 0,
        startedAt: new Date()
      });
    }
    
    await progress.save();

    res.json({ 
      success: true, 
      message: `Started learning ${skillName}`,
      progress: progress.skills 
    });
  } catch (error) {
    console.error('Start skill error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/progress/update-skill
router.put('/update-skill', auth, async (req, res) => {
  try {
    const { skillName, progressValue } = req.body;

    if (!skillName || progressValue === undefined) {
      return res.status(400).json({ 
        error: 'Skill name and progress value required' 
      });
    }

    const progress = await Progress.findOne({ userId: req.userId });
    
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const skill = progress.skills.inProgress.find(s => s.name === skillName);
    
    if (skill) {
      skill.progress = Math.min(100, Math.max(0, progressValue));
      skill.lastUpdated = new Date();
      await progress.save();
      
      res.json({
        success: true,
        message: 'Progress updated',
        skill
      });
    } else {
      res.status(404).json({ error: 'Skill not found in progress' });
    }
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/progress/add-skills
router.post('/add-skills', auth, async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills array required' });
    }

    const progress = await Progress.findOne({ userId: req.userId });
    
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const added = [];
    skills.forEach(skillName => {
      const exists = 
        progress.skills.completed.some(s => s.name === skillName) ||
        progress.skills.inProgress.some(s => s.name === skillName) ||
        progress.skills.pending.includes(skillName);
      
      if (!exists) {
        progress.skills.pending.push(skillName);
        added.push(skillName);
      }
    });

    await progress.save();

    res.json({
      success: true,
      message: `Added ${added.length} skills`,
      added,
      progress: progress.skills
    });
  } catch (error) {
    console.error('Add skills error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/progress/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [progress, user] = await Promise.all([
      Progress.findOne({ userId: req.userId }),
      User.findById(req.userId)
    ]);

    if (!progress || !user) {
      return res.status(404).json({ error: 'Data not found' });
    }

    const totalSkills = 
      progress.skills.completed.length +
      progress.skills.inProgress.length +
      progress.skills.pending.length;

    const completionRate = totalSkills > 0
      ? Math.round((progress.skills.completed.length / totalSkills) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        completedSkills: progress.skills.completed.length,
        inProgressSkills: progress.skills.inProgress.length,
        pendingSkills: progress.skills.pending.length,
        totalSkills,
        completionRate,
        currentStreak: progress.streak.days,
        longestStreak: progress.streak.longestStreak,
        level: user.level,
        xp: user.xp,
        levelProgress: user.levelProgress,
        nextLevelXP: user.nextLevelXP,
        currentLevel: progress.currentLevel,
        weeklyGoal: {
          target: progress.weeklyGoal.target,
          completed: progress.weeklyGoal.completed,
          percentage: Math.round(
            (progress.weeklyGoal.completed / progress.weeklyGoal.target) * 100
          )
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;