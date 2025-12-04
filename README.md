# Chess-it - Fullstack Chess Study Platform

A comprehensive fullstack web application for creating, analyzing, and sharing chess studies. Chess-it provides an interactive chessboard editor with move annotations, branching variations, engine analysis, puzzles, and a community platform for chess enthusiasts.

## 🎯 Overview

Chess-it is a modern chess study platform that allows users to:

- Create interactive chess studies with detailed annotations
- Analyze positions using a built-in Stockfish chess engine
- Solve tactical puzzles with various themes
- Share studies with the community
- Review and learn from other user's games
- Track personal progress and statistics

## ✨ Features

### Core Functionality

- **Interactive Chessboard Editor**: Create and edit chess positions with move-by-move annotations
- **Branching Variations**: Explore different lines and possibilities with nested branch support
- **Chess Engine Integration**: Real-time position analysis using Stockfish engine (server-side via API)
- **Move Tree Navigation**: Navigate through complex game trees with multiple variations
- **Comments & Annotations**: Add comments at specific positions in your studies
- **PGN/FEN Support**: Import and export games in standard chess formats

### User Features

- **User Authentication**: Secure registration, login, and password reset functionality
- **Public & Private Studies**: Choose visibility for your studies
- **Study Management**: Create, edit, delete, and organize your chess studies
- **Favorites System**: Save and organize favorite studies
- **User Profile**: Track your studies, favorites, and statistics
- **Search & Filter**: Find studies by title, tags, or content

### Puzzles

- **Tactical Puzzles**: Solve puzzles with various themes (checkmate, sacrifice, endgame, etc.)
- **Difficulty Levels**: Puzzles tailored to different skill levels
- **Puzzle Rating System**: Track your puzzle-solving performance

### Admin Features

- **Admin Dashboard**: Manage users and studies
- **Study Approval**: Review and approve public study submissions
- **User Management**: View and manage user accounts
- **Analytics**: Track platform usage and statistics

### Additional Features

- **Opening Detection**: Automatic opening name detection
- **Evaluation Bar**: Visual representation of position evaluation
- **Engine Lines**: View top engine suggestions for positions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Customizable theme support
- **Email Notifications**: Password reset via email

## 🛠️ Tech Stack

### Frontend (Client)

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Redux Toolkit** - State management
- **Tailwind CSS 4** - Styling
- **Flowbite React** - UI components
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animations
- **chess.js** - Chess logic and move validation
- **react-chessboard** - Chessboard component
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Joi** - Form validation

### Backend (Server)

- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Stockfish** - Server-side chess engine
- **Nodemailer** - Email service
- **Joi** - Request validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting
- **mongo-sanitize** - Input sanitization
- **Morgan** - HTTP request logger
- **Config** - Configuration management

## 📁 Project Structure

```
Chess-it Fullstack Project/
├── Client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ChessBoard/   # Chessboard components
│   │   │   ├── MoveNotation/ # Move notation display
│   │   │   ├── ui/           # Reusable UI components
│   │   │   └── ...
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useChessGame/ # Chess game logic
│   │   │   ├── useStockfish/ # Engine integration
│   │   │   └── ...
│   │   ├── pages/            # Page components
│   │   │   ├── Home/         # Landing page
│   │   │   ├── CreateStudy/  # Study creation
│   │   │   ├── ReviewStudy/  # Study review
│   │   │   ├── Puzzles/      # Puzzle solving
│   │   │   ├── Admin/        # Admin dashboard
│   │   │   └── ...
│   │   ├── services/         # API services
│   │   ├── store/            # Redux store
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript types
│   ├── dist/                 # Production build output
│   ├── package.json
│   └── vite.config.ts
│
└── Server/                    # Backend Node.js application
    ├── auth/                  # Authentication logic
    ├── DB/                    # Database configuration
    │   ├── mongoDB/          # MongoDB connections
    │   └── initialData/      # Initial data seeding
    ├── middlewares/          # Express middlewares
    ├── routes/               # API route handlers
    ├── services/             # Business logic
    ├── studies/              # Study-related modules
    ├── users/                # User-related modules
    ├── stockfish/            # Engine integration
    ├── config/               # Configuration files
    ├── .env                  # Environment variables (not in repo)
    ├── index.js              # Server entry point
    └── package.json
```

