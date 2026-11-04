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
- **Framework**: Java Spring Boot with Spring MVC
- **Database**: PostgreSQL with Spring Data JPA
- **Authentication**: JWT-based security system with Spring Security
- **API Architecture**: RESTful services with comprehensive validation
- **Security**: Industry-standard security practices and Spring Security middleware

### Development Tools
- **Version Control**: Git with structured branching strategy
- **Testing**: Comprehensive testing suite
- **Documentation**: API documentation and code comments
- **Deployment**: Production-ready deployment configuration

## 🚦 Getting Started

### Prerequisites
- Java 11 or higher
- Maven 3.6+ for dependency management
- PostgreSQL 12 or higher
- Node.js (version 14 or higher) for frontend
- npm or yarn package manager
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
   mvn clean install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Copy application properties template
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   
   # Edit the application.properties file with your PostgreSQL configuration
   nano src/main/resources/application.properties
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb engineeringmap
   
   # Run Spring Boot application: Flyway creates the tables and the USER/ADMIN roles
   # (scripts in server/src/main/resources/db/migration)
   mvn spring-boot:run
   
   # Course rows are not seeded; insert them before using the map
   ```

5. **Start the Development Server**
   ```bash
   # Start backend server (Spring Boot)
   mvn spring-boot:run
   
   # In a new terminal, start frontend
   cd client
   npm run dev
   cd ..
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger-ui.html

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


### Security System
- **Authentication**: JWT-based user authentication with Spring Security
- **Authorization**: Role-based access control using Spring Security
- **Input Validation**: Bean validation with Spring Boot validation annotations
- **Security Configuration**: Spring Security configuration for API endpoints
- **Password Encryption**: BCrypt password hashing
- **CORS Configuration**: Cross-origin resource sharing setup

### Data Models
Well-structured JPA entity models for:
- **User Entity**: User accounts and profiles with JPA annotations
- **Course Entity**: Course information and metadata
- **Material Entity**: Document and resource management
- **Comment Entity**: Discussion and collaboration data with relationships
- **GPA Entity**: Academic performance tracking with calculated fields

### Business Services
Spring Service layer components handling:
- **Course Service**: Course CRUD operations with business logic
- **User Service**: User management with Spring Security integration
- **Material Service**: File handling and storage operations
- **Comment Service**: Discussion threading and moderation


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



## 🔧 Development

### Development Setup
1. Follow the installation instructions above
2. Set up your development environment variables
3. Install recommended VS Code extensions
4. Configure your database for development

### Code Structure
```
engineeringmap/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── styles/           # CSS and styling files
│   └── public/               # Static assets
├── src/main/java/            # Backend Spring Boot application
│   ├── controller/           # REST controllers
│   ├── entity/              # JPA entity models
│   ├── repository/          # Spring Data JPA repositories
│   ├── service/             # Business logic services
│   ├── config/              # Spring configuration classes
│   ├── security/            # Security configuration and JWT utilities
│   └── dto/                 # Data Transfer Objects
├── src/main/resources/       # Application resources
│   ├── application.properties # Spring Boot configuration
│   └── data.sql             # Initial data (optional)
├── docs/                    # Project documentation
└── src/test/                # Test suites
```

### Testing
```bash
# Run all tests
mvn test

# Run tests with coverage
mvn test jacoco:report

# Run frontend tests
cd client
npm test
cd ..

# Run integration tests
mvn verify
```

### Building for Production
```bash
# Build backend (creates JAR file)
mvn clean package

# Build frontend
cd client
npm run build
cd ..

# Run the production JAR
java -jar target/engineeringmap-1.0.0.jar
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


## 👥 Authors

- **Ahmad Ayed** - *Initial work* - [@Ahmadayed22](https://github.com/Ahmadayed22)

## 🙏 Acknowledgments

- Engineering education community for inspiration
- Open source libraries and frameworks used
- Contributors and testers who helped improve the application
- Academic advisors and educators who provided guidance



---

