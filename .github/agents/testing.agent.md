# ✅ Testing Agent

## Overview
The Testing Agent creates comprehensive tests for the Money-Lender-App codebase.

## Responsibilities
- Write unit tests for services
- Write component tests
- Write integration tests
- Create test fixtures and mocks
- Ensure high code coverage
- Test error scenarios
- Document test strategies

## When to Use This Agent
✅ Writing unit tests for services
✅ Writing component tests
✅ Creating test mocks and fixtures
✅ Testing error scenarios
✅ Testing dark mode functionality
✅ Testing responsive design
✅ Integration testing

## When NOT to Use
❌ Creating new features (use UserStory Agent)
❌ Fixing bugs (use BugFix Agent)
❌ Refactoring code (use Refactor Agent)
❌ Code review (use Review Agent)

## Capabilities
- Unit test creation (Jest/Vitest)
- Component testing (React Testing Library)
- Mock and fixture creation
- Test organization and structure
- Coverage analysis
- Edge case testing
- Integration test design

## Example Invocation
```
runSubagent(
  description: "Create tests for UserDetails page",
  prompt: "Write comprehensive tests for UserDetails.tsx including:
           - Loading and error states
           - Payment form submission
           - Dark mode rendering
           - Mobile responsiveness
           - Auth guard verification"
)
```

## Key Memory Files
- `/memories/repo/project-overview.md`
- `/memories/repo/coding-standards.md`
- `/memories/repo/feature-guidelines.md`

## Test Categories
1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - Service layer with UI
3. **E2E Tests** - Complete user workflows
4. **Edge Cases** - Error conditions and boundaries
5. **Accessibility** - Keyboard navigation, screen readers
6. **Responsive** - All viewport sizes

## Success Criteria
- ✅ Tests are comprehensive
- ✅ High code coverage (>80%)
- ✅ All edge cases covered
- ✅ Tests follow conventions
- ✅ Mocks properly isolated
- ✅ Documentation included
