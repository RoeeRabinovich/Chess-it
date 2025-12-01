# Backend Tree Structure Migration Guide

This guide outlines the steps to migrate the backend from the flat branch structure (`moves`, `branches`, `currentMoveIndex`) to the tree structure (`moveTree`, `currentPath`).

## Overview

Since existing study data can be deleted, this is a **clean migration** - no data migration script needed!

The migration involves:

1. **Delete existing studies** (optional - if you want a clean start)
2. **Database Schema Update** - MongoDB schema changes
3. **Validation Update** - Joi validation schema changes
4. **Service Update** - Service layer changes
5. **Frontend Cleanup** - Remove migration code after backend is updated

## ⚠️ Important Note

**If you have important study data**, you can still use the migration script in Step 4. However, if all data is test data and can be deleted, you can skip the migration script entirely and start fresh!

---

## Step 1: Update MongoDB Schema

**File: `Server/studies/models/mongodb/Study.js`**

Replace the `gameState` schema section with:

```javascript
// Schema for a single chess move (unchanged)
const chessMoveSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    promotion: String,
    san: { type: String, required: true },
    lan: { type: String, required: true },
    before: { type: String, required: true },
    after: { type: String, required: true },
    captured: String,
    flags: { type: String, required: true },
    piece: { type: String, required: true },
    color: { type: String, required: true, enum: ["w", "b"] },
  },
  { _id: false }
);

// Schema for MoveNode (recursive tree structure)
const moveNodeSchema = new mongoose.Schema(
  {
    move: chessMoveSchema,
    branches: {
      type: [[moveNodeSchema]], // Array of branch sequences, each sequence is an array of MoveNodes
      default: [],
    },
  },
  { _id: false }
);

// Schema for opening information (unchanged)
const openingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    eco: { type: String, required: true },
  },
  { _id: false }
);

// Main study schema
const studySchema = new mongoose.Schema(
  {
    // ... other fields unchanged ...
    gameState: {
      position: {
        type: String,
        required: true,
        default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      },
      moveTree: {
        type: [moveNodeSchema],
        default: [],
      },
      currentPath: {
        type: [Number], // Array of numbers: [mainIndex, branchIndex?, moveIndex?, ...]
        default: [],
      },
      isFlipped: {
        type: Boolean,
        default: false,
      },
      opening: openingSchema,
      comments: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    // ... rest unchanged ...
  },
  {
    timestamps: true,
  }
);
```

**Note:** Mongoose doesn't support recursive schemas directly. You'll need to define `moveNodeSchema` after declaring it, or use a workaround:

```javascript
// Define moveNodeSchema structure
const moveNodeSchemaDefinition = {
  move: chessMoveSchema,
  branches: {
    type: [[mongoose.Schema.Types.Mixed]], // Use Mixed for recursive structure
    default: [],
  },
};

const moveNodeSchema = new mongoose.Schema(moveNodeSchemaDefinition, {
  _id: false,
});
```

---

## Step 2: Update Joi Validation Schema

**File: `Server/studies/validations/joi/createStudyValidator.js`**

Replace the validation schemas with:

