# MFT Hour Tracking Application - Test Suite

This comprehensive test suite ensures the reliability and functionality of the MFT (Marriage and Family Therapist) hour tracking application. The tests cover all core features, edge cases, and integration scenarios.

## Test Structure

```
__tests__/
├── __fixtures__/          # Test data and mock objects
├── __mocks__/             # Mock implementations
├── unit/                  # Unit tests
│   ├── utils/            # Utility function tests
│   ├── hooks/            # React hook tests
│   └── components/       # Component tests
├── integration/          # Integration tests
└── README.md            # This file
```

## Test Coverage

### 🔧 Utility Functions (`__tests__/unit/utils/`)

#### **Date Utils (`dateUtils.test.ts`)**
- **formatDateKey**: Date formatting to YYYY-MM-DD strings
- **isToday**: Current date detection with timezone handling
- **isSameDay**: Date comparison logic
- **getCECycleInfo**: CE cycle boundary calculations (Oct 1 - Sep 30)
- **calculateTimeProgress**: Training progress based on start date

**Coverage**: Date manipulation, timezone handling, boundary conditions, leap years

#### **Progress Utils (`progressUtils.test.ts`)**
- **calculateProgress**: Complete progress calculation engine
- Clinical hours tracking (3,000/4,000 hour requirements)
- Direct MFT hours (1,000 hour requirement)
- Supervision hours (100 total, 25 video/audio)
- CE requirements (40 hours/cycle with categories)
- Time-based progress (2-year minimum)

**Coverage**: Complex calculations, multiple requirement types, edge cases

#### **Supabase Data (`supabaseData.test.ts`)**
- **User Profile Management**: Creation and retrieval
- **Hour Entry Operations**: CRUD operations with validation
- **Out of Office Management**: Conflict prevention and data integrity
- **Database Error Handling**: Network failures and recovery
- **Data Loading**: Complete user data aggregation

**Coverage**: Database operations, error scenarios, data consistency

### ⚛️ React Hooks (`__tests__/unit/hooks/`)

#### **useSupabaseHourTracker (`useSupabaseHourTracker.test.tsx`)**
- **State Management**: Form data, editing states, error handling
- **Data Operations**: Save, edit, delete hour entries
- **Validation Logic**: Form validation and business rules
- **Out of Office**: OOO status management and conflicts
- **Real-time Sync**: Database synchronization
- **Error Recovery**: Graceful error handling

**Coverage**: Hook behavior, state transitions, async operations

### 🎨 Components (`__tests__/unit/components/`)

#### **HourEntryForm (`forms/HourEntryForm.test.tsx`)**
- **Form Rendering**: All input fields and controls
- **Dynamic Fields**: Type-specific form elements
- **User Interactions**: Input changes, selections
- **Validation Display**: Error states and feedback
- **CE Functionality**: Category and delivery format handling
- **Supervision Reviews**: Video/audio review options

**Coverage**: User interface, form behavior, accessibility

#### **DayDetails (`calendar/DayDetails.test.tsx`)**
- **Date Display**: Current date highlighting, date formatting
- **Entry Management**: Display, edit, delete operations
- **Out of Office**: OOO status display and controls
- **Conditional Rendering**: State-based UI changes
- **User Actions**: Button interactions and callbacks

**Coverage**: Calendar integration, state-dependent UI

### 🔄 Integration Tests (`__tests__/integration/`)

#### **Hour Tracking Flow (`hour-tracking-flow.test.tsx`)**
- **Complete Workflows**: End-to-end user scenarios
- **Form Validation**: Real-time validation in context
- **Calendar Navigation**: Date selection and view switching
- **View Management**: Switching between app sections
- **Error Handling**: User-facing error scenarios
- **Data Persistence**: State management across operations

**Coverage**: User workflows, component integration, error scenarios

## Test Data & Mocks (`__tests__/__fixtures__/` & `__tests__/__mocks__/`)

### **Test Fixtures (`__fixtures__/testData.ts`)**
- **Mock Entries**: Sample hour entries for all types
- **User Data**: Complete user application data
- **Progress Stats**: Realistic progress calculations  
- **Error Scenarios**: Common error conditions
- **Database Responses**: Mock API responses