## 🏗️ Architecture Overview

### Client-Server Architecture

Chess-it follows a traditional client-server architecture:

- **Frontend (Client)**: React-based Single Page Application (SPA) running in the browser
- **Backend (Server)**: RESTful API server built with Express.js
- **Database**: MongoDB for persistent data storage
- **Authentication**: JWT-based stateless authentication

### Data Flow

1. **User Interactions**: Users interact with the React frontend
2. **API Requests**: Frontend makes HTTP requests to Express backend via Axios
3. **Authentication**: JWT tokens are stored in `localStorage` and sent with requests
4. **Business Logic**: Express routes delegate to service layers
5. **Data Access**: Services interact with MongoDB via Mongoose ODM
6. **Response**: JSON responses are sent back to the client

### Key Architectural Patterns

- **Separation of Concerns**: Clear separation between routes, services, and data access layers
- **Middleware Chain**: Authentication, rate limiting, and error handling via Express middlewares
- **State Management**: Redux Toolkit for global client state, React hooks for local state
- **Move Tree Structure**: Complex nested data structure for chess game variations (main line, branches, root branches)

### Security Layers

- **JWT Authentication**: Token-based authentication with 1-hour expiration
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Joi schemas for request validation
- **Input Sanitization**: mongo-sanitize to prevent injection attacks
- **Rate Limiting**: Different limits for authentication, general, and Stockfish endpoints
- **Security Headers**: Helmet.js for HTTP security headers
- **CORS**: Controlled cross-origin access

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (for production) or **MongoDB** installed locally (for development)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Chess-it Fullstack Project"
```

### Step 2: Install Dependencies

#### Install Client Dependencies

```bash
cd Client
npm install
```

#### Install Server Dependencies

```bash
cd ../Server
npm install
```

### Step 3: Environment Configuration

1. **Locate the `RENAME.env` file** in the project root or provided archive
2. **Extract and copy** the `RENAME.env` file to the `Server/` directory
3. **Rename** the file from `RENAME.env` to `.env` (remove "RENAME" prefix)
4. **Verify** the `.env` file contains the following variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_KEY=your-secret-jwt-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Important Notes:**

- The `.env` file must be located in the `Server/` directory
- Ensure all required environment variables are present
- Never commit the `.env` file to version control

### Step 4: Run the Application

#### Production Mode (Recommended)

**⚠️ Important**: Production mode is the preferred method as it connects to MongoDB Atlas. Development mode requires a local MongoDB installation.

**Terminal 1 - Build and Preview the Client:**

```bash
cd Client
npm run build
npm run preview
```

The client preview will start on `http://localhost:4173` (or another port if 4173 is occupied)

**Terminal 2 - Start the Server:**

```bash
cd Server
npm start
```

The server will start on `http://localhost:9191` (production port)

**Access the Application:**

- Open your browser and navigate to `http://localhost:4173` (or the port shown in the preview output)
- The client will communicate with the server running on port 9191

#### Development Mode

**⚠️ Warning**: Development mode requires a local MongoDB installation. Ensure MongoDB is running locally before starting the server.

**Additional Setup for Development:**

1. **Install MongoDB locally** (if not already installed)
2. **Start MongoDB service**:

   ```bash
   # Windows
   net start MongoDB

   # macOS (Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

3. **Update MongoDB connection URL** (if different from default):
   - Open `Server/DB/mongoDB/connectLocally.js`
   - Replace `"mongodb://localhost:27017/chess-it"` on line 6 with your local MongoDB connection string if needed

**Terminal 1 - Start the Server:**

```bash
cd Server
npm run dev
```

The server will start on `http://localhost:8181` (development port)

**Terminal 2 - Start the Client:**

```bash
cd Client
npm run dev
```

The client will start on `http://localhost:5173` (or another port if 5173 is occupied)

## 📝 Available Scripts

### Client Scripts

- `npm run dev` - Start development server (port 5173, connects to dev server on 8181)
- `npm start` - Start development server (port 5173, connects to prod server on 9191)
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Server Scripts