```javascript
const Joi = require("joi");
const { Chess } = require("chess.js");

// Custom FEN validator (unchanged)
const fenValidator = (value, helpers) => {
  try {
    const chess = new Chess();
    chess.load(value);
    return value;
  } catch (error) {
    return helpers.error("any.invalid", { message: "Invalid FEN string" });
  }
};

// Schema for a single chess move (unchanged)
const chessMoveSchema = Joi.object({
  from: Joi.string().required(),
  to: Joi.string().required(),
  promotion: Joi.string().optional(),
  san: Joi.string().required(),
  lan: Joi.string().required(),
  before: Joi.string().required(),
  after: Joi.string().required(),
  captured: Joi.string().optional(),
  flags: Joi.string().required(),
  piece: Joi.string().required(),
  color: Joi.string().valid("w", "b").required(),
});

// Schema for MoveNode (recursive - use lazy evaluation)
const moveNodeSchema = Joi.object({
  move: chessMoveSchema.required(),
  branches: Joi.array()
    .items(Joi.array().items(Joi.lazy(() => moveNodeSchema)))
    .required(),
});

// Schema for MovePath (array of numbers)
const movePathSchema = Joi.array()
  .items(Joi.number().integer().min(0))
  .required();

// Schema for opening information (unchanged)
const openingSchema = Joi.object({
  name: Joi.string().required(),
  eco: Joi.string().required(),
});

// Schema for gameState
const gameStateSchema = Joi.object({
  position: Joi.string().custom(fenValidator).required(),
  moveTree: Joi.array().items(moveNodeSchema).required(),
  currentPath: movePathSchema.required(),
  isFlipped: Joi.boolean().required(),
  opening: openingSchema.optional(),
  comments: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

const createStudyValidator = (study) => {
  const schema = Joi.object({
    studyName: Joi.string().min(8).max(52).trim().required().messages({
      "string.empty": "Study name is required.",
      "string.min": "Study name must be at least 8 characters.",
      "string.max": "Study name must be at most 52 characters.",
      "any.required": "Study name is required.",
    }),
    category: Joi.string()
      .valid("Opening", "Endgame", "Strategy", "Tactics")
      .required()
      .messages({
        "any.only": "Please select a valid category.",
        "any.required": "Category is required.",
      }),
    description: Joi.string().allow("").trim().optional(),
    isPublic: Joi.boolean().required().messages({
      "any.required": "Visibility is required.",
    }),
    gameState: gameStateSchema
      .required()
      .custom((value, helpers) => {
        // Ensure the study has at least one move
        if (!value.moveTree || value.moveTree.length === 0) {
          return helpers.error("any.custom", {
            message: "Study must contain at least one move.",
          });
        }
        return value;
      })
      .messages({
        "any.required": "Game state is required.",
        "any.custom": "Study must contain at least one move.",
      }),
  });
  return schema.validate(study, { abortEarly: false });
};

module.exports = createStudyValidator;
```

---

## Step 3: Update Service Layer

**File: `Server/studies/services/studiesService.js`**

Update the `createStudyService` function:

```javascript
const createStudyService = async (userId, rawStudy) => {
  try {
    // Validate the study data
    const { error } = validateCreateStudy(rawStudy);
    if (error) {
      return Promise.reject(await handleJoiError(error));
    }

    // Prepare normalized study data
    const normalizedStudy = {
      studyName: rawStudy.studyName.trim(),
      category: rawStudy.category,
      description: rawStudy.description?.trim() || "",
      isPublic: rawStudy.isPublic,
      gameState: {
        position: rawStudy.gameState.position,
        moveTree: rawStudy.gameState.moveTree, // Now using tree structure
        currentPath: rawStudy.gameState.currentPath, // Now using path
        isFlipped: rawStudy.gameState.isFlipped,
        opening: rawStudy.gameState.opening,
        comments: rawStudy.gameState.comments || {},
      },
      createdBy: userId,
    };

    // Save to database
    const result = await createStudy(normalizedStudy);

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
};
```

---

## Step 4: Delete Existing Studies (Optional - Only if starting fresh)

If you want to start fresh with the new structure, you can delete all existing studies:

**Option A: Delete via MongoDB Shell**

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use your-database-name

# Delete all studies
db.studies.deleteMany({})

# Verify deletion
db.studies.countDocuments({})
```

**Option B: Delete via Node Script**

```javascript
// Server/scripts/deleteAllStudies.js
const mongoose = require("mongoose");
const Study = require("../studies/models/mongodb/Study");
require("dotenv").config();

async function deleteAllStudies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const result = await Study.deleteMany({});
    console.log(`Deleted ${result.deletedCount} studies`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error deleting studies:", error);
    process.exit(1);
  }
}

deleteAllStudies();
```

**Run:** `node Server/scripts/deleteAllStudies.js`

---

## Step 4b: Data Migration Script (Optional - Only if keeping existing data)

**⚠️ Skip this step if you deleted all studies!**

**File: `Server/scripts/migrateStudiesToTree.js`**

If you need to keep existing studies, create a migration script to convert them:

```javascript
const mongoose = require("mongoose");
const Study = require("../studies/models/mongodb/Study");
require("dotenv").config();

