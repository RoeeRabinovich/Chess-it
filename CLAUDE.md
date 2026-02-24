# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chess-it is a fullstack chess study platform. Users can create interactive chess studies with branching move trees, solve puzzles, analyze positions with Stockfish, and share studies publicly.

**Monorepo structure:**
- `Client/` — React 19 + TypeScript SPA (Vite, Redux Toolkit, TanStack Query)
- `Server/` — Node.js + Express 5 REST API (MongoDB via Mongoose, CommonJS)

## Commands

### Client (`cd Client`)
```bash
npm run dev        # Dev server at :5173, proxies to server at :8181
npm start          # Dev server at :5173, connects to prod server at :9191
npm run build      # TypeScript check + Vite production build
npm run preview    # Preview production build (connects to server at :9191)
npm run lint       # ESLint
npm run format     # Prettier (write)
npm run format:check  # Prettier (check only)
```

### Server (`cd Server`)
```bash
npm run dev    # nodemon, NODE_ENV=development, port 8181, local MongoDB
npm start      # NODE_ENV=production, port 9191, MongoDB Atlas
npm run lint   # ESLint
npm run lint:fix  # ESLint auto-fix
```

### Full production build (from repo root)
```bash
npm run build  # Builds client, copies dist/ into Server/public/
npm start      # Starts server (serves built client + API)
```

### Server environment variables (in `Server/.env`)
```
MONGODB_URI=  # MongoDB Atlas URI
JWT_KEY=      # JWT signing secret
EMAIL_USER=   # Gmail address
EMAIL_PASSWORD= # Gmail app password
```

## Architecture

### Client

**State management split:**
- **Redux** (`store/`): global auth state (`authSlice`), study search/filter state (`searchSlice`), study archive toggle state (`archiveSlice`)
- **TanStack Query**: server data fetching and caching (studies, puzzles, user data)
- **Local React state**: chess board game state, UI state within pages

**Chess game logic** lives entirely in `hooks/useChessGame/`:
- `useChessGame.ts` — main hook combining all sub-hooks
- `treeChessMoveManager.ts` — adding moves / creating branches
- `treeChessNavigation.ts` — path-based tree traversal
- `treeMoveHandlers.ts` / `undoMoveHandler.ts` — move manipulation
- `useChessComments.ts` — comments keyed by path string

**API layer** (`services/api.ts`): A single Axios instance (`apiClient`) reads `VITE_API_BASE_URL` from env. It auto-attaches JWT from `localStorage` on every request and auto-logs out on 401 (except login/register).

**Route guards** in `components/RouteGuard/`: `ProtectedRoute`, `AdminRoute`, `PublicRoute`. The home page renders `HomeExplore` for logged-in users and `Home` for guests.

**Key Vite config note:** CORS headers `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin` are set in `vite.config.ts` — required for `stockfish.wasm` SharedArrayBuffer support in development.

### Server

**CommonJS** throughout (no ESM). Entry point: `Server/index.js`.

**Middleware order** (important for security):
1. Helmet (security headers)
2. CORS
3. Morgan logger
4. `express.json()` + `express.text()`
5. mongo-sanitize
6. Static files (`public/` — built client)
7. API routes (`/users`, `/admin`, `/stockfish`, `/studies`)
8. Global error handler

**Route structure:**
- `/users` → `users/routes/usersRestController.js`
- `/admin` → `routes/adminRoutes.js`
- `/stockfish` → `stockfish/routes/stockfishController.js`
- `/studies` → `studies/routes/studiesRestController.js`

**Config** uses the `config` npm package with environment-specific files in `Server/config/`. `NODE_ENV` selects the file. Railway deployment sets `PORT` as env var which overrides config.

**Database:** `DB/dbService.js` connects to MongoDB Atlas if `MONGODB_URI` is set, otherwise local MongoDB in development. Two connection modules: `DB/mongoDB/connectToAtlas.js` and `DB/mongoDB/connectLocally.js`.

### Move Tree Data Structure

The chess game state stores a tree of moves. Understanding this is essential for working on chess features:

- **`moveTree`**: Array of `MoveNode` — the main line
- **`rootBranches`**: Alternative sequences from the starting position (before any main line move)
- **`MoveNode.branches`**: `MoveNode[][]` — branches are stored on the node *after* which they diverge
- **`currentPath`**: `number[]` uniquely identifying the current board position:
  - `[5]` = main line move index 5
  - `[5, 0, 2]` = move 2 in branch 0 from main line move 5
  - `[-1, 0, 1]` = move 1 in root branch 0 (`ROOT_PATH_INDEX = -1`)
  - Nesting is unlimited: `[mainIdx, branchIdx, moveIdx, branchIdx2, moveIdx2, ...]`
- **`comments`**: `Map<string, string>` keyed by `pathToString(path)` — comments at specific board positions

**Branches are stored AFTER the diverging move.** If you branch at position X, the branch array sits on `moveTree[X].branches` and represents continuations *from* position X.
