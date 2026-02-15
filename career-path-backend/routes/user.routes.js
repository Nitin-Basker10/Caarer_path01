// ============================================
// routes/user.routes.js
// ============================================

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('selectedPath');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, college, branch, year } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (college) user.college = college;
    if (branch) user.branch = branch;
    if (year) user.year = parseInt(year);

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        branch: user.branch,
        year: user.year
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/mindset
router.put('/mindset', auth, async (req, res) => {
  try {
    const { mindset } = req.body;

    if (!['confused', 'stressed', 'motivated', 'goal'].includes(mindset)) {
      return res.status(400).json({ error: 'Invalid mindset type' });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.mindset = mindset;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Mindset updated',
      mindset: user.mindset 
    });
  } catch (error) {
    console.error('Update mindset error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/select-path
router.put('/select-path', auth, async (req, res) => {
  try {
    const { pathId } = req.body;

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.selectedPath = pathId;
    await user.save();

    res.json({
      success: true,
      message: 'Career path selected',
      selectedPath: pathId
    });
  } catch (error) {
    console.error('Select path error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;