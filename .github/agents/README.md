# 🤖 Agents Directory

Complete index of all available agents for the Money-Lender-App project.

## 📋 Available Agents (7 Total)

### 1. 🚀 UserStory Agent
**File**: [USERSTORY.md](USERSTORY.md)

For creating and implementing new features based on requirements.

- ✅ Full-stack feature development
- ✅ New data models
- ✅ Service implementations
- ✅ UI components
- ✅ Route integration

**When to use**: Creating new pages, features, or business logic

---

### 2. 🐛 BugFix Agent
**File**: [BUGFIX.md](BUGFIX.md)

For identifying, analyzing, and fixing bugs in the codebase.

- ✅ Error analysis
- ✅ Root cause investigation
- ✅ Type safety fixes
- ✅ Runtime error resolution
- ✅ Cross-file dependency checking

**When to use**: Fixing compilation errors, runtime errors, type errors

---

### 3. ♻️ Refactor Agent
**File**: [REFACTOR.md](REFACTOR.md)

For improving code quality and maintainability without changing functionality.

- ✅ Code duplication removal
- ✅ Component extraction
- ✅ Performance optimization
- ✅ Naming improvements
- ✅ Pattern consistency

**When to use**: Extracting duplicate code, improving structure, simplifying complexity

---

### 4. ✅ Testing Agent
**File**: [TESTING.md](TESTING.md)

For creating comprehensive tests across the codebase.

- ✅ Unit tests
- ✅ Integration tests
- ✅ Component tests
- ✅ Mock and fixture creation
- ✅ Edge case testing

**When to use**: Writing tests, improving coverage, testing edge cases

---

### 5. 📖 Documentation Agent
**File**: [DOCUMENTATION.md](DOCUMENTATION.md)

For creating and maintaining project documentation.

- ✅ API documentation
- ✅ Feature guides
- ✅ Architecture documentation
- ✅ Setup instructions
- ✅ Decision records

**When to use**: Writing docs, creating guides, updating README files

---

### 6. 👁️ Review Agent
**File**: [REVIEW.md](REVIEW.md)

For conducting thorough code quality reviews.

- ✅ Quality assessment
- ✅ Pattern verification
- ✅ TypeScript compliance
- ✅ Security review
- ✅ Performance analysis

**When to use**: Code review, quality assurance, standards verification

---

### 7. ⚡ Performance Agent
**File**: [PERFORMANCE.md](PERFORMANCE.md)

For optimizing application performance and efficiency.

- ✅ Bundle optimization
- ✅ Load time improvement
- ✅ Memory optimization
- ✅ Rendering optimization
- ✅ Cache strategies

**When to use**: Improving performance, reducing bundle size, optimizing rendering

---

## 🎯 Quick Selection Guide

### Use UserStory Agent When:
- [ ] Creating new pages
- [ ] Adding new features
- [ ] Building new data models
- [ ] Implementing business logic
- [ ] Adding service methods

### Use BugFix Agent When:
- [ ] Code won't compile
- [ ] Runtime errors occur
- [ ] Type errors appear
- [ ] Features don't work
- [ ] State isn't updating

### Use Refactor Agent When:
- [ ] Code duplication exists
- [ ] Structure is messy
- [ ] Complexity is high
- [ ] Components are too large
- [ ] Logic can be extracted

### Use Testing Agent When:
- [ ] Writing unit tests
- [ ] Need test coverage
- [ ] Testing edge cases
- [ ] Creating mocks
- [ ] Integration testing

### Use Documentation Agent When:
- [ ] Documenting features
- [ ] Writing API docs
- [ ] Creating setup guides
- [ ] Recording decisions
- [ ] Updating README

### Use Review Agent When:
- [ ] Need code review
- [ ] Quality check needed
- [ ] Security concerns
- [ ] Standards verification
- [ ] Performance review

### Use Performance Agent When:
- [ ] Slow load times
- [ ] Large bundle size
- [ ] Memory issues
- [ ] Rendering problems
- [ ] Optimization needed

---

## 📂 File Organization

```
.github/
├── agents/
│   ├── USERSTORY.md        # 🚀 Feature development
│   ├── BUGFIX.md           # 🐛 Bug fixing
│   ├── REFACTOR.md         # ♻️ Code improvement
│   ├── TESTING.md          # ✅ Test creation
│   ├── DOCUMENTATION.md    # 📖 Documentation
│   ├── REVIEW.md           # 👁️ Code review
│   ├── PERFORMANCE.md      # ⚡ Performance
│   └── README.md           # This file
├── AGENT_SELECTOR.md       # Agent selection guide
└── workflows/              # GitHub Actions workflows
```

---

## 🔗 Related Resources

### Project Documentation
- [Main Project Guide](../../USERSTORY_AGENT_GUIDE.md)
- [Agent Selector](../AGENT_SELECTOR.md)

### Memory Files
- [Project Overview](/memories/repo/project-overview.md)
- [Architecture Patterns](/memories/repo/architecture-patterns.md)
- [Coding Standards](/memories/repo/coding-standards.md)
- [Feature Guidelines](/memories/repo/feature-guidelines.md)
- [API Contract](/memories/repo/api-contract.md)
- [Available Agents](/memories/repo/available-agents.md)

### Quick Start
- [Quick Reference](/memories/repo/quick-reference.md)
- [Tech Stack](/memories/repo/tech-stack.md)

---

## 💡 Tips for Using Agents

### 1. Be Specific
Provide clear, detailed requirements rather than vague descriptions.

```
✅ GOOD: "Create a loan approval page with admin dashboard showing pending loans"
❌ BAD: "Create a new page"
```

### 2. Provide Context
Reference existing similar features and patterns to follow.

```
✅ GOOD: "Follow the payment pattern used in UserDetails.tsx"
❌ BAD: "Make it work"
```

### 3. Include Examples
Show what you want the feature to do with examples.

```
✅ GOOD: "When loan is approved, send SMS to borrower with details"
❌ BAD: "Handle approvals"
```

### 4. Specify Constraints
Mention any technical constraints or requirements.

```
✅ GOOD: "Must work with LocalStorage and API backends"
❌ BAD: "Make it compatible"
```

### 5. List Success Criteria
Define what success looks like.

```
✅ GOOD: "Success: Mobile responsive, dark mode support, 80%+ test coverage"
❌ BAD: "Make it good"
```

---

## 📊 Agent Capabilities Matrix

| Capability | UserStory | BugFix | Refactor | Testing | Docs | Review | Performance |
|-----------|-----------|--------|----------|---------|------|--------|-------------|
| Design | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analysis | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Implementation | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Code Quality | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Testing | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Documentation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Getting Started

1. **Identify your task** - What do you need to do?
2. **Select an agent** - Use the Quick Selection Guide
3. **Read agent details** - Check the agent file for specific guidance
4. **Prepare your request** - Gather context and be specific
5. **Invoke the agent** - Use `runSubagent()` or specify agent in prompt
6. **Review results** - Verify implementation meets requirements

---

## 📞 Support

If you're not sure which agent to use:
1. Check the [Agent Selector Guide](../AGENT_SELECTOR.md)
2. Review the Quick Selection Guide above
3. Follow the decision tree in agent selection flowchart
4. Ask in your prompt - I can help determine the right agent

---

**Last Updated**: April 24, 2026
**Total Agents**: 7
**All Agents Documented**: ✅
