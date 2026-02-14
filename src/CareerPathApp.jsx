import React, { useState, useEffect } from 'react';
import { Compass, Map, LineChart, Target, Briefcase, Users, User, LogOut, Menu, X, Trophy, Zap, Star, ChevronRight, Lock, Unlock, TrendingUp, Code, Database, Palette, Wrench, CheckCircle, Clock, AlertCircle, Brain, Lightbulb, Rocket, Award, Calendar, MessageSquare, Settings, Moon, Sun } from 'lucide-react';

// Utility: localStorage helpers
const storage = {
  get: (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key) => localStorage.removeItem(key)
};

// Auth Context
const AuthContext = React.createContext(null);

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Main App Component
function CareerPathApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedUser = storage.get('careerpath_user');
    const savedTheme = storage.get('careerpath_theme');
    if (savedUser) setUser(savedUser);
    if (savedTheme) setDarkMode(savedTheme === 'dark');
    setLoading(false);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      storage.set('careerpath_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      storage.set('careerpath_theme', 'light');
    }
  }, [darkMode]);

  const login = (userData) => {
    setUser(userData);
    storage.set('careerpath_user', userData);
  };

  const logout = () => {
    setUser(null);
    storage.remove('careerpath_user');
    storage.remove('careerpath_progress');
    storage.remove('careerpath_path');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, darkMode, setDarkMode }}>
      <div className="app-container">
        {!user ? <AuthPage /> : <Dashboard />}
      </div>
    </AuthContext.Provider>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading CareerPath...</p>
    </div>
  );
}

// Auth Page (Login/Signup)
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', college: '', branch: '', year: ''
  });
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      const users = storage.get('careerpath_users') || [];
      const foundUser = users.find(u => u.email === formData.email);
      if (foundUser) {
        login(foundUser);
      } else {
        alert('User not found. Please sign up first.');
      }
    } else {
      const users = storage.get('careerpath_users') || [];
      const newUser = { 
        ...formData, 
        id: Date.now(), 
        createdAt: new Date().toISOString(),
        level: 1,
        xp: 0
      };
      users.push(newUser);
      storage.set('careerpath_users', users);
      login(newUser);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background"></div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <Compass className="logo-icon" />
            <h1>CareerPath</h1>
          </div>
          <p className="tagline">Navigate Your Future with Confidence</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="College/University"
                value={formData.college}
                onChange={(e) => setFormData({...formData, college: e.target.value})}
                required
              />
              <select
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                required
              >
                <option value="">Select Branch</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics & Communication</option>
                <option value="Mechanical">Mechanical Engineering</option>
                <option value="Civil">Civil Engineering</option>
                <option value="Electrical">Electrical Engineering</option>
                <option value="IT">Information Technology</option>
              </select>
              <select
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                required
              >
                <option value="">Year of Study</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </>
          )}
          <button type="submit" className="btn-primary">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Main Dashboard