- `npm run dev` - Start development server with nodemon (port 8181, connects to local MongoDB)
- `npm start` - Start production server (port 9191, connects to MongoDB Atlas)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## 🔧 Configuration

### Server Configuration

Configuration files are located in `Server/config/`:

- `default.json` - Default configuration (shared settings)
- `development.json` - Development-specific settings (port 8181)
- `production.json` - Production-specific settings (port 9191)

Key settings:

- **PORT**: Server port (8181 for dev, 9191 for prod)
- **CORS_ORIGINS**: Allowed frontend origins
- **RATE_LIMIT**: API rate limiting configuration
- **EMAIL**: Email service configuration

### Client Configuration

- API base URL is set via environment variable `VITE_API_BASE_URL`
- Defaults to `http://localhost:8181` in development (`npm run dev`)
- Defaults to `http://localhost:9191` in production (`npm start`)
- Update `vite.config.ts` or use environment variables for custom configurations

## 📡 API Endpoints Documentation

### Base URL

- **Development**: `http://localhost:8181/api`
- **Production**: `http://localhost:9191/api`

### Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### User Endpoints (`/api/users`)

#### Public Endpoints

- **POST** `/api/users/register` - Register a new user

  - Body: `{ email, username, password }`
  - Returns: `{ user: {...}, token: "..." }`

- **POST** `/api/users/login` - Login user

  - Body: `{ email, password }`
  - Returns: `{ user: {...}, token: "..." }`

- **POST** `/api/users/forgot-password` - Request password reset

  - Body: `{ email }`
  - Returns: `{ message: "..." }`

- **POST** `/api/users/reset-password` - Reset password with token
  - Body: `{ token, password, confirmPassword }`
  - Returns: `{ message: "..." }`

#### Authenticated Endpoints

- **GET** `/api/users/profile` - Get current user profile

  - Returns: `{ _id, username, email, createdAt, puzzleRating, studiesCreated }`

- **PATCH** `/api/users/username` - Update username

  - Body: `{ username }`
  - Returns: `{ _id, username, createdAt, puzzleRating, studiesCreated }`

- **PATCH** `/api/users/puzzle-rating` - Update puzzle rating
  - Body: `{ puzzleRating: number }`
  - Returns: `{ _id, username, createdAt, puzzleRating, studiesCreated }`

### Study Endpoints (`/api/studies`)

#### Authenticated Endpoints

- **POST** `/api/studies/create` - Create a new study

  - Body: `{ studyName, category, description, isPublic, gameState }`
  - Returns: Study object

- **GET** `/api/studies/my-studies` - Get all studies by authenticated user

  - Returns: Array of study objects

- **GET** `/api/studies/public` - Get public studies with filters

  - Query params: `category`, `filter`, `search`, `limit`, `skip`, `likedOnly`
  - Returns: `{ studies: [...], total: number }`

- **GET** `/api/studies/:id` - Get study by ID

  - Optional auth: Can access private studies if owner
  - Returns: Study object

- **PUT** `/api/studies/:id` - Update a study

  - Body: `{ studyName, category, description, isPublic, gameState }`
  - Returns: Updated study object

- **DELETE** `/api/studies/:id` - Delete a study

  - Returns: `{ success: true }`

- **POST** `/api/studies/:id/like` - Like a study

  - Returns: `{ success: true }`

- **DELETE** `/api/studies/:id/like` - Unlike a study

  - Returns: `{ success: true }`

- **GET** `/api/studies/liked/ids` - Get user's liked study IDs
  - Returns: Array of study IDs

### Stockfish Endpoints (`/api/stockfish`)

#### Public Endpoints

- **POST** `/api/stockfish/analyze` - Analyze a chess position
  - Body: `{ fen: string, depth?: number, multipv?: number, analysisMode?: string }`
  - Returns: `{ evaluation, bestMove, pv: [...], depth, ... }`

### Admin Endpoints (`/api/admin`)

All admin endpoints require admin authentication.

#### User Management (`/api/admin/users`)

