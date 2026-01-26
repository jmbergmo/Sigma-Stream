# Testing Overview

This document describes the purpose and coverage of each test suite in the `tests/` directory.

## 1. App Integration Tests
- **File**: `tests/App.test.tsx`
- **Purpose**: Verify the end-to-end flow of the main application integration.
- **Key Coverage**:
  - Simulates clicking the "Demo" button.
  - Verifies navigation to the output results page.
  - Checks for the presence of key results sections: Experimental Results, Pareto Chart, Prediction & Optimization.
  - Indirectly verifies valid data generation and calculation logic.

## 2. Navigation Component Tests
- **File**: `tests/Navigation.test.tsx`
- **Purpose**: Ensure the navigation bar correctly reflects the active route.
- **Key Coverage**:
  - Validates that the active tab (Input, Output, History, Blog, Account) is highlighted with the correct style (`text-white`) for corresponding routes.

## 3. URL Synchronization & State Tests
- **File**: `tests/UrlSync.test.tsx`
- **Purpose**: specific testing for state serialization and URL-driven state management.
- **Key Coverage**:
  - **State Serialization**: conversion of state objects to/from base64 encoded JSON strings.
  - **URL Integration**:
    - Verifies the application loads initial state from the `?state=` URL query parameter.
    - Verifies that the URL is updated with a new `?state=` parameter when the application state changes.

## 4. Blog Utilities Tests
- **File**: `tests/blogUtils.test.ts`
- **Purpose**: Unit tests for the blog article processing logic.
- **Key Coverage**:
  - Parsing MDX file metadata (titles, slugs).
  - Handling files without headers (slug fallback).
  - Robustness against different raw module formats and missing exports.

## 5. Build Safety Tests
- **File**: `tests/build-safety.test.ts`
- **Purpose**: Ensure the application code is robust against missing environment variables during build/import time.
- **Key Coverage**:
  - Verifies `supabase` service can be imported without crashing even if env vars are missing.
  - Verifies `App` component can be imported without crashing.
  - *Note*: Crucial for CI/CD environments where secrets might not be present during build steps.

## 6. Build Process Tests
- **File**: `tests/build.test.ts`
- **Purpose**: Validate that the full application build command runs successfully.
- **Key Coverage**:
  - Executes `npm run build` and asserts a 0 exit code (no errors).

## 7. Math Utilities Tests
- **File**: `tests/mathUtils.test.ts`
- **Purpose**: Core validation of the simulation and mathematical logic.
- **Key Coverage**:
  - `evaluateFormula`: Correctness of formula parsing and evaluation (operators, precedence, exponents).
  - `generateNormalRandom`: Basic statistical properties of random number generation.
  - `runSimulation`: Validates the full simulation result structure, including calculated metrics (Cp, Cpk, DPMO, Sigma Level).

## 8. Supabase Connection Tests
- **File**: `tests/supabaseConnection.test.ts`
- **Purpose**: Basic sanity check for the Supabase service wrapper.
- **Key Coverage**:
  - Verifies the `supabase` client is initialized.
  - Checks that `supabase.auth.getSession` can be called (wrapper verification).

## 9. Test Setup
- **File**: `tests/setup.ts`
- **Purpose**: Global test configuration.
- **Details**: Imports `@testing-library/jest-dom` to provide custom Jest matchers for DOM elements (e.g., `toBeInTheDocument`).
