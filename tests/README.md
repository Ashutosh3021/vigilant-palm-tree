# MomentumTracker PWA Testing Strategy

This directory contains the comprehensive testing strategy for the MomentumTracker PWA, addressing all 3 critical bugs and providing complete test coverage.

## Test Directory Structure

```
tests/
├── unit/                 # Unit tests for individual functions
├── component/            # Component tests for React components
├── e2e/                # End-to-end tests for user flows
├── pwa/                # PWA-specific functionality tests
├── performance/          # Performance and load tests
├── testing-strategy.md   # Comprehensive testing documentation
├── bug-fix-validation.ts # Bug fix validation functions
├── jest.config.js        # Jest configuration
├── setupTests.js         # Test setup and mocks
├── test-runner.js        # Test execution script
└── README.md            # This file
```

## Testing Coverage

### 1. Unit Tests
- Storage functions (save, load, update, delete tasks)
- Score calculation functions
- Streak calculation logic
- Recovery task management
- Journal entry functions

### 2. Component Tests
- Dashboard page rendering and functionality
- Tasks page with all interactions
- Heatmap visualization
- Analytics charts and metrics
- Journal entry forms
- Achievements display
- Reports generation
- Export functionality

### 3. End-to-End Tests
- Complete user workflows
- Cross-page navigation
- Data persistence across sessions
- Multi-tab synchronization
- PWA installation flow

### 4. Bug-Specific Tests
- **Bug #1**: Task Weightage Resets on PWA Restart
- **Bug #2**: 3-4 Second Page Load Delay on tasks page
- **Bug #3**: All Tasks Vanish When Completing One + Recurring Tasks Broken

### 5. PWA Tests
- Service worker registration and caching
- Offline functionality
- Manifest validation
- Install prompt
- Icon loading and display

### 6. Performance Tests
- Page load times < 1 second
- Task rendering performance
- Memory usage optimization
- Smooth animations and interactions

## Running Tests

### Prerequisites
Make sure you have Jest installed:
```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/jest-dom
```

### Running the Test Suite
```bash
# Run all tests
node tests/test-runner.js

# Run specific test categories
npm test  # If configured in package.json
# or
npx jest tests/unit/
npx jest tests/component/
npx jest tests/e2e/
```

### Bug Fix Validation
To specifically validate the bug fixes:
```bash
node -e "require('./tests/bug-fix-validation').runAllValidations()"
```

## Test Configuration

The test suite uses:
- **Jest** for unit and component testing
- **React Testing Library** for component testing
- **jsdom** for browser environment simulation
- **Custom mocks** for localStorage and other browser APIs

## Test Coverage Goals

- **Unit Tests**: 80%+ line coverage
- **Component Tests**: All components tested
- **E2E Tests**: All critical user flows tested
- **Bug-Specific Tests**: All 3 known bugs verified as fixed
- **PWA Tests**: All PWA features validated
- **Performance Tests**: All pages under 1s load time

## Key Test Scenarios

### Bug #1: Task Weightage Persistence
- Verify priority_weight values persist across PWA restarts
- Test with various weight values (0-100%)
- Validate localStorage serialization/deserialization

### Bug #2: Performance Optimization
- Measure tasks page load time with 100+ tasks
- Verify single localStorage read optimization
- Test with various data sizes

### Bug #3: Task Completion Logic
- Complete one task without affecting others
- Test with 5+ tasks simultaneously
- Verify recovery task handling
- Validate recurring task creation

## Validation Results

The bug fix validation script will output results like:
```
=== Running Bug Fix Validations ===
Validating Bug #1: Task Weightage Resets on PWA Restart
Bug #1 Fix Validation: PASSED
Priority weight preserved: true

Validating Bug #2: Tasks Page Load Performance  
Bug #2 Fix Validation: PASSED
Load time for 100 tasks: 15.23ms (acceptable: <50ms)

Validating Bug #3: Tasks Vanish When Completing One
Bug #3 Fix Validation: PASSED
All tasks exist: true
Correct task completed: true
Other tasks unchanged: true

=== Validation Summary ===
Bug #1 (Weightage Reset): FIXED
Bug #2 (Performance): FIXED  
Bug #3 (Task Deletion): FIXED
Recovery Tasks: WORKING
Overall Status: ALL BUGS FIXED
```

This comprehensive testing strategy ensures all functionality is verified, all bugs are caught, and the application maintains high quality across all features and scenarios.