- **GET** `/api/admin/users` - Get all users (paginated)

  - Query params: `page`, `pageSize`, `search`
  - Returns: `{ users: [...], total: number, page: number, pageSize: number }`

- **GET** `/api/admin/users/:id` - Get user by ID

  - Returns: User object

- **PATCH** `/api/admin/users/:id/username` - Update user username

  - Body: `{ username }`
  - Returns: Updated user object

- **PATCH** `/api/admin/users/:id/role` - Update user role

  - Body: `{ isAdmin: boolean }`
  - Returns: Updated user object

- **POST** `/api/admin/users/:id/reset-password` - Admin-initiated password reset

  - Returns: `{ message: "..." }`

- **DELETE** `/api/admin/users/:id` - Delete user
  - Returns: `{ success: true }`

#### Study Management (`/api/admin/studies`)

- **GET** `/api/admin/studies` - Get all studies (paginated)

  - Query params: `page`, `pageSize`, `search`, `category`, `isPublic`, `sortBy`, `sortOrder`, `dateFilter`
  - Returns: `{ studies: [...], total: number, page: number, pageSize: number }`

- **PATCH** `/api/admin/studies/:id` - Update study metadata

  - Body: `{ studyName?, category?, description?, isPublic? }`
  - Returns: Updated study object

- **DELETE** `/api/admin/studies/:id` - Delete study
  - Returns: `{ success: true }`

### Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 🎮 Usage

### Creating a Study

1. Register/Login to your account
2. Navigate to "Create Study"
3. Set up the initial position (or start from the default position)
4. Make moves on the board or import from PGN
5. Add comments at key positions
6. Create branches to explore variations
7. Use the engine analysis tool to evaluate positions
8. Save your study (public or private)

### Solving Puzzles

1. Navigate to "Puzzles"
2. Select a puzzle theme or difficulty
3. Solve the puzzle by making the correct move
4. Review the solution and explanation
5. Track your puzzle rating

### Reviewing Studies

1. Browse public studies from the home page
2. Click on any study to review it
3. Navigate through moves and variations
4. Favorite the study
5. View opening information and engine analysis

### Admin Features

1. Login as an admin user
2. Access the admin dashboard
3. Manage users and studies

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with 1-hour expiration
- **Password Hashing**: bcryptjs for password security
- **Input Sanitization**: Protection against injection attacks
- **Rate Limiting**: Protection against brute force attacks
  - Authentication endpoints: Stricter limits
  - General endpoints: Standard limits
  - Stockfish endpoints: Separate limits
- **Helmet**: Security headers
- **CORS**: Controlled cross-origin access
- **Email Verification**: Secure password reset flow
- **Email Privacy**: User email is not stored in `localStorage` for security

## 🐛 Troubleshooting

### Server won't start

- Check if MongoDB Atlas connection string is correct (production) or MongoDB is running locally (development)
- Verify `.env` file exists in `Server/` directory and contains all required variables
- Ensure all required environment variables are set
- Check if the port is already in use

### Client won't connect to server

- Verify server is running
- Check `VITE_API_BASE_URL` matches server port
- Ensure CORS configuration allows your client origin
- Check browser console for CORS errors

### Email not sending

- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- For Gmail, ensure you're using an App Password (not regular password)
- Check SMTP configuration if using custom email service
- Verify email service credentials

### Database connection issues

- **Production**: Verify MongoDB Atlas connection string format and IP whitelist
- **Development**: Ensure MongoDB service is running locally
- Check network connectivity
- Verify database credentials

## 🗄️ Database Schema Documentation

### User Model

The User model stores user account information and statistics.

**Schema Fields:**

```javascript
{
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [emailRegex, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: passwordRegex,
      message: "Password must contain uppercase, lowercase, 4+ numbers, and special character"
    }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  puzzleRating: {
    type: Number,
    default: 600,
    min: 0
  },
  studiesCreated: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: Date,  // Auto-generated timestamp
  updatedAt: Date    // Auto-generated timestamp
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least 4 numbers (0-9)
- At least one special character from: `*_-+&%^$#@!`

**Indexes:**

- `username` - Unique index
- `email` - Unique index

### Study Model

The Study model stores chess study data including game state, move trees, and metadata.

