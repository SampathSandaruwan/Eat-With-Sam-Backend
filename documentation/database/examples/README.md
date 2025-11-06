# Database Design Examples

This directory contains validation scripts and examples that demonstrate key design decisions for the database schema.

## Purpose

These scripts help validate and explain design decisions made during the database schema design process. They serve as:
- **Validation tools**: Test assumptions and calculations
- **Documentation**: Demonstrate why specific design choices were made
- **Reference**: Examples for future developers to understand the rationale

## Available Examples

### Rating Precision Validation

**File**: `rating-precision-validation.ts`

**Purpose**: Validates the decision to use `DECIMAL(9, 8)` for storing average ratings in the `Dishes` table.

**What it demonstrates**:
- How precision is maintained over millions of rating calculations
- Why lower precision would lead to accumulated rounding errors
- The importance of preserving full precision in the database

**Usage**:
```bash
npx ts-node documentation/database/examples/rating-precision-validation.ts
```

**Key Takeaway**: Always store full precision in the database (`DECIMAL(9, 8)`), but round to 1-2 decimal places only when displaying in the UI/API.

## Running Examples

Examples are written in TypeScript. To run them:

1. Ensure dependencies are installed: `npm install`
2. Run with `ts-node` or compile and run:
   ```bash
   npx ts-node documentation/database/examples/<script-name>.ts
   ```

