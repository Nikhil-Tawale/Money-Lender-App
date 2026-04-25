# ♻️ Refactor Agent

## Overview
The Refactor Agent improves code quality, maintainability, and performance without changing functionality.

## Responsibilities
- Improve code structure and organization
- Extract reusable components
- Optimize performance
- Reduce code duplication
- Improve readability and maintainability
- Apply SOLID principles
- Update documentation

## When to Use This Agent
✅ Extracting duplicate code
✅ Improving component organization
✅ Optimizing performance
✅ Improving naming conventions
✅ Restructuring services
✅ Extracting custom hooks
✅ Simplifying complex components

## When NOT to Use
❌ Creating new features (use UserStory Agent)
❌ Fixing bugs (use BugFix Agent)
❌ Writing tests (use Testing Agent)
❌ Code review (use Review Agent)

## Capabilities
- Code analysis and pattern detection
- Component extraction and composition
- Performance optimization
- Type safety verification
- Pattern consistency checking
- Documentation updates

## Example Invocation
```
runSubagent(
  description: "Refactor duplicate payment logic",
  prompt: "Extract duplicate payment calculation logic from 
           UserDetails.tsx and InterestCalculator.tsx into a 
           reusable service. Maintain existing functionality and 
           ensure all tests pass."
)
```

## Key Memory Files
- `/memories/repo/architecture-patterns.md`
- `/memories/repo/coding-standards.md`
- `/memories/repo/feature-guidelines.md`

## Refactoring Guidelines
1. **Preserve functionality** - All existing behavior must remain
2. **Maintain types** - No changes to external interfaces
3. **Test thoroughly** - Verify behavior before and after
4. **Document changes** - Explain improvements made
5. **Follow patterns** - Use established project patterns
6. **Minimize impact** - Change only what's necessary

## Success Criteria
- ✅ Functionality preserved
- ✅ Code is more maintainable
- ✅ Performance improved (or same)
- ✅ Types still strict
- ✅ All tests pass
- ✅ Changes documented