**Schema Fields:**

```javascript
{
  studyName: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 52,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Opening", "Endgame", "Strategy", "Tactics"]
  },
  description: {
    type: String,
    default: "",
    trim: true
  },
  isPublic: {
    type: Boolean,
    required: true,
    default: false
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  gameState: {
    position: {
      type: String,  // FEN notation
      required: true,
      default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    },
    moveTree: {
      type: [MoveNode],  // Main line moves
      default: []
    },
    rootBranches: {
      type: [[MoveNode]],  // Alternative sequences from starting position
      default: []
    },
    currentPath: {
      type: [Number],  // Path to current position: [mainIndex, branchIndex?, moveIndex?, ...]
      default: []
    },
    isFlipped: {
      type: Boolean,
      default: false
    },
    opening: {
      name: String,  // Opening name (e.g., "Sicilian Defense")
      eco: String    // ECO code (e.g., "B20")
    },
    comments: {
      type: Map,  // Key-value pairs: pathToString(path) -> comment text
      default: {}
    }
  },
  createdBy: {
    type: ObjectId,
    ref: "User",
    required: true
  },
  createdAt: Date,  // Auto-generated timestamp
  updatedAt: Date   // Auto-generated timestamp
}
```

**MoveNode Structure:**

```javascript
{
  move: {
    from: String,        // Source square (e.g., "e2")
    to: String,          // Target square (e.g., "e4")
    promotion: String,   // Optional promotion piece
    san: String,         // Standard Algebraic Notation (e.g., "e4")
    lan: String,         // Long Algebraic Notation (e.g., "e2e4")
    before: String,      // FEN before move
    after: String,       // FEN after move
    captured: String,    // Optional captured piece
    flags: String,       // Move flags (e.g., "n", "b", "e", "c")
    piece: String,       // Piece type (e.g., "p", "r", "n", "b", "q", "k")
    color: "w" | "b"    // Move color
  },
  branches: [[MoveNode]]  // Nested array of alternative move sequences
}
```

**Indexes:**

- `createdBy` - Index for user lookup
- `category` - Index for category filtering
- `isPublic` - Index for public study queries
- `createdAt` - Descending index for sorting by date
- `likes` - Descending index for sorting by popularity

## 🌳 Move Tree Structure Explanation

Chess-it uses a sophisticated tree structure to represent chess games with unlimited branching variations. This allows users to explore multiple lines of play from any position.

### Core Concepts

#### Main Line (`moveTree`)

The main line is an array of `MoveNode` objects representing the primary sequence of moves:

```javascript
moveTree: [
  { move: {...}, branches: [...] },  // Move 0
  { move: {...}, branches: [...] },  // Move 1
  { move: {...}, branches: [...] },  // Move 2
  ...
]
```

#### Branches (`branches`)

Each `MoveNode` can have multiple branches stored in its `branches` array. **Important**: Branches are stored on the move node **AFTER** which they start. This means:

- If you're at move 5 and create a branch, the branch is stored on `tree[5].branches`
- The branch represents an alternative continuation from the position **after** move 5

Each branch is an array of `MoveNode` objects (a sequence of moves):

```javascript
node.branches = [
  [moveNode1, moveNode2, ...],  // Branch 0: alternative sequence
  [moveNode3, moveNode4, ...],  // Branch 1: another alternative
  ...
]
```

#### Root Branches (`rootBranches`)

Root branches are alternative move sequences that start from the initial position (before any main line moves):

```javascript
rootBranches: [
  [moveNode1, moveNode2, ...],  // Root branch 0
  [moveNode1, moveNode2, ...],  // Root branch 1
  ...
]
```

### Path System (`currentPath`)

The `currentPath` is an array of numbers that uniquely identifies a position in the tree:

**Path Format:**

- **Main line**: `[moveIndex]`

  - Example: `[5]` = main line move 5

- **Branch from main line**: `[mainIndex, branchIndex, moveIndexInBranch]`

  - Example: `[5, 0, 2]` = move 2 in branch 0 from main line move 5

