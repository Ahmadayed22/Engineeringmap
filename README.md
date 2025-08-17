# 🗺️ Engineering Map

A comprehensive web application designed to help engineering students navigate their academic journey through an interactive course mapping system with advanced visualization and management features.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Client-Side Application](#client-side-application)
- [Server-Side Application](#server-side-application)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Overview

Engineering Map is a full-stack web application that provides engineering students with a visual and interactive platform to:

- Map out their academic course progression
- Visualize course dependencies and relationships
- Manage course materials and resources
- Calculate and track GPA
- Collaborate through comments and discussions
- Plan their engineering curriculum effectively

The application features a modern, responsive design with advanced tree-flow visualization systems that make complex course relationships easy to understand and navigate.

## ✨ Features

### 🎯 Core Features
- **Interactive Course Mapping**: Visual tree-flow representation of engineering courses and their prerequisites
- **Course Management**: Add, edit, and organize courses with detailed information
- **Material Management**: Upload and manage course-related documents and resources
- **GPA Calculator**: Calculate and track academic performance across semesters
- **Comment System**: Collaborate with peers through course-specific discussions
- **User Authentication**: Secure user registration, login, and profile management

### 🔧 Advanced Features
- **Tree-Flow Visualization**: Dynamic node-based course relationship mapping
- **Responsive UI Components**: Modern, mobile-friendly interface
- **Real-time State Management**: Efficient data synchronization
- **Secure API Architecture**: RESTful APIs with comprehensive security measures
- **Data Management Hooks**: Custom React hooks for efficient data handling

## 🏗️ Architecture

The application follows a modern full-stack architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client-Side (Frontend)                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │ Tree-Flow       │ │ UI Components   │ │ State           │ │
│  │ Visualization   │ │ & Interface     │ │ Management      │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                          API Calls
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Server-Side (Backend)                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │ API Controllers │ │ Security System │ │ Business        │ │
│  │ & Routes        │ │ & Auth          │ │ Services        │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│  ┌─────────────────┐ ┌─────────────────┐                   │
│  │ Data Models     │ │ Database        │                   │
│  │ & Schema        │ │ Integration     │                   │
│  └─────────────────┘ └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Components

#### Client-Side Architecture
- **Tree-Flow Visualization System**: Interactive node-based course mapping
- **Component-Based UI**: Modular React components for scalability
- **State Management**: Centralized state handling for consistent data flow
- **Data Management Hooks**: Custom hooks for API integration and data handling

#### Server-Side Architecture
- **RESTful API Controllers**: Structured endpoints for all application features
- **Security Layer**: Comprehensive authentication and authorization
- **Business Logic Services**: Modular services for course, user, and content management
- **Data Models**: Well-defined schemas for database interactions

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js with modern hooks and functional components
- **State Management**: Context API / Redux for global state
- **Visualization**: Custom tree-flow visualization library
- **Styling**: CSS3 with responsive design principles
- **Build Tool**: Modern build pipeline with optimization

### Backend
- **Runtime**: Node.js with Express.js framework
- **Database**: [Database technology - likely MongoDB/PostgreSQL]
- **Authentication**: JWT-based security system
- **API Architecture**: RESTful services with comprehensive validation
- **Security**: Industry-standard security practices and middleware

### Development Tools
- **Version Control**: Git with structured branching strategy
- **Testing**: Comprehensive testing suite
- **Documentation**: API documentation and code comments
- **Deployment**: Production-ready deployment configuration

## 🚦 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager
- [Database system] installed and running
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ahmadayed22/Engineeringmap.git
   cd Engineeringmap
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit the .env file with your configuration
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Seed initial data (optional)
   npm run db:seed
   ```

5. **Start the Development Server**
   ```bash
   # Start backend server
   npm run server
   
   # In a new terminal, start frontend
   npm run client
   
   # Or start both concurrently
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/docs

## 🎨 Client-Side Application

### Tree-Flow Visualization System
The heart of the application is the interactive tree-flow visualization that displays:
- Course nodes with detailed information
- Prerequisite relationships and dependencies
- Interactive navigation and zoom capabilities
- Dynamic filtering and search functionality

### Node System
- **Course Nodes**: Individual course representations with metadata
- **Connection Lines**: Visual prerequisite relationships
- **Interactive Elements**: Click, hover, and selection capabilities
- **Responsive Layout**: Adaptive positioning for different screen sizes

### User Interface Components
- **Navigation Bar**: Main application navigation
- **Course Cards**: Detailed course information displays
- **Modal Dialogs**: Course editing and creation interfaces
- **Form Components**: Input validation and user feedback
- **Responsive Grid**: Mobile-friendly layout system

### State Management
- **Global State**: Application-wide data management
- **Local Component State**: Component-specific data handling
- **API Integration**: Seamless backend synchronization
- **Error Handling**: Comprehensive error management system

## 🖥️ Server-Side Application

### API Controllers
The backend provides RESTful APIs for:
- **Course Management**: CRUD operations for course data
- **User Management**: Account creation, authentication, and profiles
- **Material Management**: File uploads and document handling
- **Comment System**: Discussion and collaboration features
- **GPA Calculator**: Academic performance calculations

### Security System
- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive request validation
- **Security Middleware**: Protection against common vulnerabilities
- **Rate Limiting**: API usage limits and abuse prevention

### Data Models
Well-structured data schemas for:
- **User Model**: User accounts and profiles
- **Course Model**: Course information and metadata
- **Material Model**: Document and resource management
- **Comment Model**: Discussion and collaboration data
- **GPA Model**: Academic performance tracking

### Business Services
Modular services handling:
- **Course Management**: Course CRUD operations and business logic
- **User Authentication**: Login, registration, and session management
- **Material Management**: File handling and storage operations
- **Comment System**: Discussion threading and moderation
- **GPA Calculator**: Performance calculation algorithms

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/logout      - User logout
GET  /api/auth/profile     - Get user profile
PUT  /api/auth/profile     - Update user profile
```

### Course Management Endpoints
```
GET    /api/courses        - Get all courses
GET    /api/courses/:id    - Get specific course
POST   /api/courses        - Create new course
PUT    /api/courses/:id    - Update course
DELETE /api/courses/:id    - Delete course
```

### Material Management Endpoints
```
GET    /api/materials         - Get course materials
POST   /api/materials         - Upload new material
GET    /api/materials/:id     - Download material
DELETE /api/materials/:id     - Delete material
```

### Comment System Endpoints
```
GET    /api/comments/:courseId  - Get course comments
POST   /api/comments            - Create new comment
PUT    /api/comments/:id        - Update comment
DELETE /api/comments/:id        - Delete comment
```

### GPA Calculator Endpoints
```
GET  /api/gpa/:userId       - Get user GPA data
POST /api/gpa/calculate     - Calculate GPA
PUT  /api/gpa/:id          - Update GPA record
```

## 🔧 Development

### Development Setup
1. Follow the installation instructions above
2. Set up your development environment variables
3. Install recommended VS Code extensions
4. Configure your database for development

### Code Structure
```
engineeringmap/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling files
│   └── public/            # Static assets
├── server/                # Backend Node.js application
│   ├── controllers/       # API route handlers
│   ├── models/           # Database models
│   ├── middleware/       # Custom middleware
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic services
│   └── utils/            # Server utilities
├── docs/                 # Project documentation
└── tests/               # Test suites
```

### Testing
```bash
# Run all tests
npm test

# Run frontend tests
npm run test:client

# Run backend tests
npm run test:server

# Run tests with coverage
npm run test:coverage
```

### Building for Production
```bash
# Build frontend
npm run build:client

# Build backend
npm run build:server

# Build both
npm run build
```

## 🤝 Contributing

We welcome contributions to the Engineering Map project! Please follow these guidelines:

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Code Style
- Use ESLint and Prettier for code formatting
- Follow React best practices for frontend development
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## 📄 License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file for details.

## 👥 Authors

- **Ahmad Ayed** - *Initial work* - [@Ahmadayed22](https://github.com/Ahmadayed22)

## 🙏 Acknowledgments

- Engineering education community for inspiration
- Open source libraries and frameworks used
- Contributors and testers who helped improve the application
- Academic advisors and educators who provided guidance



---

*This README provides a comprehensive overview of the Engineering Map project. For detailed technical documentation, please refer to the individual component documentation in the `/docs` folder.*