/**
 * Converts old MoveBranch[] structure to new MoveNode[] tree structure
 * (Same logic as frontend migrateBranchesToTree)
 */
function migrateBranchesToTree(mainLine, branches) {
  const tree = mainLine.map((move) => ({
    move,
    branches: [],
  }));

  const sortedBranches = [...branches].sort((a, b) => {
    if (a.startIndex !== b.startIndex) {
      return a.startIndex - b.startIndex;
    }
    if (a.parentBranchId && !b.parentBranchId) return 1;
    if (!a.parentBranchId && b.parentBranchId) return -1;
    return 0;
  });

  const branchPathMap = new Map();

  // First pass: add direct branches from main line
  for (const branch of sortedBranches) {
    if (branch.moves.length === 0) continue;
    if (branch.parentBranchId) continue;

    if (branch.startIndex < tree.length) {
      const branchNodes = branch.moves.map((move) => ({
        move,
        branches: [],
      }));
      const branchIndex = tree[branch.startIndex].branches.length;
      tree[branch.startIndex].branches.push(branchNodes);
      branchPathMap.set(branch.id, {
        mainIndex: branch.startIndex,
        branchIndex,
      });
    }
  }

  // Second pass: add nested branches
  for (const branch of sortedBranches) {
    if (branch.moves.length === 0) continue;
    if (!branch.parentBranchId) continue;

    const parentPath = branchPathMap.get(branch.parentBranchId);
    if (!parentPath) {
      console.warn(`Parent branch ${branch.parentBranchId} not found`);
      continue;
    }

    const parentMainNode = tree[parentPath.mainIndex];
    const parentBranchSequence =
      parentMainNode.branches[parentPath.branchIndex];

    if (!parentBranchSequence) continue;

    const attachIndex = branch.parentMoveIndexInBranch ?? 0;
    if (attachIndex < parentBranchSequence.length) {
      const branchNodes = branch.moves.map((move) => ({
        move,
        branches: [],
      }));
      const branchIndex = parentBranchSequence[attachIndex].branches.length;
      parentBranchSequence[attachIndex].branches.push(branchNodes);
      branchPathMap.set(branch.id, {
        mainIndex: parentPath.mainIndex,
        branchIndex: branchIndex,
      });
    }
  }

  return tree;
}

/**
 * Converts currentMoveIndex to currentPath
 */
function convertCurrentPath(currentMoveIndex) {
  if (currentMoveIndex < 0) {
    return [];
  }
  return [currentMoveIndex];
}