- **Nested branch**: `[mainIndex, branchIndex, moveIndex, branchIndex2, moveIndex2, ...]`

  - Example: `[5, 0, 2, 1, 0]` = move 0 in branch 1 from move 2 in branch 0 from main line move 5

- **Root branch**: `[-1, branchIndex, moveIndexInBranch]`
  - Example: `[-1, 0, 1]` = move 1 in root branch 0 (starting from initial position)

**Special Constant:**

- `ROOT_PATH_INDEX = -1` - Indicates a root branch path

### Visual Example

```
Starting Position
│
├─ Main Line: [0] → [1] → [2] → [3]
│              │      │
│              │      └─ Branch [1, 0, 0] → [1, 0, 1]
│              │
│              └─ Branch [0, 0, 0] → [0, 0, 1]
│                 │
│                 └─ Nested Branch [0, 0, 0, 0, 0]
│
└─ Root Branch [-1, 0, 0] → [-1, 0, 1]
```

### Key Design Principles

1. **Branches are stored AFTER the move**: When you create a branch at move 5, it's stored on `tree[5].branches`, meaning it's an alternative from the position after move 5.

2. **Unlimited nesting**: Branches can have branches, which can have branches, etc. The structure supports infinite depth.

3. **Path-based navigation**: Every position is uniquely identified by a path array, making navigation and state management efficient.

4. **Comments are path-keyed**: Comments are stored in a Map with keys generated from paths (`pathToString(path)`), allowing comments at any position.

### Common Operations

- **Adding a move**: Extends the current path or creates a new branch
- **Navigating**: Uses path arrays to traverse the tree
- **Deleting moves**: Can only delete the last move in a sequence (maintains tree integrity)
- **Loading position**: Replays all moves along a path from the starting position

## 🧪 Testing Guide

### Manual Testing Checklist

#### Authentication Flow

- [ ] **User Registration**

  - Register with valid credentials
  - Verify password requirements are enforced
  - Test duplicate email/username rejection
  - Verify user is created in database

- [ ] **User Login**

  - Login with correct credentials
  - Test login with incorrect password
  - Test login with non-existent email
  - Verify JWT token is received and stored

- [ ] **Password Reset**

  - Request password reset with valid email
  - Check email inbox for reset link
  - Use reset token to change password
  - Test expired token rejection
  - Verify new password works for login

- [ ] **Session Management**
  - Verify token expiration (1 hour)
  - Test automatic logout on 401 response
  - Verify user data persistence in localStorage

#### Study Management

- [ ] **Create Study**

  - Create study with all required fields
  - Test validation (name length, category selection)
  - Verify study is saved to database
  - Test creating study with custom starting position

- [ ] **Edit Study**

  - Update study name, category, description
  - Modify game state (add moves, create branches)
  - Test saving changes
  - Verify only owner can edit

- [ ] **Delete Study**

  - Delete own study
  - Verify study is removed from database
  - Test that other users cannot delete

- [ ] **Study Visibility**
  - Create public study
  - Create private study
  - Verify public studies appear in public feed
  - Verify private studies only visible to owner

#### Chess Board Functionality

- [ ] **Move Making**

  - Make legal moves on the board
  - Test illegal move rejection
  - Verify move appears in notation
  - Test pawn promotion

- [ ] **Branch Creation**

  - Create branch from main line
  - Create nested branch (branch from branch)
  - Create root branch (from starting position)
  - Navigate between branches

- [ ] **Move Navigation**

  - Navigate forward/backward through moves
  - Jump to specific move
  - Navigate to branch positions
  - Test navigation from different positions

- [ ] **Undo Move**

  - Undo last move in main line
  - Undo last move in branch
  - Verify can only undo last move
  - Test undo from different positions

- [ ] **Comments**
  - Add comment at position
  - Edit comment
  - Delete comment
  - Verify comments persist after navigation

#### Engine Analysis

- [ ] **Stockfish Integration**
  - Enable engine analysis
  - Verify analysis appears for position
  - Test analysis depth settings
  - Test MultiPV (multiple lines)
  - Verify analysis updates on position change

#### Admin Features

- [ ] **User Management** (Admin only)

  - View all users
  - Search/filter users
  - Update user username
  - Change user role (admin/user)
  - Delete user
  - Reset user password