### **Mock Implementations**
- **Supabase Client**: Complete database operation mocking
- **Clerk Authentication**: User state and authentication flow
- **Date/Time**: Consistent test timing with fake timers

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test Categories
```bash
# Unit tests only
npm test __tests__/unit/

# Integration tests only
npm test __tests__/integration/

# Specific component
npm test HourEntryForm

# Specific utility
npm test dateUtils
```

## Test Features Covered

### ✅ Core Functionality
- **Hour Entry Management**: Create, read, update, delete operations
- **Entry Types**: Psychotherapy, clinical sessions, supervision, CE
- **Form Validation**: Required fields, business rules, data types
- **Progress Tracking**: All Utah MFT requirements
- **Calendar Integration**: Date selection, navigation, display
- **Out of Office**: Conflict prevention, status management

### ✅ User Interface
- **Responsive Design**: Mobile and desktop compatibility
- **Form Interactions**: Dynamic field display, validation feedback
- **Calendar Views**: Month/week switching, date highlighting
- **Error States**: User-friendly error messaging
- **Loading States**: Async operation feedback

### ✅ Data Management
- **Database Operations**: Full Supabase integration
- **Real-time Sync**: UI state synchronization
- **Error Recovery**: Network failure handling
- **Data Consistency**: Validation and integrity checks
- **Authentication**: Clerk user management

### ✅ Business Logic
- **MFT Requirements**: Complete Utah licensing requirements
- **Progress Calculations**: Complex multi-category tracking
- **Date/Time Handling**: Timezone-aware calculations
- **CE Cycles**: 2-year cycle management
- **Validation Rules**: Professional standards compliance

## Test Quality Standards

### **Code Coverage Targets**
- **Lines**: 80%+ coverage
- **Functions**: 80%+ coverage  
- **Branches**: 80%+ coverage
- **Statements**: 80%+ coverage

### **Test Categories**
- **Happy Path**: Normal user workflows
- **Edge Cases**: Boundary conditions, unusual inputs
- **Error Scenarios**: Network failures, validation errors
- **Integration**: Component interaction, data flow
- **Accessibility**: Screen reader, keyboard navigation

### **Performance Considerations**
- **Fast Execution**: Tests run in under 30 seconds
- **Isolated Tests**: No test interdependencies
- **Mock Strategy**: Minimal external dependencies
- **Memory Efficient**: Proper cleanup and teardown

## Continuous Integration

The test suite is designed for CI/CD environments:

```bash
npm run test:ci
```

- Runs all tests without watch mode
- Generates coverage reports
- Exits with appropriate codes for CI systems
- Handles timeouts and resource constraints

## Test Data Management

### **Realistic Data**
- Based on actual Utah MFT requirements
- Includes edge cases and boundary conditions
- Covers all entry types and combinations

### **Consistency**
- Fixed timestamps for predictable tests
- Deterministic mock responses
- Reproducible test scenarios

### **Maintainability**
- Centralized test data in fixtures
- Reusable mock functions
- Clear data relationships

## Debugging Tests

### **Common Issues**
- **Timing**: Use `waitFor` for async operations
- **Mocking**: Ensure all external dependencies are mocked
- **State**: Check component state updates
- **DOM**: Verify element presence and accessibility

### **Debugging Tools**
- **screen.debug()**: Print current DOM state
- **console.log**: Add temporary logging
- **breakpoints**: Use debugger statements
- **Coverage**: Identify untested code paths

## Contributing to Tests

### **Adding New Tests**
1. Follow existing naming conventions
2. Use appropriate test categories
3. Include both positive and negative cases
4. Add proper descriptions and documentation

### **Test Structure**
```typescript
describe('Component/Function Name', () => {
  describe('feature category', () => {
    it('should do specific thing', () => {
      // Arrange
      // Act  
      // Assert
    })
  })
})
```

### **Best Practices**
- Write tests before implementation (TDD)
- Test behavior, not implementation details
- Use descriptive test names
- Keep tests focused and atomic
- Mock external dependencies appropriately

This comprehensive test suite ensures the MFT hour tracking application is reliable, user-friendly, and maintains data integrity across all operations.