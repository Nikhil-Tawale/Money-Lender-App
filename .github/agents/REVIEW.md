# 👁️ Review Agent

## Overview
The Review Agent conducts thorough code reviews for quality assurance and standards compliance.

## Responsibilities
- Review code for quality
- Verify pattern adherence
- Check TypeScript compliance
- Validate error handling
- Review performance implications
- Verify security practices
- Provide improvement suggestions

## When to Use This Agent
✅ Code quality review
✅ Pattern compliance verification
✅ TypeScript strict mode check
✅ Security review
✅ Performance review
✅ Error handling verification
✅ Documentation review

## When NOT to Use
❌ Creating new features (use UserStory Agent)
❌ Fixing bugs (use BugFix Agent)
❌ Refactoring code (use Refactor Agent)
❌ Writing tests (use Testing Agent)

## Capabilities
- Code quality assessment
- Pattern compliance checking
- TypeScript strict mode verification
- Performance analysis
- Security best practices review
- Error handling verification
- Documentation quality check

## Example Invocation
```
runSubagent(
  description: "Review new payment feature",
  prompt: "Conduct comprehensive review of the new payment feature:
           - TypeScript compliance
           - Pattern adherence
           - Error handling completeness
           - Security considerations
           - Performance implications
           - Test coverage adequacy"
)
```

## Key Memory Files
- `/memories/repo/architecture-patterns.md`
- `/memories/repo/coding-standards.md`
- `/memories/repo/feature-guidelines.md`

## Review Checklist
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling
- [ ] Pattern adherence (Factory, Provider, etc.)
- [ ] Security considerations
- [ ] Performance implications
- [ ] Test coverage
- [ ] Documentation completeness
- [ ] Accessibility compliance
- [ ] Mobile responsiveness
- [ ] Dark mode support

## Success Criteria
- ✅ Review is thorough
- ✅ Issues are documented
- ✅ Suggestions are actionable
- ✅ Examples provided
- ✅ Standards verified
- ✅ No critical issues missed