- [ ] **Study Management** (Admin only)
  - View all studies
  - Filter by category, visibility, date
  - Update study metadata
  - Delete any study

#### Public Features

- [ ] **Browse Public Studies**

  - View public study feed
  - Filter by category
  - Search studies
  - Sort by date/popularity
  - Test pagination

- [ ] **Like/Unlike Studies**
  - Like a public study
  - Unlike a study
  - View liked studies
  - Verify like count updates

### API Testing

Use tools like Postman, Insomnia, or curl to test API endpoints:

**Example: Register User**

```bash
curl -X POST http://localhost:9191/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test1234!@#$"
  }'
```

**Example: Create Study (Authenticated)**

```bash
curl -X POST http://localhost:9191/api/studies/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studyName": "Test Study",
    "category": "Opening",
    "description": "Test description",
    "isPublic": false,
    "gameState": {...}
  }'
```

### Browser Testing

- **Chrome DevTools**: Check console for errors, network tab for API calls
- **React DevTools**: Inspect component state and props
- **Redux DevTools**: Monitor Redux state changes
- **Network Throttling**: Test on slow connections
- **Responsive Design**: Test on different screen sizes

### Common Test Scenarios

1. **Full User Journey**: Register → Login → Create Study → Add Moves → Add Comments → Save → View Public Feed → Like Study

2. **Error Handling**: Test invalid inputs, network errors, expired tokens, unauthorized access

3. **Edge Cases**: Empty study, very long study name, many branches, deep nesting, rapid clicking

## 🗺️ Future Roadmap

#### Short-term (Next Release)

- [ ] **PGN Import/Export**

  - Import games from PGN format
  - Export studies to PGN
  - Support for multiple games in one PGN file

- [ ] **Enhanced Search**

  - Search by FEN position
  - Search within move sequences
  - Advanced filters (date range, rating, etc.)

- [ ] **Study Sharing**

  - Share studies via unique links
  - Embed studies in external websites
  - Social media sharing integration

- [ ] **Performance Optimizations**
  - Code splitting for routes
  - Lazy loading of components
  - Optimize Redux state management
  - Implement virtual scrolling for large lists

#### Medium-term

- [ ] **Real-time Collaboration**

  - WebSocket support for live editing
  - Multiple users editing same study
  - Real-time cursor/selection indicators

- [ ] **Advanced Analysis**

  - Client-side Stockfish engine option
  - Opening book integration
  - Endgame tablebase integration
  - Position evaluation history

- [ ] **Study Templates**

  - Pre-built study templates
  - Common opening/endgame patterns
  - Puzzle templates

- [ ] **User Features**

  - User profiles with avatars
  - Follow other users
  - Study collections/folders
  - Study versioning/history

- [ ] **Notifications**
  - Email notifications for study likes
  - In-app notification system
  - Study update notifications

#### Long-term

- [ ] **Mobile App**

  - Native iOS/Android applications
  - Offline mode support
  - Push notifications

- [ ] **Advanced Puzzles**

  - AI-generated puzzles
  - Adaptive difficulty
  - Puzzle themes and collections
  - Puzzle rating system improvements

- [ ] **Community Features**

  - Study comments and discussions
  - Study ratings/reviews
  - Study recommendations
  - User leaderboards

- [ ] **Advanced Chess Features**

  - Game replay with animations
  - Position comparison tool
  - Opening explorer integration
  - Endgame trainer

- [ ] **Analytics & Insights**
  - Study analytics dashboard
  - User progress tracking
  - Learning path recommendations
  - Performance metrics

### Contributing Ideas

If you'd like to contribute, consider working on:

- Performance optimizations
- Additional test coverage
- Documentation improvements
- UI/UX enhancements
- New features from the roadmap
- Bug fixes and stability improvements

## 📄 License

See the LICENSE file in the Client directory for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or support, please contact through the Contact page or create an issue in the repository.

---

**Note**: This application requires a `.env` file in the `Server/` directory. Extract the `RENAME.env` file from the provided archive, place it in the `Server/` directory, and rename it to `.env` before running the application.