function Dashboard() {
  const [currentPage, setCurrentPage] = useState('discovery');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, darkMode, setDarkMode } = useAuth();

  const pages = [
    { id: 'discovery', icon: Brain, label: 'Career Discovery' },
    { id: 'explorer', icon: Map, label: 'Branch Explorer' },
    { id: 'visualizer', icon: LineChart, label: 'Path Visualizer' },
    { id: 'skills', icon: Target, label: 'Skill Dashboard' },
    { id: 'opportunities', icon: Briefcase, label: 'Opportunities' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-small">
            <Compass />
            {sidebarOpen && <span>CareerPath</span>}
          </div>
          <button 
            className="toggle-sidebar" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {pages.map(page => (
            <button
              key={page.id}
              className={`nav-item ${currentPage === page.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(page.id)}
            >
              <page.icon size={20} />
              {sidebarOpen && <span>{page.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-level">
            <Trophy size={16} />
            {sidebarOpen && <span>Level {user.level || 1}</span>}
          </div>
          <button className="btn-logout" onClick={logout}>
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h2>{pages.find(p => p.id === currentPage)?.label}</h2>
          <div className="top-bar-actions">
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="user-info">
              <span>Welcome, {user.name}</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          {currentPage === 'discovery' && <CareerDiscovery />}
          {currentPage === 'explorer' && <BranchExplorer />}
          {currentPage === 'visualizer' && <PathVisualizer />}
          {currentPage === 'skills' && <SkillDashboard />}
          {currentPage === 'opportunities' && <Opportunities />}
          {currentPage === 'community' && <Community />}
          {currentPage === 'profile' && <Profile />}
        </div>
      </main>
    </div>
  );
}

// Career Discovery Component
function CareerDiscovery() {
  const [step, setStep] = useState(1);
  const [mindsetAnswers, setMindsetAnswers] = useState([]);
  const [interestAnswers, setInterestAnswers] = useState([]);
  const [mindsetResult, setMindsetResult] = useState(null);
  const [careerDomains, setCareerDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const mindsetQuestions = [
    {
      q: "How do you feel about your career future?",
      options: [
        { text: "Completely lost and overwhelmed", score: { confused: 3, stressed: 2 } },
        { text: "Anxious but want to improve", score: { stressed: 3, motivated: 1 } },
        { text: "Excited to explore options", score: { motivated: 3, goal: 1 } },
        { text: "Clear goal, need guidance on execution", score: { goal: 3, motivated: 1 } }
      ]
    },
    {
      q: "When you think about learning new skills, you feel:",
      options: [
        { text: "Don't know where to start", score: { confused: 2, stressed: 1 } },
        { text: "Pressured and behind peers", score: { stressed: 3 } },
        { text: "Eager and curious", score: { motivated: 2, goal: 1 } },
        { text: "Focused on specific targets", score: { goal: 3 } }
      ]
    },
    {
      q: "How much research have you done about career paths?",
      options: [
        { text: "None, too confused to start", score: { confused: 3 } },
        { text: "Some, but feel more lost", score: { confused: 2, stressed: 2 } },
        { text: "Actively exploring multiple options", score: { motivated: 3 } },
        { text: "Deep research in 1-2 specific areas", score: { goal: 3 } }
      ]
    },
    {
      q: "What's your biggest challenge right now?",
      options: [
        { text: "No idea what I want to do", score: { confused: 3 } },
        { text: "Too many options, fear of choosing wrong", score: { stressed: 3 } },
        { text: "Want to try everything", score: { motivated: 2 } },
        { text: "Need roadmap for my chosen field", score: { goal: 3 } }
      ]
    },
    {
      q: "How do you approach career planning?",
      options: [
        { text: "Avoid thinking about it", score: { confused: 2, stressed: 2 } },
        { text: "Overthink and worry constantly", score: { stressed: 3 } },
        { text: "Explore with open mind", score: { motivated: 3 } },
        { text: "Set goals and track progress", score: { goal: 3 } }
      ]
    }
  ];

  const interestQuestions = [
    {
      q: "What excites you most?",
      options: [
        { text: "Building user interfaces & experiences", domains: ['frontend', 'ux'] },
        { text: "Working with data & algorithms", domains: ['data', 'ml'] },
        { text: "Creating systems & infrastructure", domains: ['backend', 'devops'] },
        { text: "Product strategy & user impact", domains: ['product', 'management'] }
      ]
    },
    {
      q: "Your ideal work environment:",
      options: [
        { text: "Visual, creative, iterative", domains: ['frontend', 'ux', 'design'] },
        { text: "Analytical, research-focused", domains: ['data', 'ml', 'research'] },
        { text: "Problem-solving, optimization", domains: ['backend', 'devops', 'systems'] },
        { text: "Cross-functional, strategic", domains: ['product', 'management'] }
      ]
    },
    {
      q: "What do you enjoy learning?",
      options: [
        { text: "Design principles, UI frameworks", domains: ['frontend', 'ux'] },
        { text: "Statistics, ML models, Python", domains: ['data', 'ml'] },
        { text: "APIs, databases, cloud platforms", domains: ['backend', 'devops'] },
        { text: "User research, business metrics", domains: ['product', 'management'] }
      ]
    },
    {
      q: "Your strength is:",
      options: [
        { text: "Aesthetic sense & attention to detail", domains: ['frontend', 'ux', 'design'] },
        { text: "Logical thinking & pattern recognition", domains: ['data', 'ml', 'backend'] },
        { text: "System design & scalability", domains: ['backend', 'devops', 'systems'] },
        { text: "Communication & stakeholder management", domains: ['product', 'management'] }
      ]
    }
  ];

  const calculateMindset = () => {
    const scores = { confused: 0, stressed: 0, motivated: 0, goal: 0 };
    mindsetAnswers.forEach(answer => {
      Object.entries(answer).forEach(([key, value]) => {
        scores[key] = (scores[key] || 0) + value;
      });
    });
    const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    
    const results = {
      confused: {
        type: "Confused Explorer",
        message: "You're at the starting line, and that's perfectly okay!",
        advice: "Take small steps. Start by exploring what excites you without pressure. This platform will guide you through discovering your interests step by step.",
        color: "from-blue-400 to-cyan-400"
      },
      stressed: {
        type: "Anxious Achiever",
        message: "Your awareness shows you care about your future!",
        advice: "Channel that energy positively. Remember: everyone moves at their own pace. Focus on one skill at a time, celebrate small wins.",
        color: "from-orange-400 to-red-400"
      },
      motivated: {
        type: "Curious Learner",
        message: "Your enthusiasm is your superpower!",
        advice: "Great energy! Now let's channel it strategically. We'll help you explore options systematically and build skills that align with your interests.",
        color: "from-green-400 to-emerald-400"
      },
      goal: {
        type: "Focused Planner",
        message: "You have clarity - now let's build the roadmap!",
        advice: "Perfect! You know where you're headed. We'll provide structured paths, skill breakdowns, and milestones to track your progress effectively.",
        color: "from-purple-400 to-pink-400"
      }
    };
    
    setMindsetResult(results[dominant]);
  };

  const calculateDomains = () => {
    const domainScores = {};
    interestAnswers.forEach(domains => {
      domains.forEach(domain => {
        domainScores[domain] = (domainScores[domain] || 0) + 1;
      });
    });

    const domainData = {
      frontend: { name: "Frontend Development", icon: Code, desc: "Build beautiful, responsive user interfaces", tools: "React, TypeScript, Tailwind, Next.js" },
      backend: { name: "Backend Development", icon: Database, desc: "Design scalable systems and APIs", tools: "Node.js, PostgreSQL, Redis, AWS" },
      data: { name: "Data Science", icon: TrendingUp, desc: "Extract insights from data", tools: "Python, Pandas, SQL, Tableau" },
      ml: { name: "Machine Learning", icon: Brain, desc: "Build intelligent systems", tools: "TensorFlow, PyTorch, Scikit-learn" },
      devops: { name: "DevOps Engineering", icon: Wrench, desc: "Automate infrastructure and deployments", tools: "Docker, Kubernetes, CI/CD, AWS" },
      ux: { name: "UX/UI Design", icon: Palette, desc: "Create delightful user experiences", tools: "Figma, User Research, Prototyping" },
      product: { name: "Product Management", icon: Target, desc: "Drive product strategy and execution", tools: "Analytics, Roadmapping, Stakeholder Management" }
    };

    const topDomains = Object.entries(domainScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([domain, score]) => ({
        id: domain,
        ...domainData[domain],
        match: Math.round((score / interestAnswers.length) * 100)
      }));

    setCareerDomains(topDomains);
  };

  const handleMindsetAnswer = (scoreObj) => {
    const newAnswers = [...mindsetAnswers, scoreObj];
    setMindsetAnswers(newAnswers);
    
    if (currentQuestion < mindsetQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMindset();
      setStep(2);
      setCurrentQuestion(0);
    }
  };

  const handleInterestAnswer = (domains) => {
    const newAnswers = [...interestAnswers, domains];
    setInterestAnswers(newAnswers);
    
    if (currentQuestion < interestQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateDomains();
      setStep(3);
    }
  };

  const selectDomain = (domain) => {
    setSelectedDomain(domain);
    storage.set('careerpath_path', domain);
    setStep(4);
  };

  if (step === 1) {
    return (
      <div className="discovery-container">
        <div className="discovery-header">
          <div className="step-indicator">
            <div className="step active">1</div>
            <div className="step-line"></div>
            <div className="step">2</div>
            <div className="step-line"></div>
            <div className="step">3</div>
          </div>
          <h3>Mindset Detection</h3>
          <p>Question {currentQuestion + 1} of {mindsetQuestions.length}</p>
        </div>

        <div className="question-card">
          <div className="question-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${((currentQuestion + 1) / mindsetQuestions.length) * 100}%` }}
            ></div>
          </div>
          
          <h2>{mindsetQuestions[currentQuestion].q}</h2>
          
          <div className="options-grid">
            {mindsetQuestions[currentQuestion].options.map((option, idx) => (
              <button
                key={idx}
                className="option-card"
                onClick={() => handleMindsetAnswer(option.score)}
              >
                <span>{option.text}</span>
                <ChevronRight size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 2 && mindsetResult) {
    return (
      <div className="discovery-container">
        <div className="result-card">
          <div className={`result-badge bg-gradient-to-r ${mindsetResult.color}`}>
            <Lightbulb size={48} />
          </div>
          <h2>You're a {mindsetResult.type}</h2>
          <p className="result-message">{mindsetResult.message}</p>
          <div className="advice-box">
            <h4>Personalized Advice:</h4>
            <p>{mindsetResult.advice}</p>
          </div>
          <button 
            className="btn-primary btn-large"
            onClick={() => { setStep(2.5); setCurrentQuestion(0); }}
          >
            Continue to Interest Analysis <ChevronRight />
          </button>
        </div>
      </div>
    );
  }

  if (step === 2.5) {
    return (
      <div className="discovery-container">
        <div className="discovery-header">
          <div className="step-indicator">
            <div className="step completed">✓</div>
            <div className="step-line completed"></div>
            <div className="step active">2</div>
            <div className="step-line"></div>
            <div className="step">3</div>
          </div>
          <h3>Interest & Strength Analysis</h3>
          <p>Question {currentQuestion + 1} of {interestQuestions.length}</p>
        </div>

        <div className="question-card">
          <div className="question-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${((currentQuestion + 1) / interestQuestions.length) * 100}%` }}
            ></div>
          </div>
          
          <h2>{interestQuestions[currentQuestion].q}</h2>
          
          <div className="options-grid">
            {interestQuestions[currentQuestion].options.map((option, idx) => (
              <button
                key={idx}
                className="option-card"
                onClick={() => handleInterestAnswer(option.domains)}
              >
                <span>{option.text}</span>
                <ChevronRight size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="discovery-container">
        <div className="domains-header">
          <h2>Your Top Career Matches</h2>
          <p>Based on your interests and strengths, these domains align with your profile</p>
        </div>

        <div className="domains-grid">
          {careerDomains.map((domain, idx) => (
            <div key={domain.id} className="domain-card" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="domain-icon">
                <domain.icon size={32} />
              </div>
              <div className="match-badge">{domain.match}% Match</div>
              <h3>{domain.name}</h3>
              <p>{domain.desc}</p>
              <div className="tools-tag">
                <Wrench size={14} />
                <span>{domain.tools}</span>
              </div>
              <button 
                className="btn-select"
                onClick={() => selectDomain(domain)}
              >
                Choose This Path <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 4 && selectedDomain) {
    return (
      <div className="discovery-container">
        <div className="roadmap-result">
          <div className="roadmap-header">
            <div className="success-badge">
              <CheckCircle size={48} />
            </div>
            <h2>Your Career Path is Ready!</h2>
            <p>We've created a personalized roadmap for {selectedDomain.name}</p>
          </div>

          <div className="roadmap-preview">
            <h3>What's Next?</h3>
            <div className="next-steps">
              <div className="next-step">
                <LineChart size={24} />
                <div>
                  <h4>Visualize Your Path</h4>
                  <p>See the complete roadmap with stages and milestones</p>
                </div>
              </div>
              <div className="next-step">
                <Target size={24} />
                <div>
                  <h4>Track Your Skills</h4>
                  <p>Monitor progress and set weekly goals</p>
                </div>
              </div>
              <div className="next-step">
                <Briefcase size={24} />
                <div>
                  <h4>Find Opportunities</h4>
                  <p>Discover internships and projects aligned with your path</p>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-primary btn-large" onClick={() => window.location.reload()}>
              Explore Dashboard <Rocket />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Branch Explorer Component
function BranchExplorer() {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(user.branch || '');

  const branchData = {
    'Computer Science': {
      careers: ['Software Engineer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Full Stack Developer'],
      avgSalary: '₹6-15 LPA',
      hotRoles: 'Cloud Architect, AI Engineer, Blockchain Developer',
      gap: {
        college: ['DSA', 'DBMS', 'OS', 'Networks', 'OOP'],
        industry: ['System Design', 'Microservices', 'Docker/K8s', 'Cloud (AWS/Azure)', 'CI/CD', 'React/Next.js'],
        missing: ['System Design', 'Cloud Technologies', 'Modern Frontend Frameworks', 'DevOps Tools']
      }
    },
    'Electronics': {
      careers: ['Embedded Engineer', 'IoT Developer', 'VLSI Engineer', 'Hardware Designer', 'Firmware Developer'],
      avgSalary: '₹5-12 LPA',
      hotRoles: 'IoT Architect, Autonomous Systems Engineer, 5G Specialist',
      gap: {
        college: ['Circuit Design', 'Microprocessors', 'Signals', 'Communication Systems'],
        industry: ['Embedded C/C++', 'RTOS', 'ARM Architecture', 'IoT Protocols', 'Python for Hardware'],
        missing: ['Modern Programming', 'Cloud IoT Platforms', 'Machine Learning for Edge']
      }
    },
    'Mechanical': {
      careers: ['CAD Engineer', 'Robotics Engineer', 'Product Designer', 'Simulation Engineer', 'Automation Engineer'],
      avgSalary: '₹4-10 LPA',
      hotRoles: 'Robotics Developer, 3D Printing Specialist, Digital Twin Engineer',
      gap: {
        college: ['Thermodynamics', 'Mechanics', 'Manufacturing', 'CAD Tools'],
        industry: ['Python/MATLAB', 'ROS (Robot OS)', 'Simulation Software', 'IoT Integration', 'Data Analytics'],
        missing: ['Programming Skills', 'Automation Tools', 'Industry 4.0 Technologies']
      }
    }
  };

  const data = branchData[selectedBranch];

  return (
    <div className="explorer-container">
      <div className="explorer-header">
        <h2>Branch to Career Explorer</h2>
        <select 
          value={selectedBranch} 
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="branch-select"
        >
          <option value="">Select Your Branch</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Electronics">Electronics & Communication</option>
          <option value="Mechanical">Mechanical Engineering</option>
        </select>
      </div>

      {data && (
        <div className="explorer-content">
          <div className="careers-section">
            <h3>Modern Career Paths</h3>
            <div className="career-tags">
              {data.careers.map(career => (
                <span key={career} className="career-tag">{career}</span>
              ))}
            </div>
            <div className="stats-row">
              <div className="stat-card">
                <TrendingUp size={24} />
                <div>
                  <p>Avg. Salary Range</p>
                  <h4>{data.avgSalary}</h4>
                </div>
              </div>
              <div className="stat-card">
                <Zap size={24} />
                <div>
                  <p>Hot Emerging Roles</p>
                  <h4>{data.hotRoles}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="gap-analysis">
            <h3><AlertCircle size={20} /> Skill Gap Analysis</h3>
            
            <div className="gap-grid">
              <div className="gap-card college">
                <h4>What You Learn in College</h4>
                <ul>
                  {data.gap.college.map(item => (
                    <li key={item}><CheckCircle size={16} /> {item}</li>
                  ))}
                </ul>
              </div>

              <div className="gap-card industry">
                <h4>What Industry Expects</h4>
                <ul>
                  {data.gap.industry.map(item => (
                    <li key={item}><Star size={16} /> {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bridge-gap">
              <h4><Rocket size={20} /> Bridge the Gap</h4>
              <p>Focus on these skills to become industry-ready:</p>
              <div className="missing-skills">
                {data.gap.missing.map(skill => (
                  <div key={skill} className="skill-badge">
                    <Lock size={14} />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary">
                Get Learning Resources <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Path Visualizer Component
function PathVisualizer() {
  const savedPath = storage.get('careerpath_path');
  const [progress, setProgress] = useState(storage.get('careerpath_progress') || {
    currentLevel: 'Beginner',
    xp: 0,
    completedSkills: []
  });

  const roadmap = {
    'Frontend Development': {
      levels: [
        {
          name: 'Beginner',
          xp: 0,
          skills: ['HTML/CSS', 'JavaScript Basics', 'Git & GitHub', 'Responsive Design'],
          tools: ['VS Code', 'Chrome DevTools', 'Figma Basics'],
          projects: ['Personal Portfolio', 'Landing Page', 'Calculator App']
        },
        {
          name: 'Junior',
          xp: 1000,
          skills: ['React Fundamentals', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
          tools: ['React DevTools', 'Postman', 'npm/yarn'],
          projects: ['Todo App', 'Weather Dashboard', 'E-commerce UI']
        },
        {
          name: 'Mid-Level',
          xp: 3000,
          skills: ['Next.js', 'State Management', 'Performance Optimization', 'Testing'],
          tools: ['Redux/Zustand', 'Jest', 'Webpack/Vite'],
          projects: ['Full-stack Blog', 'Dashboard Analytics', 'Social Media Clone']
        },
        {
          name: 'Senior',
          xp: 6000,
          skills: ['System Design', 'Architecture Patterns', 'Team Leadership', 'Mentoring'],
          tools: ['Microservices', 'CI/CD', 'Monitoring Tools'],
          projects: ['SaaS Application', 'Design System', 'Open Source Contribution']
        }
      ]
    }
  };

  const currentRoadmap = roadmap[savedPath?.name] || roadmap['Frontend Development'];
  const currentLevelIndex = currentRoadmap.levels.findIndex(l => l.name === progress.currentLevel);

  const completeSkill = (skill) => {
    const newProgress = {
      ...progress,
      completedSkills: [...progress.completedSkills, skill],
      xp: progress.xp + 100
    };
    setProgress(newProgress);
    storage.set('careerpath_progress', newProgress);
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div>
          <h2>{savedPath?.name || 'Frontend Development'} Roadmap</h2>
          <p>Your journey from beginner to senior developer</p>
        </div>
        <div className="xp-badge">
          <Zap size={20} />
          <span>{progress.xp} XP</span>
        </div>
      </div>

      <div className="roadmap-timeline">
        {currentRoadmap.levels.map((level, idx) => {
          const isActive = idx === currentLevelIndex;
          const isCompleted = idx < currentLevelIndex;
          
          return (
            <div key={level.name} className={`level-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="level-badge">
                {isCompleted ? <CheckCircle size={32} /> : <Trophy size={32} />}
              </div>
              
              <div className="level-content">
                <div className="level-header">
                  <h3>{level.name}</h3>
                  <span className="xp-required">{level.xp} XP</span>
                </div>

                <div className="level-section">
                  <h4><Target size={16} /> Skills to Master</h4>
                  <div className="skill-grid">
                    {level.skills.map(skill => {
                      const completed = progress.completedSkills.includes(skill);
                      return (
                        <div key={skill} className={`skill-item ${completed ? 'completed' : ''}`}>
                          {completed ? <CheckCircle size={16} /> : <Clock size={16} />}
                          <span>{skill}</span>
                          {!completed && isActive && (
                            <button 
                              className="btn-complete"
                              onClick={() => completeSkill(skill)}
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="level-section">
                  <h4><Wrench size={16} /> Tools & Technologies</h4>
                  <div className="tools-list">
                    {level.tools.map(tool => (
                      <span key={tool} className="tool-tag">{tool}</span>
                    ))}
                  </div>
                </div>

                <div className="level-section">
                  <h4><Rocket size={16} /> Project Ideas</h4>
                  <ul className="project-list">
                    {level.projects.map(project => (
                      <li key={project}>{project}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {idx < currentRoadmap.levels.length - 1 && (
                <div className="level-connector"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Skill Dashboard Component
function SkillDashboard() {
  const [skills, setSkills] = useState(storage.get('careerpath_skills') || {
    completed: ['HTML', 'CSS', 'JavaScript'],
    inProgress: ['React', 'TypeScript'],
    pending: ['Next.js', 'Node.js', 'Docker', 'AWS']
  });
  const [weeklyGoal, setWeeklyGoal] = useState(2);
  const [streak, setStreak] = useState(7);

  const totalSkills = skills.completed.length + skills.inProgress.length + skills.pending.length;
  const completionRate = Math.round((skills.completed.length / totalSkills) * 100);

  return (
    <div className="skills-container">
      <div className="skills-header">
        <div className="stats-overview">
          <div className="stat-box">
            <h3>{skills.completed.length}</h3>
            <p>Completed</p>
          </div>
          <div className="stat-box">
            <h3>{skills.inProgress.length}</h3>
            <p>In Progress</p>
          </div>
          <div className="stat-box">
            <h3>{streak}</h3>
            <p>Day Streak 🔥</p>
          </div>
          <div className="stat-box">
            <h3>{completionRate}%</h3>
            <p>Completion</p>
          </div>
        </div>
      </div>

      <div className="weekly-goal">
        <h3><Target size={20} /> Weekly Goal</h3>
        <p>Learn {weeklyGoal} new skills this week</p>
        <div className="goal-progress">
          <div className="progress-bar-wrapper">
            <div className="progress-fill" style={{ width: '40%' }}></div>
          </div>
          <span>2 / {weeklyGoal} completed</span>
        </div>
      </div>

      <div className="skills-sections">
        <div className="skill-category completed">
          <h3><CheckCircle size={20} /> Completed Skills ({skills.completed.length})</h3>
          <div className="skill-tags">
            {skills.completed.map(skill => (
              <span key={skill} className="skill-tag">
                <CheckCircle size={14} />
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="skill-category in-progress">
          <h3><Clock size={20} /> In Progress ({skills.inProgress.length})</h3>
          <div className="skill-items">
            {skills.inProgress.map(skill => (
              <div key={skill} className="skill-progress-item">
                <span>{skill}</span>
                <div className="mini-progress">
                  <div style={{ width: '60%' }}></div>
                </div>
                <span className="percentage">60%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="skill-category pending">
          <h3><AlertCircle size={20} /> Pending ({skills.pending.length})</h3>
          <div className="skill-tags">
            {skills.pending.map(skill => (
              <span key={skill} className="skill-tag locked">
                <Lock size={14} />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Opportunities Component
function Opportunities() {
  const [filter, setFilter] = useState('all');

  const opportunities = [
    {
      id: 1,
      type: 'Internship',
      title: 'Frontend Developer Intern',
      company: 'TechCorp',
      skills: ['React', 'TypeScript'],
      difficulty: 'Intermediate',
      duration: '3 months',
      stipend: '₹15,000/month'
    },
    {
      id: 2,
      type: 'Project',
      title: 'Build a Real-time Chat App',
      skills: ['WebSockets', 'Node.js', 'React'],
      difficulty: 'Advanced',
      duration: '2 weeks'
    },
    {
      id: 3,
      type: 'Hackathon',
      title: 'Smart India Hackathon 2024',
      date: 'March 15-17',
      skills: ['Full Stack', 'Innovation'],
      difficulty: 'All Levels',
      prize: '₹1,00,000'
    },
    {
      id: 4,
      type: 'Challenge',
      title: '30 Days of Code',
      skills: ['DSA', 'Problem Solving'],
      difficulty: 'Beginner',
      duration: '30 days'
    }
  ];

  const filtered = filter === 'all' ? opportunities : opportunities.filter(o => o.type.toLowerCase() === filter);

  return (
    <div className="opportunities-container">
      <div className="opportunities-header">
        <h2>Opportunities & Challenges</h2>
        <div className="filter-tabs">
          {['all', 'internship', 'project', 'hackathon', 'challenge'].map(f => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="opportunities-grid">
        {filtered.map(opp => (
          <div key={opp.id} className="opportunity-card">
            <div className="opp-type">{opp.type}</div>
            <h3>{opp.title}</h3>
            {opp.company && <p className="company">{opp.company}</p>}
            
            <div className="opp-details">
              {opp.duration && (
                <span><Calendar size={14} /> {opp.duration}</span>
              )}
              {opp.difficulty && (
                <span className="difficulty">{opp.difficulty}</span>
              )}
            </div>

            <div className="opp-skills">
              {opp.skills.map(skill => (
                <span key={skill} className="opp-skill">{skill}</span>
              ))}
            </div>

            {(opp.stipend || opp.prize) && (
              <div className="opp-reward">
                <Star size={16} />
                <span>{opp.stipend || opp.prize}</span>
              </div>
            )}

            <button className="btn-apply">
              Apply Now <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Community Component
function Community() {
  const [posts, setPosts] = useState(storage.get('careerpath_posts') || []);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const post = {
      ...newPost,
      id: Date.now(),
      author: 'You',
      timestamp: new Date().toISOString(),
      replies: 0
    };
    const updated = [post, ...posts];
    setPosts(updated);
    storage.set('careerpath_posts', updated);
    setNewPost({ title: '', content: '', category: 'general' });
  };

  return (
    <div className="community-container">
      <div className="community-header">
        <h2>Community & Discussion</h2>
        <p>Ask questions, share experiences, help others</p>
      </div>

      <div className="post-form">
        <h3>Start a Discussion</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Question Title"
            value={newPost.title}
            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            required
          />
          <textarea
            placeholder="Describe your question or thought..."
            value={newPost.content}
            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            required
          />
          <div className="form-actions">
            <select
              value={newPost.category}
              onChange={(e) => setNewPost({...newPost, category: e.target.value})}
            >
              <option value="general">General</option>
              <option value="career">Career Advice</option>
              <option value="skills">Skill Learning</option>
              <option value="opportunities">Opportunities</option>
            </select>
            <button type="submit" className="btn-primary">Post Question</button>
          </div>
        </form>
      </div>

      <div className="posts-list">
        <h3>Recent Discussions</h3>
        {posts.length === 0 ? (
          <p className="empty-state">No discussions yet. Be the first to ask!</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <h4>{post.title}</h4>
                <span className="category-badge">{post.category}</span>
              </div>
              <p>{post.content}</p>
              <div className="post-footer">
                <span className="author">{post.author}</span>
                <span className="replies"><MessageSquare size={14} /> {post.replies} replies</span>
                <span className="time">{new Date(post.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="motivation-section">
        <h3><Rocket size={20} /> Daily Motivation</h3>
        <div className="motivation-card">
          <p>"Every expert was once a beginner. Your journey starts with a single step."</p>
        </div>
      </div>
    </div>
  );
}

// Profile Component
function Profile() {
  const { user, darkMode, setDarkMode } = useAuth();
  const savedPath = storage.get('careerpath_path');
  const progress = storage.get('careerpath_progress') || { xp: 0, currentLevel: 'Beginner' };

  const handleReset = () => {
    if (confirm('Are you sure? This will reset all your progress.')) {
      storage.remove('careerpath_progress');
      storage.remove('careerpath_path');
      storage.remove('careerpath_skills');
      window.location.reload();
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <div className="profile-meta">
            <span>{user.college}</span>
            <span>•</span>
            <span>{user.branch}</span>
            <span>•</span>
            <span>Year {user.year}</span>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card-large">
          <Trophy size={32} />
          <div>
            <h3>Level {user.level || 1}</h3>
            <p>{progress.xp} Total XP</p>
          </div>
        </div>
        <div className="stat-card-large">
          <Target size={32} />
          <div>
            <h3>{savedPath?.name || 'Not Selected'}</h3>
            <p>Career Path</p>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <h3><Settings size={20} /> Settings</h3>
          <div className="setting-item">
            <span>Dark Mode</span>
            <button 
              className={`toggle-switch ${darkMode ? 'active' : ''}`}
              onClick={() => setDarkMode(!darkMode)}
            >
              <div className="toggle-slider"></div>
            </button>
          </div>
        </div>

        <div className="profile-section danger">
          <h3><AlertCircle size={20} /> Danger Zone</h3>
          <button className="btn-danger" onClick={handleReset}>
            Reset All Progress
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #0a0e1a;
  --bg-secondary: #141829;
  --bg-card: #1a1f35;
  --text-primary: #ffffff;
  --text-secondary: #a0a5b8;
  --accent-1: #6366f1;
  --accent-2: #ec4899;
  --accent-3: #14b8a6;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --border: #252d45;
}

.dark {
  --bg-primary: #0a0e1a;
  --bg-secondary: #141829;
  --bg-card: #1a1f35;
  --text-primary: #ffffff;
  --text-secondary: #a0a5b8;
}

:root:not(.dark) {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
}

body {
  font-family: 'Outfit', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
}

.app-container {
  min-height: 100vh;
}

/* Loading Screen */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--accent-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Auth Page */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.auth-background {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 20px); }
}

.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 1;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo-icon {
  width: 48px;
  height: 48px;
  color: var(--accent-1);
}

.logo h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.auth-tabs {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-secondary);
  padding: 0.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.auth-tabs button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.auth-tabs button.active {
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: white;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-form input,
.auth-form select {
  padding: 1rem;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s;
}

.auth-form input:focus,
.auth-form select:focus {
  outline: none;
  border-color: var(--accent-1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-primary {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.5);
}

/* Dashboard */
.dashboard {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar.closed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.logo-small {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.logo-small svg {
  color: var(--accent-1);
  min-width: 28px;
}

.sidebar.closed .logo-small span {
  display: none;
}

.toggle-sidebar {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s;
}

.toggle-sidebar:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  width: 100%;
  text-align: left;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
  font-weight: 500;
}

.sidebar.closed .nav-item {
  justify-content: center;
}

.sidebar.closed .nav-item span {
  display: none;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: white;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border);
}

.user-level {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-bottom: 0.5rem;
  color: var(--accent-3);
  font-weight: 600;
}

.sidebar.closed .user-level span {
  display: none;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  justify-content: center;
}

.sidebar.closed .btn-logout span {
  display: none;
}

.btn-logout:hover {
  background: var(--danger);
  border-color: var(--danger);
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s;
}

.sidebar.closed + .main-content {
  margin-left: 80px;
}

.top-bar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}

.top-bar h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  border-color: var(--accent-1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

.page-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Career Discovery */
.discovery-container {
  max-width: 900px;
  margin: 0 auto;
}

.discovery-header {
  text-align: center;
  margin-bottom: 3rem;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.step {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--text-secondary);
}

.step.active {
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  border-color: transparent;
  color: white;
}

.step.completed {
  background: var(--success);
  border-color: transparent;
  color: white;
}

.step-line {
  width: 80px;
  height: 2px;
  background: var(--border);
}

.step-line.completed {
  background: var(--success);
}

.question-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 3rem;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.question-progress {
  width: 100%;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
  transition: width 0.5s ease;
  border-radius: 999px;
}

.question-card h2 {
  font-size: 1.75rem;
  margin-bottom: 2rem;
  text-align: center;
}

.options-grid {
  display: grid;
  gap: 1rem;
}

.option-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  padding: 1.5rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
}

.option-card:hover {
  border-color: var(--accent-1);
  transform: translateX(8px);
  background: var(--bg-card);
}

.result-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  animation: slideUp 0.5s ease-out;
}

.result-badge {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.result-card h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.result-message {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.advice-box {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  text-align: left;
}

.advice-box h4 {
  color: var(--accent-1);
  margin-bottom: 1rem;
}

.btn-large {
  padding: 1.25rem 2.5rem;
  font-size: 1.1rem;
}

.domains-header {
  text-align: center;
  margin-bottom: 3rem;
}

.domains-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.domain-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  animation: slideUp 0.5s ease-out both;
}

.domain-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.5rem;
}

.match-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: var(--success);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.875rem;
}

.domain-card h3 {
  margin-bottom: 0.75rem;
}

.domain-card p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.tools-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.btn-select {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-select:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.5);
}

.roadmap-result {
  max-width: 800px;
  margin: 0 auto;
}

.roadmap-header {
  text-align: center;
  margin-bottom: 3rem;
}

.success-badge {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, var(--success), var(--accent-3));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.roadmap-preview {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.next-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.next-step {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.next-step svg {
  color: var(--accent-1);
  min-width: 24px;
}

.next-step h4 {
  margin-bottom: 0.25rem;
}

.next-step p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

/* Branch Explorer */
.explorer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.explorer-header {
  margin-bottom: 2rem;
}

.branch-select {
  width: 100%;
  max-width: 400px;
  padding: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.careers-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.career-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.career-tag {
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: white;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 16px;
}

.stat-card svg {
  color: var(--accent-3);
}

.stat-card h4 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.stat-card p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.gap-analysis {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
}

.gap-analysis h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.gap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.gap-card {
  padding: 1.5rem;
  border-radius: 16px;
}

.gap-card.college {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.gap-card.industry {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05));
  border: 1px solid rgba(236, 72, 153, 0.3);
}

.gap-card h4 {
  margin-bottom: 1rem;
}

.gap-card ul {
  list-style: none;
}

.gap-card li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: var(--text-secondary);
}

.bridge-gap {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 16px;
}

.bridge-gap h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.missing-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.skill-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--warning);
  font-weight: 600;
  font-size: 0.9rem;
}

/* Path Visualizer */
.visualizer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.visualizer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
}

.xp-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-3), var(--success));
  color: white;
  border-radius: 999px;
  font-weight: 700;
  font-size: 1.1rem;
}

.roadmap-timeline {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.level-card {
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  opacity: 0.6;
  transition: all 0.5s;
}

.level-card.active {
  opacity: 1;
  border-color: var(--accent-1);
  box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.3);
}

.level-card.completed {
  opacity: 0.8;
  border-color: var(--success);
}

.level-badge {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: absolute;
  top: -40px;
  left: 2rem;
}

.level-card.completed .level-badge {
  background: var(--success);
}

.level-content {
  margin-top: 3rem;
}

.level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.level-header h3 {
  font-size: 1.75rem;
}

.xp-required {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: 999px;
  color: var(--accent-3);
  font-weight: 700;
}

.level-section {
  margin-bottom: 2rem;
}

.level-section h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--accent-1);
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  color: var(--text-secondary);
}

.skill-item.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
  border: 1px solid var(--success);
  color: var(--success);
}

.btn-complete {
  margin-left: auto;
  background: var(--success);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: 700;
}

.tools-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tool-tag {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.project-list {
  list-style: none;
}

.project-list li {
  padding: 0.75rem 0;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
}

.project-list li:last-child {
  border-bottom: none;
}

.level-connector {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, var(--border), transparent);
  margin: 0 auto;
}

/* Skill Dashboard */
.skills-container {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
}

.stat-box h3 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-box p {
  color: var(--text-secondary);
}

.weekly-goal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.weekly-goal h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.goal-progress {
  margin-top: 1rem;
}

.progress-bar-wrapper {
  width: 100%;
  height: 12px;
  background: var(--bg-secondary);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
  border-radius: 999px;
  transition: width 0.5s;
}

.skills-sections {
  display: grid;
  gap: 2rem;
}

.skill-category {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
}

.skill-category h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.skill-category.completed h3 {
  color: var(--success);
}

.skill-category.in-progress h3 {
  color: var(--warning);
}

.skill-category.pending h3 {
  color: var(--text-secondary);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.skill-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-weight: 600;
}

.skill-tag.locked {
  color: var(--text-secondary);
  opacity: 0.6;
}

.skill-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skill-progress-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.mini-progress {
  flex: 1;
  height: 8px;
  background: var(--bg-primary);
  border-radius: 999px;
  overflow: hidden;
}

.mini-progress div {
  height: 100%;
  background: linear-gradient(90deg, var(--warning), var(--accent-2));
  border-radius: 999px;
}

.percentage {
  font-weight: 700;
  color: var(--warning);
}

/* Opportunities */
.opportunities-container {
  max-width: 1200px;
  margin: 0 auto;
}

.opportunities-header {
  margin-bottom: 2rem;
}

.filter-tabs {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.filter-tabs button {
  padding: 0.75rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.filter-tabs button.active {
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  border-color: transparent;
  color: white;
}

.opportunities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.opportunity-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.opportunity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.3);
}

.opp-type {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: white;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.opportunity-card h3 {
  margin-bottom: 0.5rem;
}

.company {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.opp-details {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.opp-details span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.difficulty {
  padding: 0.25rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: 999px;
}

.opp-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.opp-skill {
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.opp-reward {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
  border: 1px solid var(--warning);
  border-radius: 12px;
  color: var(--warning);
  font-weight: 700;
  margin-bottom: 1rem;
}

.btn-apply {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-apply:hover {
  transform: translateY(-2px);
}

/* Community */
.community-container {
  max-width: 900px;
  margin: 0 auto;
}

.post-form {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.post-form h3 {
  margin-bottom: 1.5rem;
}

.post-form form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-form input,
.post-form textarea {
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
}

.post-form textarea {
  min-height: 120px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-actions select {
  flex: 1;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 12px;
  font-family: inherit;
  cursor: pointer;
}

.posts-list {
  margin-bottom: 2rem;
}

.posts-list h3 {
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px dashed var(--border);
  border-radius: 16px;
}

.post-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.category-badge {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-1);
}

.post-card p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.post-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.author {
  font-weight: 600;
}

.replies {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.motivation-section {
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  border-radius: 20px;
  padding: 2rem;
  color: white;
}

.motivation-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.motivation-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
}

.motivation-card p {
  font-size: 1.25rem;
  font-weight: 500;
  font-style: italic;
}

/* Profile */
.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.profile-info h2 {
  margin-bottom: 0.5rem;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card-large {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-card-large svg {
  color: var(--accent-1);
  min-width: 32px;
}

.stat-card-large h3 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.stat-card-large p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.profile-sections {
  display: grid;
  gap: 2rem;
}

.profile-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
}

.profile-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.toggle-switch {
  width: 60px;
  height: 32px;
  background: var(--border);
  border: none;
  border-radius: 999px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-switch.active {
  background: var(--accent-1);
}

.toggle-slider {
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: all 0.3s;
}

.toggle-switch.active .toggle-slider {
  left: 31px;
}

.profile-section.danger {
  border-color: var(--danger);
}

.btn-danger {
  padding: 1rem 2rem;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(239, 68, 68, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }

  .main-content {
    margin-left: 0;
  }

  .sidebar.closed {
    width: 100%;
  }

  .page-content {
    padding: 1rem;
  }

  .domains-grid,
  .opportunities-grid {
    grid-template-columns: 1fr;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
export default CareerPathApp;