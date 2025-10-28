# Server-Side Stockfish Implementation Plan

## 🎯 Goal

Move Stockfish engine from client-side to server-side for better performance and user experience.

---

## 📊 Expected Performance Improvements

| Metric                 | Current (Client)  | After (Server) | Improvement          |
| ---------------------- | ----------------- | -------------- | -------------------- |
| **LCP**                | 9-10s             | 1-2s           | **80% faster**       |
| **INP**                | 300-400ms         | 50-100ms       | **75% faster**       |
| **Bundle Size**        | +2.5MB            | +0 bytes       | **No client bloat**  |
| **Mobile Performance** | Poor              | Excellent      | **Works everywhere** |
| **Analysis Quality**   | Limited by device | Always fast    | **Consistent**       |

---

## 🏗️ Implementation Steps

### **Phase 1: Backend Setup (2 hours)**

#### 1.1 Install Dependencies

```bash
cd Server
npm install stockfish
```

#### 1.2 Create Stockfish Service

**File:** `Server/stockfish/stockfishService.js`

**Purpose:**

- Initialize Stockfish engine on server startup
- Keep engine warm in memory
- Handle UCI protocol communication
- Queue requests to prevent race conditions

**Key Features:**

- Single engine instance (reused for all requests)
- Message queue to handle concurrent requests
- Timeout handling (max 10s per analysis)
- Error recovery

**Code Structure:**

```javascript
class StockfishService {
  constructor() {
    this.engine = require("stockfish")(); // Load once
    this.requestQueue = [];
    this.isAnalyzing = false;
    this.init();
  }

  init() {
    this.engine.postMessage("uci");
    this.engine.postMessage("isready");
    this.setupMessageHandler();
  }

  async analyzePosition(fen, depth = 15, multipv = 1) {
    // Queue the request
    // Return a promise that resolves with analysis
  }

  // Internal queue processing
  processQueue() {
    /* ... */
  }
}
```

---

#### 1.3 Create API Controller

**File:** `Server/stockfish/stockfishController.js`

**Endpoints:**

**POST `/api/stockfish/analyze`**

```json
Request:
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "depth": 15,
  "multipv": 3
}

Response:
{
  "evaluation": 0.3,
  "depth": 15,
  "bestLine": "e2e4 e7e5 g1f3",
  "lines": [
    {
      "pv": "e2e4 e7e5 g1f3",
      "evaluation": 0.3,
      "multipv": 1
    },
    {
      "pv": "d2d4 d7d5 g1f3",
      "evaluation": 0.2,
      "multipv": 2
    }
  ],
  "possibleMate": null
}
```

**Validation:**

- FEN string format
- Depth: 1-24 (cap at 24)
- MultiPV: 1-5 (cap at 5)

**Rate Limiting:**

- Max 10 requests/sec per IP
- Max 100 requests/hour per user (if authenticated)

---

#### 1.4 Add Routes

**File:** `Server/router/router.js`

```javascript
const stockfishRoutes = require("../stockfish/stockfishController");
router.use("/api/stockfish", stockfishRoutes);
```

**Middleware:**

- Rate limiting (express-rate-limit)
- Request validation
- Error handling

---

### **Phase 2: Frontend Changes (1 hour)**

#### 2.1 Create API Service

**File:** `Client/src/services/stockfishApi.ts`

```typescript
export async function analyzePosition(
  fen: string,
  depth: number = 15,
  multipv: number = 1
): Promise<AnalysisResult> {
  const response = await fetch("/api/stockfish/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen, depth, multipv }),
  });

  if (!response.ok) {
    throw new Error("Analysis failed");
  }

  return response.json();
}
```

---

#### 2.2 Update CreateStudy Page

**File:** `Client/src/pages/CreateStudy/CreateStudy.page.tsx`

**Changes:**

1. Remove `Engine` import from `public/stockfish/engine`
2. Import `analyzePosition` from `stockfishApi`
3. Replace engine initialization with API calls
4. Update `useEffect` to call API on position changes

**Example:**

```typescript
// Remove this:
import Engine from "../../../../Client/public/stockfish/engine";

// Add this:
import { analyzePosition } from "../../services/stockfishApi";

// Replace engine initialization with:
useEffect(() => {
  if (!isEngineEnabled) return;

  const analyzeCurrentPosition = async () => {
    try {
      const result = await analyzePosition(
        gameState.position,
        15,
        3 // Request 3 lines
      );

      setPositionEvaluation(result.evaluation);
      setDepth(result.depth);
      setBestLine(result.bestLine);
      setPossibleMate(result.possibleMate);
      setEngineLines(result.lines);
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  const timeoutId = setTimeout(analyzeCurrentPosition, 500);
  return () => clearTimeout(timeoutId);
}, [gameState.position, isEngineEnabled]);
```