async function migrateStudies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const studies = await Study.find({
      "gameState.moves": { $exists: true },
      "gameState.moveTree": { $exists: false }, // Only migrate old format
    });

    console.log(`Found ${studies.length} studies to migrate`);

    let migrated = 0;
    let errors = 0;

    for (const study of studies) {
      try {
        const gameState = study.gameState;

        // Skip if already migrated
        if (gameState.moveTree) {
          continue;
        }

        // Convert to tree structure
        const moveTree = migrateBranchesToTree(
          gameState.moves || [],
          gameState.branches || []
        );
        const currentPath = convertCurrentPath(
          gameState.currentMoveIndex || -1
        );

        // Update study
        study.gameState.moveTree = moveTree;
        study.gameState.currentPath = currentPath;

        // Keep old fields for rollback safety (can remove later)
        // study.gameState.moves = undefined;
        // study.gameState.branches = undefined;
        // study.gameState.currentMoveIndex = undefined;

        await study.save();
        migrated++;

        if (migrated % 10 === 0) {
          console.log(`Migrated ${migrated} studies...`);
        }
      } catch (error) {
        console.error(`Error migrating study ${study._id}:`, error.message);
        errors++;
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`Migrated: ${migrated}`);
    console.log(`Errors: ${errors}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrateStudies();
}

module.exports = { migrateStudies };
```

**Run the migration:**

```bash
node Server/scripts/migrateStudiesToTree.js
```

---

## Step 5: Update Frontend (After Backend Migration)

Once the backend is updated and data is migrated, update the frontend:

### 5.1 Remove Migration Code from CreateStudyModal

**File: `Client/src/pages/CreateStudy/components/CreateStudyModal.tsx`**

Remove the migration import and conversion:

```typescript
// Remove this import
// import { migrateTreeToBranches } from "../../../utils/treeMigration";
// import { pathToString } from "../../../utils/moveTreeUtils";

// In handleSubmit, replace:
const { mainLine, branches } = migrateTreeToBranches(gameState.moveTree);
const currentMoveIndex =
  gameState.currentPath.length > 0 ? gameState.currentPath[0] : -1;

// With:
const studyData = {
  // ... other fields ...
  gameState: {
    position: gameState.position,
    moveTree: gameState.moveTree, // Send tree directly
    currentPath: gameState.currentPath, // Send path directly
    isFlipped: gameState.isFlipped,
    opening: gameState.opening,
    comments: gameState.comments ? Object.fromEntries(gameState.comments) : {},
  },
};
```

### 5.2 Update useStudyInitialization

**File: `Client/src/hooks/useChessGameReview/useStudyInitialization.ts`**

Update to expect tree structure directly:

```typescript
interface StudyGameState {
  position: string;
  moveTree: MoveNode[]; // Changed from moves
  currentPath: MovePath; // Changed from currentMoveIndex
  isFlipped: boolean;
  opening?: ChessGameState["opening"];
  comments?: Record<string, string>;
}

// Remove migrateBranchesToTree calls - use data directly:
const [gameState, setGameState] = useState<ChessGameState>(() => ({
  position: studyGameState.position,
  moveTree: studyGameState.moveTree || [],
  currentPath: studyGameState.currentPath || [],
  isFlipped: studyGameState.isFlipped || false,
  opening: studyGameState.opening,
  comments: commentsToMap(studyGameState.comments),
}));
```

### 5.3 Remove Migration Utilities (Optional)

After confirming everything works, you can delete:

- `Client/src/utils/treeMigration.ts`
- `Client/src/utils/chessBranchUtils.ts` (if not used elsewhere)

---

## Migration Checklist

### If Starting Fresh (Recommended):

- [ ] **Delete all existing studies** (optional - only if test data)
- [ ] Update MongoDB schema (`Study.js`)
- [ ] Update Joi validation (`createStudyValidator.js`)
- [ ] Update service layer (`studiesService.js`)
- [ ] Test creating new studies with tree structure
- [ ] Update frontend to send tree structure directly
- [ ] Update frontend to receive tree structure directly
- [ ] Remove migration code from frontend
- [ ] Test end-to-end flow

### If Keeping Existing Data:

- [ ] Update MongoDB schema (`Study.js`) - keep old fields temporarily
- [ ] Update Joi validation (`createStudyValidator.js`) - accept both formats
- [ ] Update service layer (`studiesService.js`) - support both formats
- [ ] Create and run migration script
- [ ] Test creating new studies with tree structure
- [ ] Test loading existing migrated studies
- [ ] Update frontend to send tree structure directly
- [ ] Update frontend to receive tree structure directly
- [ ] Remove migration code from frontend
- [ ] Test end-to-end flow
- [ ] Remove old fields from schema (after confirming everything works)

---

## Rollback Plan

If issues occur, you can rollback by:

1. Reverting schema changes
2. Restoring old validation
3. Old fields are still in database (if you didn't delete them)
4. Frontend migration code can convert back

---

## Notes

- **Mongoose Recursive Schemas**: Mongoose doesn't natively support recursive schemas. Consider using `mongoose.Schema.Types.Mixed` for the `branches` array, or validate structure in application code.
- **Validation**: The recursive Joi validation uses `Joi.lazy()` for recursive structures.
- **Performance**: Tree structure is more efficient for nested branches but may require different query patterns.
- **Backward Compatibility**: Keep old fields during transition period, remove after confirming everything works.
