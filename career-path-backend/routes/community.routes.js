// ============================================
// routes/community.routes.js
// ============================================

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Mock posts data (in production, this would be a database)
let posts = [
  {
    id: 1,
    userId: 'mock-user-1',
    author: 'John Doe',
    title: 'How to prepare for technical interviews?',
    content: 'Looking for advice on cracking technical interviews. Any tips on DSA preparation?',
    category: 'career',
    tags: ['interview', 'preparation', 'DSA'],
    replies: 5,
    likes: 12,
    views: 45,
    createdAt: new Date('2024-02-10')
  },
  {
    id: 2,
    userId: 'mock-user-2',
    author: 'Jane Smith',
    title: 'Best resources for learning React?',
    content: 'I\'m starting with React. What are the best tutorials and courses you recommend?',
    category: 'skills',
    tags: ['react', 'frontend', 'learning'],
    replies: 8,
    likes: 20,
    views: 67,
    createdAt: new Date('2024-02-12')
  },
  {
    id: 3,
    userId: 'mock-user-3',
    author: 'Alex Johnson',
    title: 'Internship vs Full-time?',
    content: 'Should I do an internship first or apply for full-time roles directly?',
    category: 'opportunities',
    tags: ['internship', 'career', 'advice'],
    replies: 3,
    likes: 7,
    views: 28,
    createdAt: new Date('2024-02-13')
  }
];

// GET /api/community/posts
router.get('/posts', (req, res) => {
  const { category, search, limit = 20, page = 1 } = req.query;
  
  let filtered = [...posts];
  
  // Filter by category
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  
  // Search
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.content.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedPosts = filtered.slice(startIndex, endIndex);
  
  res.json({ 
    success: true, 
    posts: paginatedPosts,
    pagination: {
      total: filtered.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(filtered.length / limit)
    }
  });
});

// GET /api/community/posts/:id
router.get('/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  // Increment views
  post.views += 1;

  res.json({ 
    success: true, 
    post 
  });
});

// POST /api/community/posts
router.post('/posts', auth, (req, res) => {
  const { title, content, category, tags } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ 
      error: 'Title and content are required' 
    });
  }

  const newPost = {
    id: posts.length + 1,
    userId: req.userId,
    author: req.user.name,
    title,
    content,
    category: category || 'general',
    tags: tags || [],
    replies: 0,
    likes: 0,
    views: 0,
    createdAt: new Date()
  };
  
  posts.push(newPost);
  
  res.status(201).json({ 
    success: true, 
    message: 'Post created successfully',
    post: newPost 
  });
});

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', auth, (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  post.likes += 1;
  
  res.json({ 
    success: true, 
    message: 'Post liked',
    likes: post.likes 
  });
});

// DELETE /api/community/posts/:id
router.delete('/posts/:id', auth, (req, res) => {
  const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
  
  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const post = posts[postIndex];
  
  // Check if user owns the post
  if (post.userId !== req.userId) {
    return res.status(403).json({ 
      error: 'Not authorized to delete this post' 
    });
  }
  
  posts.splice(postIndex, 1);
  
  res.json({ 
    success: true, 
    message: 'Post deleted successfully' 
  });
});

module.exports = router;