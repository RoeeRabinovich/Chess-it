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
    ├── users/                 # User-related modules
    ├── stockfish/             # Engine integration
    ├── config/                # Configuration files
    ├── index.js               # Server entry point
    └── package.json
```

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **MongoDB** (v6 or higher)
  - For local development: MongoDB installed locally
  - For production: MongoDB Atlas connection string
- **npm** or **yarn** package manager

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

1. **Extract the `.env` file** from the provided zip archive
2. **Place the `.env` file** in the `Server/` directory
3. **Verify** the `.env` file contains the following variables:

```env
# JWT Secret Key (required)
JWT_KEY=your-secret-jwt-key-here

# MongoDB Configuration
# For Production (MongoDB Atlas):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# Email Configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Gmail App Password, not regular password

# Optional: SMTP Configuration (if not using Gmail)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-email
SMTP_PASSWORD=your-smtp-password

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173  # Change for production
```

**Important Notes:**

- The `.env` file must be placed in the `Server/` directory
- Never commit the `.env` file to version control

- For MongoDB Atlas, ensure your IP is whitelisted in the Atlas dashboard

### Step 4: Database Setup

#### Local Development (MongoDB Local)

The application will automatically connect to `mongodb://localhost:27017/chess-it` in development mode.

Make sure MongoDB is running:

```bash
# Windows
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Production (MongoDB Atlas)

Set the `MONGODB_URI` in your `.env` file with your Atlas connection string.

### Step 5: Run the Application

#### Development Mode

**Terminal 1 - Start the Server:**

```bash
cd Server
npm run dev
```

The server will start on `http://localhost:8181` (development mode)

**Terminal 2 - Start the Client:**

```bash
cd Client
npm run dev
```

The client will start on `http://localhost:5173` (or another port if 5173 is occupied)

#### Production Mode

**Build the Client:**

```bash
cd Client
npm run build
```

**Start the Server:**

```bash
cd Server
npm start
```

The server will start on the port specified in `Server/config/production.json` (default: 9191)

## 📝 Available Scripts

### Client Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run start` - Start development server (port 5173, alternative)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Server Scripts

- `npm run dev` - Start development server with nodemon (port 8181)
- `npm start` - Start production server (port 9191)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## 🔧 Configuration

### Server Configuration

Configuration files are located in `Server/config/`:

- `default.json` - Default configuration (shared settings)
- `development.json` - Development-specific settings
- `production.json` - Production-specific settings

Key settings:

- **PORT**: Server port (8181 for dev, 9191 for prod)
- **CORS_ORIGINS**: Allowed frontend origins
- **RATE_LIMIT**: API rate limiting configuration
- **EMAIL**: Email service configuration

### Client Configuration

- API base URL is set via environment variable `VITE_API_BASE_URL`
- Defaults to `http://localhost:8181` in development
- Update `vite.config.ts` or use environment variables for production

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
4. Add comments or favorite the study
5. View opening information and engine analysis

### Admin Features

1. Login as an admin user
2. Access the admin dashboard
3. Approve/reject public study submissions
4. Manage users and studies
5. View platform analytics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Sanitization**: Protection against injection attacks
- **Rate Limiting**: Protection against brute force attacks
- **Helmet**: Security headers
- **CORS**: Controlled cross-origin access
- **Email Verification**: Secure password reset flow

## 🐛 Troubleshooting

### Server won't start

- Check if MongoDB is running (local) or connection string is correct (Atlas)
- Verify `.env` file exists in `Server/` directory
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

- For local MongoDB: Ensure MongoDB service is running
- For Atlas: Verify connection string format and IP whitelist
- Check network connectivity
- Verify database credentials

## 📄 License

See the LICENSE file in the Client directory for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or support, please contact through the Contact page or create an issue in the repository.

---

**Note**: This application requires a `.env` file in the `Server/` directory. Make sure to extract it from the provided zip file before running the application.