---

### **Phase 3: Optimization (30 minutes)**

#### 3.1 Caching Strategy

**Backend (Redis or in-memory):**

```javascript
const analysisCache = new Map();

async function analyzePosition(fen, depth, multipv) {
  const cacheKey = `${fen}-${depth}-${multipv}`;

  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey);
  }

  const result = await stockfishService.analyze(fen, depth, multipv);
  analysisCache.set(cacheKey, result);

  // Cache expires after 1 hour
  setTimeout(() => analysisCache.delete(cacheKey), 3600000);

  return result;
}
```

**Benefits:**

- Common positions (e4, d4, etc.) = instant response
- Reduces CPU usage by ~80%
- Improves response time to <10ms for cached positions

---

#### 3.2 Request Debouncing (Frontend)

Already implemented with 500ms `setTimeout` to prevent excessive API calls during rapid moves.

---

## 💰 Hosting & Cost

### **Recommended: Render.com or Railway.app**

#### Free Tier (Personal Project):

- **RAM:** 512MB-1GB
- **CPU:** Shared
- **Cost:** $0/month
- **Limitation:** May sleep after 15 min inactivity (30s cold start)

#### Paid Tier (Better UX):

- **RAM:** 1GB
- **CPU:** 0.5 vCPU
- **Cost:** $5-7/month
- **Benefit:** Always-on, no cold starts

### **Resource Requirements:**

- Stockfish: ~100-200MB RAM per instance
- Analysis: ~10-50% CPU per request
- For personal project: Free tier is sufficient

---

## 📈 Migration Timeline

| Phase       | Task                          | Time         | Status     |
| ----------- | ----------------------------- | ------------ | ---------- |
| **Phase 1** | Install stockfish npm package | 5 min        | ⏳ Pending |
|             | Create stockfishService.js    | 1 hour       | ⏳ Pending |
|             | Create stockfishController.js | 30 min       | ⏳ Pending |
|             | Add routes & middleware       | 30 min       | ⏳ Pending |
| **Phase 2** | Create stockfishApi.ts        | 15 min       | ⏳ Pending |
|             | Update CreateStudy page       | 30 min       | ⏳ Pending |
|             | Remove old engine files       | 5 min        | ⏳ Pending |
|             | Test & debug                  | 15 min       | ⏳ Pending |
| **Phase 3** | Add caching                   | 15 min       | ⏳ Pending |
|             | Add rate limiting             | 15 min       | ⏳ Pending |
|             | Deploy to server              | 30 min       | ⏳ Pending |
| **Total**   |                               | **~4 hours** |            |

---

## 🚀 Deployment Checklist

### Backend:

- [ ] Install `stockfish` npm package
- [ ] Create `stockfishService.js`
- [ ] Create `stockfishController.js`
- [ ] Add routes to `router.js`
- [ ] Add rate limiting middleware
- [ ] Test API endpoints locally
- [ ] Deploy to Render/Railway

### Frontend:

- [ ] Create `stockfishApi.ts`
- [ ] Update `CreateStudy.page.tsx`
- [ ] Remove old engine imports
- [ ] Delete unused engine files from `public/stockfish/`
- [ ] Test with live API
- [ ] Deploy to production

### Testing:

- [ ] Test analysis accuracy
- [ ] Test multiple concurrent requests
- [ ] Test rate limiting
- [ ] Test error handling
- [ ] Measure LCP & INP improvements
- [ ] Test on mobile devices

---

## 🎁 Bonus Features (Optional)

### WebSocket Support

Replace polling with WebSocket for real-time updates:

```javascript
// Server sends intermediate depth results
socket.emit("analysis-update", {
  depth: 8,
  evaluation: 0.2,
  bestLine: "e2e4...",
});

// Client shows progressive updates
// "Analyzing depth 8... depth 12... depth 18... Done!"
```

**Benefits:**

- Better UX (progressive feedback)
- Lower latency (no HTTP overhead)
- More efficient (no repeated connections)

---

## 📞 Support & Questions

If you encounter issues during implementation:

1. Check server logs for Stockfish errors
2. Verify API endpoint with Postman/curl
3. Test FEN validation
4. Check rate limiting settings
5. Monitor server resource usage

---

## ✅ Success Criteria

After implementation, you should see:

- ✅ LCP < 2 seconds
- ✅ INP < 150ms
- ✅ Smooth interactions on mobile
- ✅ No WASM loading errors
- ✅ Consistent analysis speed across devices
- ✅ Bundle size reduced by 2.5MB

---

**Ready to start Phase 1 when you are!** 🚀
