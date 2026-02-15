// ============================================
// routes/opportunity.routes.js
// ============================================

const express = require('express');
const router = express.Router();

// Mock opportunities data
const opportunities = [
  {
    id: 1,
    type: 'Internship',
    title: 'Frontend Developer Intern',
    company: 'TechCorp India',
    description: 'Work on React applications and modern web technologies',
    skills: ['React', 'JavaScript', 'CSS', 'Git'],
    difficulty: 'Intermediate',
    duration: '3 months',
    stipend: '₹15,000/month',
    location: 'Remote',
    deadline: '2024-03-30',
    applyLink: 'https://example.com/apply'
  },
  {
    id: 2,
    type: 'Hackathon',
    title: 'Smart India Hackathon 2024',
    company: 'Government of India',
    description: 'National level hackathon to solve real-world problems',
    skills: ['Full Stack', 'Problem Solving', 'Innovation'],
    difficulty: 'All Levels',
    duration: '3 days',
    prize: '₹1,00,000',
    location: 'Multiple Cities',
    deadline: '2024-03-15',
    applyLink: 'https://sih.gov.in'
  },
  {
    id: 3,
    type: 'Internship',
    title: 'Data Science Intern',
    company: 'Analytics Pro',
    description: 'Work with real datasets and ML models',
    skills: ['Python', 'Pandas', 'Machine Learning'],
    difficulty: 'Intermediate',
    duration: '6 months',
    stipend: '₹20,000/month',
    location: 'Hybrid (Bangalore)',
    deadline: '2024-04-10',
    applyLink: 'https://example.com/apply'
  },
  {
    id: 4,
    type: 'Project',
    title: 'Open Source Contribution',
    company: 'Various Organizations',
    description: 'Contribute to popular open source projects',
    skills: ['Git', 'GitHub', 'Any Programming Language'],
    difficulty: 'Beginner',
    duration: 'Ongoing',
    stipend: 'Free',
    location: 'Remote',
    deadline: null,
    applyLink: 'https://github.com'
  },
  {
    id: 5,
    type: 'Challenge',
    title: '30 Days of Code',
    company: 'HackerRank',
    description: 'Daily coding challenges to improve skills',
    skills: ['DSA', 'Problem Solving'],
    difficulty: 'All Levels',
    duration: '30 days',
    prize: 'Certificate',
    location: 'Online',
    deadline: null,
    applyLink: 'https://hackerrank.com'
  }
];

// GET /api/opportunities
router.get('/', (req, res) => {
  const { type, difficulty, skills } = req.query;
  
  let filtered = [...opportunities];
  
  // Filter by type
  if (type && type !== 'all') {
    filtered = filtered.filter(opp => opp.type === type);
  }
  
  // Filter by difficulty
  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter(opp => 
      opp.difficulty === difficulty || opp.difficulty === 'All Levels'
    );
  }
  
  // Filter by skills
  if (skills) {
    const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
    filtered = filtered.filter(opp => 
      opp.skills.some(skill => 
        skillsArray.includes(skill.toLowerCase())
      )
    );
  }

  res.json({ 
    success: true, 
    opportunities: filtered,
    total: filtered.length
  });
});

// GET /api/opportunities/:id
router.get('/:id', (req, res) => {
  const opportunity = opportunities.find(o => o.id === parseInt(req.params.id));
  
  if (!opportunity) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  res.json({ 
    success: true, 
    opportunity 
  });
});

module.exports = router;