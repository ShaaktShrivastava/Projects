import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';
import { 
  CommentsSection, 
  PhotoGallery, 
  UserProfileModal, 
  VerificationSection, 
  GovernmentResponse 
} from './EnhancedFeatures';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different statuses
const createCustomIcon = (status) => {
  const colors = {
    'Open': '#f59e0b',
    'In Progress': '#3b82f6',
    'Resolved': '#10b981'
  };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${colors[status]}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  // Mock user database (in real app, this would be on backend)
  const [users, setUsers] = useState({
    'shaakt': { password: 'Test123', fullName: 'Shaakt' },
    'rajesh': { password: 'pass123', fullName: 'Rajesh Kumar' },
    'priya': { password: 'pass123', fullName: 'Priya Sharma' },
    'amit': { password: 'pass123', fullName: 'Amit Patel' },
    'sneha': { password: 'pass123', fullName: 'Sneha Reddy' },
    'admin': { password: 'admin123', fullName: 'Admin User', isAdmin: true }
  });

  const [showUserManagement, setShowUserManagement] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    fullName: ''
  });
  const [userManagementError, setUserManagementError] = useState('');
  const [userManagementSuccess, setUserManagementSuccess] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const username = loginData.username.toLowerCase();
    
    if (users[username] && users[username].password === loginData.password) {
      setIsLoggedIn(true);
      setCurrentUser(users[username].fullName);
      setLoginError('');
      setLoginData({ username: '', password: '' });
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setActiveSection('issues');
    setShowUserManagement(false);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const username = newUserData.username.toLowerCase().trim();
    
    // Validation
    if (username.length < 3) {
      setUserManagementError('Username must be at least 3 characters');
      return;
    }
    
    if (newUserData.password.length < 6) {
      setUserManagementError('Password must be at least 6 characters');
      return;
    }
    
    if (newUserData.fullName.trim().length < 3) {
      setUserManagementError('Full name must be at least 3 characters');
      return;
    }
    
    if (users[username]) {
      setUserManagementError('Username already exists');
      return;
    }
    
    // Add new user
    setUsers({
      ...users,
      [username]: {
        password: newUserData.password,
        fullName: newUserData.fullName.trim()
      }
    });
    
    setUserManagementSuccess(`User "${username}" added successfully!`);
    setUserManagementError('');
    setNewUserData({ username: '', password: '', fullName: '' });
    
    // Clear success message after 3 seconds
    setTimeout(() => setUserManagementSuccess(''), 3000);
  };

  const handleDeleteUser = (username) => {
    if (username === 'admin') {
      setUserManagementError('Cannot delete admin user');
      setTimeout(() => setUserManagementError(''), 3000);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      const updatedUsers = { ...users };
      delete updatedUsers[username];
      setUsers(updatedUsers);
      setUserManagementSuccess(`User "${username}" deleted successfully!`);
      setTimeout(() => setUserManagementSuccess(''), 3000);
    }
  };

  const isAdmin = users[loginData.username?.toLowerCase()]?.isAdmin || false;

  // Comments state
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState({});
  
  // User profiles state
  const [userProfiles, setUserProfiles] = useState({
    'Rajesh Kumar': { badges: ['First Reporter', 'Top Contributor'], points: 150, issuesReported: 2 },
    'Priya Sharma': { badges: ['Active Member'], points: 80, issuesReported: 2 },
    'Amit Patel': { badges: [], points: 30, issuesReported: 1 },
    'Sneha Reddy': { badges: [], points: 25, issuesReported: 1 },
    'Ananya Banerjee': { badges: ['Problem Solver'], points: 45, issuesReported: 1 },
    'Vikram Singh': { badges: [], points: 20, issuesReported: 1 }
  });
  
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [issues, setIssues] = useState([
    { 
      id: 1, 
      title: 'Deep Pothole on MG Road causing accidents', 
      category: 'Roads', 
      status: 'Open', 
      votes: 45, 
      description: 'A large pothole approximately 2 feet wide and 8 inches deep has formed near the traffic signal at MG Road junction. Multiple two-wheelers have skidded here during monsoon. The pothole fills with water making it invisible to drivers. Urgent repair needed as it poses serious safety risk to commuters, especially during peak hours.', 
      location: 'MG Road, Near Indiranagar Metro Station, Bangalore', 
      date: '2025-11-10', 
      reportedBy: 'Rajesh Kumar',
      verifications: 12,
      images: ['https://imgs.search.brave.com/3v9uyHNSEoEt1kKC0sJBs1d3a22r7W_brfsSVlpSwzY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNjYv/MjM0LzAwMC9zbWFs/bC9kZWVwLXBvdGhv/bGVzLWNyZWF0ZS1v/YnN0YWNsZXMtb24t/YS1ydXJhbC1yb2Fk/LXdpdGgtcmFpbndh/dGVyLXBvb2xpbmct/aW4tb25lLW9mLXRo/ZW0tb24tYS1jbG91/ZHktZGF5LWR1cmlu/Zy1lYXJseS1zcHJp/bmctcGhvdG8uanBn'],
      govResponse: { 
        department: 'BBMP Road Maintenance', 
        official: 'Mr. Kumar Singh',
        response: 'Issue has been noted. Our team will inspect the site within 48 hours.',
        estimatedResolution: '7-10 days',
        lastUpdated: '2025-11-11'
      }
    },
    { 
      id: 2, 
      title: 'Overflowing garbage bins at market area', 
      category: 'Waste', 
      status: 'In Progress', 
      votes: 38, 
      description: 'The municipal garbage bins at Sarojini Nagar Market have been overflowing for the past week. Waste is scattered on the road attracting stray dogs and creating unhygienic conditions. The foul smell is unbearable for shopkeepers and customers. Despite multiple complaints, garbage collection has been irregular. This is affecting local businesses and public health.', 
      location: 'Sarojini Nagar Market, New Delhi', 
      date: '2025-11-08', 
      reportedBy: 'Priya Sharma',
      verifications: 8,
      images: ['https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&q=80'],
      govResponse: { 
        department: 'MCD Sanitation Department', 
        official: 'Mrs. Anjali Verma',
        response: 'Garbage collection schedule has been revised. Additional bins will be installed within 3 days.',
        estimatedResolution: '3-5 days',
        lastUpdated: '2025-11-09'
      }
    },
    { 
      id: 3, 
      title: 'Broken streetlights on highway', 
      category: 'Lighting', 
      status: 'Open', 
      votes: 32, 
      description: 'A 2km stretch of Eastern Express Highway near Vikhroli has non-functional streetlights for over 3 weeks. This dark patch has become a safety concern with increased incidents of chain snatching and accidents. Women commuters feel unsafe walking here after sunset. The area needs immediate attention as it connects residential areas to the railway station.', 
      location: 'Eastern Express Highway, Vikhroli, Mumbai', 
      date: '2025-11-12', 
      reportedBy: 'Rajesh Kumar',
      verifications: 15,
      images: ['https://imgs.search.brave.com/UY3GQf0QkU4I0a77CF0Gw7IV6BSoTWBEA19XBMKwyMk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI5/MDA4NTI2Ny9waG90/by9icm9rZW4tZWxl/Y3RyaWNpdHktd2ly/ZXMtaGFuZ2luZy1m/cm9tLWEtc3Rvcm0t/ZGFtYWdlZC1zdWJ1/cmJhbi1saWdodC1w/b2xlLmpwZz9zPTYx/Mng2MTImdz0wJms9/MjAmYz1rWUk2T1hr/V3JRd0pYbUVHUTRN/QUJrWlh1SVBzYURW/a29NcWV2ZGgxX2w4/PQ'],
      govResponse: { 
        department: 'BMC Electrical Department', 
        official: 'Mr. Suresh Patil',
        response: 'Inspection completed. Replacement of 45 streetlights has been approved and work will commence shortly.',
        estimatedResolution: '10-14 days',
        lastUpdated: '2025-11-13'
      }
    },
    { 
      id: 5, 
      title: 'Park equipment damaged and unsafe for children', 
      category: 'Parks', 
      status: 'In Progress', 
      votes: 22, 
      description: 'The children\'s play area at Nehru Park has multiple broken swings with exposed sharp edges, a slide with cracked surface, and see-saws with rusted joints. A child recently got injured on the broken swing. The park is heavily used by families in the evening but the equipment hasn\'t been maintained for years. Parents are worried about children\'s safety.', 
      location: 'Nehru Park, Koramangala, Bangalore', 
      date: '2025-11-09', 
      reportedBy: 'Sneha Reddy',
      verifications: 10,
      images: ['https://imgs.search.brave.com/0h1JY6OjQDD9RUEHyGWJ2bAbtMux08n4CXxg-nPXz78/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudG9paW1nLmNv/bS90aHVtYi9tc2lk/LTY4MDMxMzk3LGlt/Z3NpemUtODE0MDA2/LHdpZHRoLTQwMCxo/ZWlnaHQtMjI1LHJl/c2l6ZW1vZGUtNzIv/NjgwMzEzOTcuanBn'],
      govResponse: { 
        department: 'BBMP Parks Department', 
        official: 'Ms. Lakshmi Rao',
        response: 'New equipment has been ordered. Old equipment will be removed and replaced within 2 weeks.',
        estimatedResolution: '12-15 days',
        lastUpdated: '2025-11-10'
      }
    },
    { 
      id: 7, 
      title: 'Water pipeline leakage wasting thousands of liters', 
      category: 'Other', 
      status: 'Resolved', 
      votes: 41, 
      description: 'A major water pipeline burst near Salt Lake Stadium is wasting approximately 10,000 liters of water daily. The leaked water has created a large puddle on the road causing traffic issues and making the area slippery. In a city facing water scarcity, this wastage is unacceptable. The leak has been ongoing for 5 days and needs immediate repair by the water board.', 
      location: 'Near Salt Lake Stadium, Kolkata', 
      date: '2025-11-05', 
      reportedBy: 'Ananya Banerjee',
      verifications: 20,
      images: ['https://imgs.search.brave.com/F0itY_NWXhoA0qvMdaXGrDfDSZAXJOP_0lu6ZrOeSko/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNjA3/NjAyMzE2L3Bob3Rv/L3dhc3Rpbmctd2F0/ZXItd2F0ZXItbGVh/a2luZy1mcm9tLWhv/bGUtaW4tYS1ob3Nl/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz1qdlpZY09iQWhy/SE1kSWgxNFVmRVFh/TEM1dnk2YmJZNzRJ/ZGRfekk4UHR3PQ'],
      govResponse: { 
        department: 'Kolkata Water Board', 
        official: 'Mr. Debashis Sen',
        response: 'Pipeline has been repaired successfully. Water supply has been restored to normal.',
        estimatedResolution: 'Completed',
        lastUpdated: '2025-11-07'
      }
    },
    { 
      id: 8, 
      title: 'Encroachment on footpath by vendors', 
      category: 'Other', 
      status: 'Open', 
      votes: 15, 
      description: 'Street vendors have completely occupied the footpath on Commercial Street forcing pedestrians to walk on the busy road. This is extremely dangerous especially for elderly people and children. The 500-meter stretch has become impassable for wheelchairs and strollers. While vendors need livelihood, a proper solution is needed that doesn\'t compromise pedestrian safety.', 
      location: 'Commercial Street, Bangalore', 
      date: '2025-11-13', 
      reportedBy: 'Priya Sharma',
      verifications: 3,
      images: ['https://imgs.search.brave.com/z0wnpqgeMs0hhi_Fii-bvqM7MgC_xSBVSar9YEZLq1U/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9xdWVz/dGlvbm9mY2l0aWVz/Lm9yZy93cC1jb250/ZW50L3VwbG9hZHMv/MjAyNC8wMS9Gb290/cGF0aHMtb2YtSW5k/aWFfLU1pY3JvY29z/bXMtb2Ytb3VyLWxp/dmVzLWFuZC1zaGFy/ZWQtc3BhY2VzLS5q/cGc']
    }
  ]);

  const [activeSection, setActiveSection] = useState('issues');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('votes');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m your CivicVoice assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Roads',
    description: '',
    location: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  const categories = ['All', 'Roads', 'Lighting', 'Waste', 'Parks', 'Other'];
  const statuses = ['Open', 'In Progress', 'Resolved'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newIssue = {
      id: issues.length + 1,
      ...formData,
      status: 'Open',
      votes: 0,
      date: new Date().toISOString().split('T')[0],
      reportedBy: currentUser
    };
    setIssues([newIssue, ...issues]);
    setFormData({ title: '', category: 'Roads', description: '', location: '', image: null });
    setImagePreview(null);
    setShowForm(false);
  };

  // Calculate leaderboard data
  const getLeaderboard = () => {
    const userStats = {};
    
    issues.forEach(issue => {
      const user = issue.reportedBy;
      if (!userStats[user]) {
        userStats[user] = {
          name: user,
          issuesReported: 0,
          totalVotes: 0,
          resolvedIssues: 0
        };
      }
      userStats[user].issuesReported++;
      userStats[user].totalVotes += issue.votes;
      if (issue.status === 'Resolved') {
        userStats[user].resolvedIssues++;
      }
    });

    return Object.values(userStats).sort((a, b) => b.issuesReported - a.issuesReported);
  };

  const handleVote = (id) => {
    setIssues(issues.map(issue => 
      issue.id === id ? { ...issue, votes: issue.votes + 1 } : issue
    ));
  };

  const handleStatusChange = (id, newStatus) => {
    setIssues(issues.map(issue =>
      issue.id === id ? { ...issue, status: newStatus } : issue
    ));
  };

  const filteredIssues = issues
    .filter(issue => filter === 'All' || issue.category === filter)
    .sort((a, b) => {
      if (sortBy === 'votes') return b.votes - a.votes;
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      return 0;
    });

  // Enhanced Features Handlers
  const [verifiedIssues, setVerifiedIssues] = useState({});
  
  const handleAddComment = (issueId, comment) => {
    setComments({
      ...comments,
      [issueId]: [...(comments[issueId] || []), comment]
    });
    
    // Award points to user
    if (userProfiles[currentUser]) {
      setUserProfiles({
        ...userProfiles,
        [currentUser]: {
          ...userProfiles[currentUser],
          points: userProfiles[currentUser].points + 5
        }
      });
    }
  };

  const handleVerify = (issueId) => {
    if (verifiedIssues[issueId]?.includes(currentUser)) {
      return; // Already verified
    }

    setIssues(issues.map(issue =>
      issue.id === issueId 
        ? { ...issue, verifications: (issue.verifications || 0) + 1 }
        : issue
    ));

    setVerifiedIssues({
      ...verifiedIssues,
      [issueId]: [...(verifiedIssues[issueId] || []), currentUser]
    });

    // Award points to user
    if (userProfiles[currentUser]) {
      setUserProfiles({
        ...userProfiles,
        [currentUser]: {
          ...userProfiles[currentUser],
          points: userProfiles[currentUser].points + 10
        }
      });
    }
  };

  const handleViewProfile = (userName) => {
    setSelectedProfile(userName);
    setShowProfileModal(true);
  };

  const handleViewIssueDetail = (issue) => {
    setSelectedIssue(issue);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', text: chatInput };
    setChatMessages([...chatMessages, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(chatInput);
      setChatMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    }, 800);

    setChatInput('');
  };

  const generateBotResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('report') || lowerInput.includes('submit')) {
      return 'To report an issue, click the "Report New Issue" button at the top of the page. Fill in the title, category, location, and description, then submit!';
    } else if (lowerInput.includes('vote') || lowerInput.includes('support')) {
      return 'You can vote on any issue by clicking the 👍 button on the issue card. This helps prioritize issues that affect more people.';
    } else if (lowerInput.includes('status') || lowerInput.includes('track')) {
      return 'Each issue has a status badge (Open, In Progress, or Resolved). You can filter issues by status and track their progress over time.';
    } else if (lowerInput.includes('category') || lowerInput.includes('filter')) {
      return 'We have several categories: Roads, Lighting, Vandalism, Waste, Parks, and Other. Use the filter dropdown to view issues by category.';
    } else if (lowerInput.includes('how') || lowerInput.includes('help')) {
      return 'CivicVoice helps you report civic issues in your community. You can report problems, vote on existing issues, and track their resolution. What would you like to do?';
    } else if (lowerInput.includes('contact') || lowerInput.includes('support')) {
      return 'For additional support, you can reach out to your local government office or check the About section for more contact information.';
    } else {
      return 'I can help you with reporting issues, voting, tracking status, and navigating the platform. What would you like to know more about?';
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-header">
            <h1>🏛️ CivicVoice</h1>
            <p>Empowering communities through civic engagement</p>
          </div>

          <div className="login-box">
            <h2>{showRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="login-subtitle">
              {showRegister 
                ? 'Join us to report and track civic issues' 
                : 'Sign in to continue to CivicVoice'}
            </p>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                  className="login-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="login-input"
                />
              </div>

              {loginError && (
                <div className="login-error">
                  ⚠️ {loginError}
                </div>
              )}

              <button type="submit" className="login-btn">
                {showRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                {showRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                  className="toggle-form-btn"
                  onClick={() => {
                    setShowRegister(!showRegister);
                    setLoginError('');
                  }}
                >
                  {showRegister ? 'Sign In' : 'Create Account'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <div>
            <h1>🏛️ CivicVoice</h1>
            <p>Report and track civic issues in your community</p>
          </div>
          <div className="user-section">
            <span className="welcome-text">Welcome, {currentUser}</span>
            {users[Object.keys(users).find(u => users[u].fullName === currentUser)]?.isAdmin && (
              <button onClick={() => setShowUserManagement(!showUserManagement)} className="admin-btn">
                👥 Manage Users
              </button>
            )}
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="navbar">
        <div className="container">
          <div className="nav-links">
            <button 
              className={`nav-link ${activeSection === 'issues' ? 'active' : ''}`}
              onClick={() => setActiveSection('issues')}
            >
              📋 Issues
            </button>
            <button 
              className={`nav-link ${activeSection === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveSection('analytics')}
            >
              📊 Analytics
            </button>
            <button 
              className={`nav-link ${activeSection === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('leaderboard')}
            >
              🏆 Leaderboard
            </button>
            <button 
              className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
              onClick={() => setActiveSection('about')}
            >
              ℹ️ About
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        {activeSection === 'issues' && (
          <>
            <div className="actions-bar">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Report New Issue'}
          </button>
          
          <div className="filters">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select">
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select">
              <option value="votes">Most Voted</option>
              <option value="date">Most Recent</option>
            </select>
          </div>
        </div>

        {showForm && (
          <form className="issue-form" onSubmit={handleSubmit}>
            <h2>Report a Civic Issue</h2>
            
            <input
              type="text"
              placeholder="Issue Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="input"
            />
            
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="select"
            >
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="input"
            />
            
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="textarea"
              rows="4"
            />

            <div className="image-upload-section">
              <label className="image-upload-label">
                📷 Upload Image (Optional)
              </label>
              
              {!imagePreview ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="image-input"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="image-upload-button">
                    <span className="upload-icon">📁</span>
                    <span className="upload-text">Click to upload or drag and drop</span>
                    <span className="upload-hint">PNG, JPG, JPEG (max 5MB)</span>
                  </label>
                </div>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    className="remove-image-btn"
                  >
                    ✕ Remove Image
                  </button>
                </div>
              )}
            </div>
            
            <button type="submit" className="btn-primary">Submit Issue</button>
          </form>
        )}

        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{issues.length}</div>
            <div className="stat-label">Total Issues</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{issues.filter(i => i.status === 'Open').length}</div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{issues.filter(i => i.status === 'In Progress').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{issues.filter(i => i.status === 'Resolved').length}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        <div className="issues-list">
          {filteredIssues.map(issue => (
            <div key={issue.id} className="issue-card">
              {/* Photo Gallery */}
              {issue.images && issue.images.length > 0 && (
                <PhotoGallery images={issue.images} />
              )}
              
              <div className="issue-content">
                <div className="issue-header">
                  <h3>{issue.title}</h3>
                  <span className={`badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>
                    {issue.status}
                  </span>
                </div>
                
                <div className="issue-meta">
                  <span className="category-tag">{issue.category}</span>
                  <span className="location">📍 {issue.location}</span>
                  <span className="date">📅 {issue.date}</span>
                </div>
                
                <p className="issue-description">{issue.description}</p>
                
                <div className="issue-reporter">
                  <span className="reporter-label">Reported by:</span>
                  <span 
                    className="reporter-name user-profile-link" 
                    onClick={() => handleViewProfile(issue.reportedBy)}
                  >
                    {issue.reportedBy}
                  </span>
                  {userProfiles[issue.reportedBy]?.badges?.length > 0 && (
                    <span className="user-badge-mini">
                      🏆 {userProfiles[issue.reportedBy].badges[0]}
                    </span>
                  )}
                </div>
                
                <div className="issue-footer">
                  <button 
                    className="vote-btn"
                    onClick={() => handleVote(issue.id)}
                  >
                    👍 {issue.votes} votes
                  </button>
                  
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    className="status-select"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Verification Section */}
                <VerificationSection 
                  issue={issue}
                  onVerify={handleVerify}
                  currentUser={currentUser}
                  hasVerified={verifiedIssues[issue.id]?.includes(currentUser)}
                />

                {/* Government Response */}
                {issue.govResponse && (
                  <GovernmentResponse govResponse={issue.govResponse} />
                )}

                {/* Comments Section */}
                <CommentsSection 
                  issueId={issue.id}
                  comments={comments}
                  onAddComment={handleAddComment}
                  currentUser={currentUser}
                />
              </div>
            </div>
          ))}
        </div>
          </>
        )}

        {activeSection === 'map' && (
          <div className="section-content">
            <h2>🗺️ Map View</h2>
            <p className="map-subtitle">Interactive map showing all reported issues across India</p>
            
            <div className="map-controls">
              <div className="map-legend">
                <h3>Legend</h3>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="marker-dot open"></span>
                    <span>Open Issues ({issues.filter(i => i.status === 'Open').length})</span>
                  </div>
                  <div className="legend-item">
                    <span className="marker-dot progress"></span>
                    <span>In Progress ({issues.filter(i => i.status === 'In Progress').length})</span>
                  </div>
                  <div className="legend-item">
                    <span className="marker-dot resolved"></span>
                    <span>Resolved ({issues.filter(i => i.status === 'Resolved').length})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="map-container-wrapper">
              <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={5} 
                style={{ height: '600px', width: '100%', borderRadius: '12px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {issues.map(issue => (
                  issue.coordinates && (
                    <Marker 
                      key={issue.id} 
                      position={issue.coordinates}
                      icon={createCustomIcon(issue.status)}
                    >
                      <Popup maxWidth={300}>
                        <div className="map-popup">
                          <h3 className="popup-title">{issue.title}</h3>
                          <div className="popup-meta">
                            <span className={`popup-badge badge-${issue.status.toLowerCase().replace(' ', '-')}`}>
                              {issue.status}
                            </span>
                            <span className="popup-category">{issue.category}</span>
                          </div>
                          <p className="popup-location">📍 {issue.location}</p>
                          <p className="popup-description">{issue.description.substring(0, 150)}...</p>
                          <div className="popup-footer">
                            <span className="popup-votes">👍 {issue.votes} votes</span>
                            <span className="popup-date">📅 {issue.date}</span>
                          </div>
                          <div className="popup-reporter">
                            Reported by: <strong>{issue.reportedBy}</strong>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>

            <div className="map-stats">
              <div className="map-stat-card">
                <div className="map-stat-icon">📍</div>
                <div className="map-stat-content">
                  <div className="map-stat-number">{issues.length}</div>
                  <div className="map-stat-label">Total Markers</div>
                </div>
              </div>
              <div className="map-stat-card">
                <div className="map-stat-icon">🏙️</div>
                <div className="map-stat-content">
                  <div className="map-stat-number">{new Set(issues.map(i => i.location.split(',').pop().trim())).size}</div>
                  <div className="map-stat-label">Cities Covered</div>
                </div>
              </div>
              <div className="map-stat-card">
                <div className="map-stat-icon">🔥</div>
                <div className="map-stat-content">
                  <div className="map-stat-number">{issues.filter(i => i.status === 'Open').length}</div>
                  <div className="map-stat-label">Need Attention</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="section-content">
            <h2>📊 Analytics Dashboard</h2>
            <p className="analytics-subtitle">Comprehensive insights into civic issues and community engagement</p>
            
            {/* Summary Stats */}
            <div className="analytics-summary">
              <div className="summary-card">
                <div className="summary-icon">📝</div>
                <div className="summary-content">
                  <div className="summary-number">{issues.length}</div>
                  <div className="summary-label">Total Issues</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">⏳</div>
                <div className="summary-content">
                  <div className="summary-number">{issues.filter(i => i.status === 'Open').length}</div>
                  <div className="summary-label">Pending</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">🔄</div>
                <div className="summary-content">
                  <div className="summary-number">{issues.filter(i => i.status === 'In Progress').length}</div>
                  <div className="summary-label">In Progress</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">✅</div>
                <div className="summary-content">
                  <div className="summary-number">{issues.filter(i => i.status === 'Resolved').length}</div>
                  <div className="summary-label">Resolved</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">👍</div>
                <div className="summary-content">
                  <div className="summary-number">{issues.reduce((sum, i) => sum + i.votes, 0)}</div>
                  <div className="summary-label">Total Votes</div>
                </div>
              </div>
            </div>

            {/* Main Analytics Grid */}
            <div className="analytics-grid">
              {/* Issues by Category */}
              <div className="analytics-card category-chart">
                <h3>📂 Issues by Category</h3>
                <div className="category-bars">
                  {(() => {
                    const categoryCounts = {};
                    categories.filter(c => c !== 'All').forEach(cat => {
                      categoryCounts[cat] = issues.filter(i => i.category === cat).length;
                    });
                    const maxCount = Math.max(...Object.values(categoryCounts), 1);
                    
                    return Object.entries(categoryCounts).map(([cat, count]) => (
                      <div key={cat} className="category-bar-item">
                        <div className="category-label">
                          <span className="cat-name">{cat}</span>
                          <span className="cat-count">{count}</span>
                        </div>
                        <div className="category-bar-bg">
                          <div 
                            className="category-bar-fill" 
                            style={{width: `${(count / maxCount) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="analytics-card">
                <h3>📊 Status Distribution</h3>
                <div className="status-chart">
                  {(() => {
                    const openCount = issues.filter(i => i.status === 'Open').length;
                    const progressCount = issues.filter(i => i.status === 'In Progress').length;
                    const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
                    const total = issues.length || 1;
                    
                    return (
                      <>
                        <div className="status-item">
                          <div className="status-info">
                            <span className="status-dot open"></span>
                            <span className="status-name">Open</span>
                          </div>
                          <div className="status-bar-container">
                            <div className="status-bar open" style={{width: `${(openCount/total)*100}%`}}></div>
                          </div>
                          <span className="status-percent">{Math.round((openCount/total)*100)}%</span>
                        </div>
                        <div className="status-item">
                          <div className="status-info">
                            <span className="status-dot progress"></span>
                            <span className="status-name">In Progress</span>
                          </div>
                          <div className="status-bar-container">
                            <div className="status-bar progress" style={{width: `${(progressCount/total)*100}%`}}></div>
                          </div>
                          <span className="status-percent">{Math.round((progressCount/total)*100)}%</span>
                        </div>
                        <div className="status-item">
                          <div className="status-info">
                            <span className="status-dot resolved"></span>
                            <span className="status-name">Resolved</span>
                          </div>
                          <div className="status-bar-container">
                            <div className="status-bar resolved" style={{width: `${(resolvedCount/total)*100}%`}}></div>
                          </div>
                          <span className="status-percent">{Math.round((resolvedCount/total)*100)}%</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Resolution Rate */}
              <div className="analytics-card metric-card">
                <h3>✅ Resolution Rate</h3>
                <div className="metric-circle">
                  <svg viewBox="0 0 100 100" className="circular-chart">
                    <circle className="circle-bg" cx="50" cy="50" r="40"></circle>
                    <circle 
                      className="circle-progress" 
                      cx="50" 
                      cy="50" 
                      r="40"
                      style={{
                        strokeDasharray: `${(issues.filter(i => i.status === 'Resolved').length / (issues.length || 1)) * 251.2}, 251.2`
                      }}
                    ></circle>
                  </svg>
                  <div className="metric-value">
                    {Math.round((issues.filter(i => i.status === 'Resolved').length / (issues.length || 1)) * 100)}%
                  </div>
                </div>
                <p className="metric-description">
                  {issues.filter(i => i.status === 'Resolved').length} out of {issues.length} issues resolved
                </p>
              </div>

              {/* Top Voted Issues */}
              <div className="analytics-card">
                <h3>🔥 Most Voted Issues</h3>
                <div className="top-issues-list">
                  {issues
                    .sort((a, b) => b.votes - a.votes)
                    .slice(0, 5)
                    .map((issue, index) => (
                      <div key={issue.id} className="top-issue-item">
                        <div className="issue-rank">#{index + 1}</div>
                        <div className="issue-details">
                          <div className="issue-title-small">{issue.title}</div>
                          <div className="issue-meta-small">
                            <span className="issue-category-small">{issue.category}</span>
                            <span className="issue-votes-small">👍 {issue.votes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="analytics-card">
                <h3>⏰ Recent Activity</h3>
                <div className="recent-activity-list">
                  {issues
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map(issue => (
                      <div key={issue.id} className="activity-item">
                        <div className="activity-icon">
                          {issue.status === 'Resolved' ? '✅' : 
                           issue.status === 'In Progress' ? '🔄' : '📝'}
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">{issue.title}</div>
                          <div className="activity-meta">
                            {issue.reportedBy} • {issue.date}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Community Stats */}
              <div className="analytics-card">
                <h3>👥 Community Impact</h3>
                <div className="community-stats">
                  <div className="community-stat-item">
                    <div className="stat-icon">👤</div>
                    <div className="stat-info">
                      <div className="stat-number">{new Set(issues.map(i => i.reportedBy)).size}</div>
                      <div className="stat-label">Active Contributors</div>
                    </div>
                  </div>
                  <div className="community-stat-item">
                    <div className="stat-icon">📍</div>
                    <div className="stat-info">
                      <div className="stat-number">{new Set(issues.map(i => i.location.split(',')[0])).size}</div>
                      <div className="stat-label">Locations Covered</div>
                    </div>
                  </div>
                  <div className="community-stat-item">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                      <div className="stat-number">{Math.round(issues.reduce((sum, i) => sum + i.votes, 0) / issues.length)}</div>
                      <div className="stat-label">Avg Votes per Issue</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'leaderboard' && (
          <div className="section-content">
            <h2>🏆 Community Leaderboard</h2>
            <p className="leaderboard-subtitle">Top contributors making a difference in our community</p>
            
            <div className="leaderboard-list">
              {getLeaderboard().map((user, index) => (
                <div key={user.name} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                  <div className="rank-badge">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  
                  <div className="user-info">
                    <div className="user-name">
                      {user.name}
                      {user.name === currentUser && <span className="you-badge">You</span>}
                    </div>
                    <div className="user-stats-row">
                      <span className="stat-item">📝 {user.issuesReported} issues reported</span>
                      <span className="stat-item">👍 {user.totalVotes} total votes</span>
                      <span className="stat-item">✅ {user.resolvedIssues} resolved</span>
                    </div>
                  </div>
                  
                  <div className="user-score">
                    <div className="score-number">{user.issuesReported}</div>
                    <div className="score-label">Reports</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="leaderboard-info">
              <h3>How Rankings Work</h3>
              <p>Users are ranked based on the total number of civic issues they've reported to the platform. The more issues you report, the higher your ranking!</p>
              <p>Keep contributing to make your community a better place! 🌟</p>
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="section-content">
            <h2>ℹ️ About CivicVoice</h2>
            <div className="about-content">
              <div className="about-section">
                <h3>Our Mission</h3>
                <p>CivicVoice empowers citizens to actively participate in improving their communities by providing a transparent platform for reporting and tracking civic issues.</p>
              </div>
              <div className="about-section">
                <h3>How It Works</h3>
                <ol>
                  <li><strong>Report:</strong> Submit civic issues you encounter in your community</li>
                  <li><strong>Vote:</strong> Support issues that matter to you to help prioritize them</li>
                  <li><strong>Track:</strong> Monitor the progress of reported issues from submission to resolution</li>
                  <li><strong>Engage:</strong> Connect with your local government and fellow citizens</li>
                </ol>
              </div>
              <div className="about-section">
                <h3>Contact Information</h3>
                <p>📧 Email: support@civicvoice.org</p>
                <p>📞 Phone: (555) 123-4567</p>
                <p>🏢 Address: 123 Democracy Ave, Your City</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* User Management Panel */}
      {showUserManagement && (
        <div className="user-management-overlay" onClick={() => setShowUserManagement(false)}>
          <div className="user-management-panel" onClick={(e) => e.stopPropagation()}>
            <div className="user-management-header">
              <h2>👥 User Management</h2>
              <button className="close-panel-btn" onClick={() => setShowUserManagement(false)}>
                ✕
              </button>
            </div>

            {/* Add New User Form */}
            <div className="add-user-section">
              <h3>Add New User</h3>
              <form onSubmit={handleAddUser} className="add-user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="new-username">Username</label>
                    <input
                      type="text"
                      id="new-username"
                      value={newUserData.username}
                      onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                      placeholder="Enter username"
                      required
                      className="user-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-fullname">Full Name</label>
                    <input
                      type="text"
                      id="new-fullname"
                      value={newUserData.fullName}
                      onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                      placeholder="Enter full name"
                      required
                      className="user-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="new-password">Password</label>
                  <input
                    type="text"
                    id="new-password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    required
                    className="user-input"
                  />
                </div>

                {userManagementError && (
                  <div className="user-management-error">
                    ⚠️ {userManagementError}
                  </div>
                )}

                {userManagementSuccess && (
                  <div className="user-management-success">
                    ✅ {userManagementSuccess}
                  </div>
                )}

                <button type="submit" className="add-user-btn">
                  ➕ Add User
                </button>
              </form>
            </div>

            {/* Existing Users List */}
            <div className="users-list-section">
              <h3>Existing Users ({Object.keys(users).length})</h3>
              <div className="users-list">
                {Object.entries(users).map(([username, userData]) => (
                  <div key={username} className="user-item">
                    <div className="user-item-info">
                      <div className="user-item-header">
                        <span className="user-item-name">{userData.fullName}</span>
                        {userData.isAdmin && <span className="admin-badge">Admin</span>}
                      </div>
                      <div className="user-item-details">
                        <span className="user-item-username">@{username}</span>
                        <span className="user-item-password">🔑 {userData.password}</span>
                      </div>
                    </div>
                    {!userData.isAdmin && (
                      <button 
                        className="delete-user-btn"
                        onClick={() => handleDeleteUser(username)}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <div className={`chatbot ${chatOpen ? 'open' : ''}`}>
        <div className="chat-header" onClick={() => setChatOpen(!chatOpen)}>
          <span>🤖 AI Assistant</span>
          <span className="chat-toggle">{chatOpen ? '−' : '+'}</span>
        </div>
        {chatOpen && (
          <>
            <div className="chat-messages">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
            </div>
            <form className="chat-input-form" onSubmit={handleChatSubmit}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything..."
                className="chat-input"
              />
              <button type="submit" className="chat-send">Send</button>
            </form>
          </>
        )}
      </div>

      {/* User Profile Modal */}
      {showProfileModal && selectedProfile && (
        <UserProfileModal 
          user={selectedProfile}
          profile={userProfiles[selectedProfile]}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedProfile(null);
          }}
        />
      )}

      <footer className="footer">
        <p>© 2025 CivicVoice - Empowering communities through civic engagement</p>
      </footer>
    </div>
  );
}

export default App;
