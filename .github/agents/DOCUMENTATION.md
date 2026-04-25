# 📖 Documentation Agent

## Overview
The Documentation Agent creates and maintains comprehensive project documentation.

## Responsibilities
- Create feature documentation
- Update architecture documentation
- Write API documentation
- Create user guides
- Maintain README files
- Document code patterns
- Create decision records (ADRs)

## When to Use This Agent
✅ Creating feature documentation
✅ Writing API documentation
✅ Creating user guides
✅ Updating README files
✅ Documenting architecture decisions
✅ Creating setup guides
✅ Writing troubleshooting guides

## When NOT to Use
❌ Creating new features (use UserStory Agent)
❌ Fixing bugs (use BugFix Agent)
❌ Refactoring code (use Refactor Agent)
❌ Writing tests (use Testing Agent)

## Capabilities
- Feature documentation
- API documentation
- Architecture documentation
- Setup and installation guides
- Troubleshooting guides
- Decision record creation
- Code example documentation
- Markdown formatting

## Example Invocation
```
runSubagent(
  description: "Create API documentation",
  prompt: "Generate complete API documentation including:
           - All endpoints with examples
           - Request/response formats
           - Error codes and handling
           - Authentication details
           - Rate limiting info"
)
```

## Key Memory Files
- `/memories/repo/project-overview.md`
- `/memories/repo/api-contract.md`
- `/memories/repo/architecture-patterns.md`

## Documentation Types
1. **API Docs** - Endpoint specifications
2. **Architecture Docs** - System design
3. **Setup Guides** - Installation and config
4. **User Guides** - Feature usage
5. **Developer Guides** - Development workflow
6. **ADRs** - Architecture decisions
7. **Troubleshooting** - Problem solving

## Success Criteria
- ✅ Documentation is comprehensive
- ✅ Examples are accurate
- ✅ Instructions are clear
- ✅ Markdown formatting is clean
- ✅ Links are correct
- ✅ Code samples work
