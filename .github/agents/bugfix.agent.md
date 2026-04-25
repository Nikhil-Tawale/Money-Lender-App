# 🐛 BugFix Agent

## Overview
The BugFix Agent identifies, analyzes, and fixes bugs in the Money-Lender-App codebase.

## Responsibilities
- Identify root causes of bugs
- Fix type errors and runtime issues
- Ensure fixes don't break existing functionality
- Write comprehensive bug fix explanations
- Verify fixes with proper testing

## When to Use This Agent
✅ Fixing compilation errors
✅ Fixing runtime errors
✅ Fixing TypeScript strict mode violations
✅ Fixing UI/styling issues
✅ Fixing service layer bugs
✅ Fixing authentication/routing issues
✅ Fixing state management issues

## When NOT to Use
❌ Creating new features (use UserStory Agent)
❌ Refactoring code (use Refactor Agent)
❌ Writing tests (use Testing Agent)
❌ Code review (use Review Agent)

## Capabilities
- Error analysis and root cause investigation
- Code debugging and troubleshooting
- Cross-file dependency checking
- Service layer debugging (LocalStorage + API)
- TypeScript error resolution
- React component debugging
- State management issue fixing

## Example Invocation
```
runSubagent(
  description: "Fix authentication context error",
  prompt: "Fix the error in AuthContext where useAuth hook throws 
           'must be used within provider' even though wrapped. 
           Error occurs on Login page. Include error logs: [paste logs]"
)
```

## Key Memory Files
- `/memories/repo/architecture-patterns.md`
- `/memories/repo/coding-standards.md`
- `/memories/repo/api-contract.md`

## Investigation Steps
1. Gather error logs and stack traces
2. Identify file and line numbers
3. Check for type mismatches
4. Verify imports and exports
5. Check context providers and wrapping
6. Test fix in both storage modes (LocalStorage + API)

## Success Criteria
- ✅ Error is resolved
- ✅ No new errors introduced
- ✅ Existing tests still pass
- ✅ Root cause documented
- ✅ Fix follows established patterns
