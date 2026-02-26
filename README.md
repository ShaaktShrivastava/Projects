# CivicVoice - Civic Issues Platform

A React-based platform for reporting and tracking civic issues in your community.

## Features

- 🗺️ Interactive map for issue reporting
- 📱 Mobile-responsive design
- 📊 Issue tracking and management
- 🤖 AI-powered chatbot assistant for user guidance
- 👥 User management system with authentication
- 🏆 Community leaderboard and analytics
- 💬 Comments and verification system
- 🎨 Modern UI with enhanced features

## Tech Stack

- **Frontend:** React 19, Vite
- **Mapping:** Leaflet, React-Leaflet
- **Styling:** CSS3

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd civic-issues-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Key Features

### AI Chatbot Assistant
The platform includes an intelligent chatbot that helps users navigate the system:
- **Guidance**: Provides step-by-step instructions for reporting issues
- **Support**: Answers questions about voting, tracking, and platform features
- **Interactive**: Responds to natural language queries about civic engagement
- **Accessible**: Available via the floating chat widget (🤖 icon)

### User Authentication
- Secure login system with role-based access
- Admin panel for user management
- User profiles with badges and points system

### Issue Management
- Report civic issues with photos and detailed descriptions
- Vote on issues to prioritize community concerns
- Track issue status from submission to resolution
- Government response integration

## Deployment

The app can be deployed to:
- **Vercel:** `npm install -g vercel && vercel`
- **Netlify:** `npm run build && netlify deploy --prod`
- **GitHub Pages:** Configure in repository settings

## Project Structure

```
src/
├── App.jsx              # Main application component
├── App.css              # Global styles
├── EnhancedFeatures.jsx # Enhanced UI components
└── main.jsx            # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.