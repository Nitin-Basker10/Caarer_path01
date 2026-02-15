// ============================================
// routes/career.routes.js
// ============================================

const express = require('express');
const router = express.Router();

// Mock career paths data
const careerPaths = [
  {
    id: 'frontend-dev',
    name: 'Frontend Development',
    description: 'Build beautiful, responsive user interfaces',
    icon: '💻',
    matchPercentage: 92,
    difficulty: 'Beginner',
    duration: '6-12 months',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS'],
    tools: ['VS Code', 'Git', 'Figma', 'Chrome DevTools', 'npm'],
    careers: ['Frontend Developer', 'UI Engineer', 'Full Stack Developer'],
    averageSalary: {
      min: 600000,
      max: 1500000,
      currency: 'INR'
    }
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Extract insights from data using statistics and ML',
    icon: '📊',
    matchPercentage: 85,
    difficulty: 'Intermediate',
    duration: '8-14 months',
    skills: ['Python', 'Statistics', 'Pandas', 'NumPy', 'Machine Learning', 'SQL'],
    tools: ['Jupyter', 'TensorFlow', 'Tableau', 'Power BI', 'scikit-learn'],
    careers: ['Data Scientist', 'ML Engineer', 'Data Analyst'],
    averageSalary: {
      min: 700000,
      max: 2000000,
      currency: 'INR'
    }
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    description: 'Build intelligent systems and AI applications',
    icon: '🧠',
    matchPercentage: 78,
    difficulty: 'Advanced',
    duration: '10-16 months',
    skills: ['Python', 'Deep Learning', 'NLP', 'Computer Vision', 'PyTorch', 'Neural Networks'],
    tools: ['TensorFlow', 'PyTorch', 'Keras', 'OpenCV', 'Hugging Face'],
    careers: ['ML Engineer', 'AI Researcher', 'Computer Vision Engineer'],
    averageSalary: {
      min: 800000,
      max: 2500000,
      currency: 'INR'
    }
  },
  {
    id: 'backend-dev',
    name: 'Backend Development',
    description: 'Build scalable server-side applications',
    icon: '⚙️',
    matchPercentage: 88,
    difficulty: 'Intermediate',
    duration: '7-12 months',
    skills: ['Node.js', 'Python', 'Databases', 'APIs', 'Docker', 'AWS'],
    tools: ['Express', 'MongoDB', 'PostgreSQL', 'Redis', 'Kubernetes'],
    careers: ['Backend Developer', 'DevOps Engineer', 'Cloud Engineer'],
    averageSalary: {
      min: 650000,
      max: 1800000,
      currency: 'INR'
    }
  }
];

// GET /api/career/paths
router.get('/paths', (req, res) => {
  res.json({ 
    success: true, 
    paths: careerPaths 
  });
});

// GET /api/career/paths/:id
router.get('/paths/:id', (req, res) => {
  const path = careerPaths.find(p => p.id === req.params.id);
  
  if (!path) {
    return res.status(404).json({ error: 'Career path not found' });
  }

  res.json({ 
    success: true, 
    path 
  });
});

// POST /api/career/generate
router.post('/generate', (req, res) => {
  const { interests, skills, mindset } = req.body;
  
  // Simple recommendation logic
  let recommended = [...careerPaths];
  
  // Sort by match percentage
  recommended.sort((a, b) => b.matchPercentage - a.matchPercentage);
  
  // Return top 3
  res.json({
    success: true,
    message: 'Career paths generated',
    recommendedPaths: recommended.slice(0, 3),
    totalPaths: careerPaths.length
  });
});

module.exports = router;