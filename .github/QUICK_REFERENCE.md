# 🎯 Agent Quick Reference Card

Print this card or bookmark this file for quick agent selection.

---

## Agent Selection Chart

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    WHAT DO YOU NEED TO DO?                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CREATE NEW FEATURE/PAGE          →  🚀  USERSTORY AGENT               │
│  ├─ New page/component                                                 │
│  ├─ New data model                                                     │
│  ├─ New service method                                                 │
│  └─ New business logic                                                 │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FIX BUG/ERROR                    →  🐛  BUGFIX AGENT                  │
│  ├─ Compilation error                                                  │
│  ├─ Runtime error                                                      │
│  ├─ Type error                                                         │
│  └─ Feature not working                                                │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  IMPROVE EXISTING CODE            →  Choose One:                       │
│  ├─ Performance optimization      →  ⚡  PERFORMANCE AGENT            │
│  │  ├─ Bundle size                                                     │
│  │  ├─ Load time                                                       │
│  │  └─ Rendering speed                                                │
│  │                                                                     │
│  └─ Structure/quality             →  ♻️  REFACTOR AGENT               │
│     ├─ Remove duplication                                              │
│     ├─ Extract components                                              │
│     └─ Simplify logic                                                  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  WRITE TESTS                      →  ✅  TESTING AGENT                 │
│  ├─ Unit tests                                                         │
│  ├─ Integration tests                                                  │
│  ├─ Edge cases                                                         │
│  └─ Test mocks                                                         │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  WRITE DOCUMENTATION              →  📖  DOCUMENTATION AGENT           │
│  ├─ API documentation                                                  │
│  ├─ Feature guide                                                      │
│  ├─ Architecture doc                                                   │
│  └─ Setup instructions                                                 │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CODE REVIEW                      →  👁️  REVIEW AGENT                 │
│  ├─ Quality check                                                      │
│  ├─ Pattern verification                                               │
│  ├─ Security review                                                    │
│  └─ Standards check                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Agent Reference

### 🚀 UserStory Agent
**When**: Creating new features  
**Time**: Builds everything (types, services, UI, routes)  
**Example**: "Create loan refinancing feature"  
**File**: `.github/agents/USERSTORY.md`

### 🐛 BugFix Agent
**When**: Something is broken  
**Time**: Analyzes and fixes issues  
**Example**: "Fix Dashboard not updating after payment"  
**File**: `.github/agents/BUGFIX.md`

### ♻️ Refactor Agent
**When**: Code needs improvement  
**Time**: Restructures without changing behavior  
**Example**: "Extract duplicate payment logic"  
**File**: `.github/agents/REFACTOR.md`

### ✅ Testing Agent
**When**: Need test coverage  
**Time**: Writes comprehensive tests  
**Example**: "Write tests for UserDetails page"  
**File**: `.github/agents/TESTING.md`

### 📖 Documentation Agent
**When**: Need to document  
**Time**: Creates clear documentation  
**Example**: "Create API documentation"  
**File**: `.github/agents/DOCUMENTATION.md`

### 👁️ Review Agent
**When**: Code quality check  
**Time**: Reviews and reports issues  
**Example**: "Review new payment feature"  
**File**: `.github/agents/REVIEW.md`

### ⚡ Performance Agent
**When**: Performance issues  
**Time**: Optimizes and benchmarks  
**Example**: "Optimize Dashboard load time"  
**File**: `.github/agents/PERFORMANCE.md`

---

## How to Invoke

```
runSubagent(
  description: "[Brief task]",
  prompt: "[Detailed requirements]"
)
```

### Example:
```
runSubagent(
  description: "Create loan refinancing feature",
  prompt: "Build feature allowing users to refinance loans with:
           - New term selection
           - Interest recalculation
           - SMS notification
           Reference UserDetails.tsx"
)
```

---

## Success Tips ⭐

| Do ✅ | Don't ❌ |
|------|---------|
| Be specific | Be vague |
| Include context | Assume context |
| Provide examples | Say "just do it" |
| List criteria | Skip requirements |
| Reference similar features | Start from scratch |
| Test thoroughly | Skip verification |

---

## Memory Files Available

All agents can access:
- `/memories/repo/project-overview.md` - What project does
- `/memories/repo/architecture-patterns.md` - How it's built
- `/memories/repo/coding-standards.md` - Code style rules
- `/memories/repo/feature-guidelines.md` - How to build features
- `/memories/repo/api-contract.md` - API specifications
- `/memories/repo/available-agents.md` - Agent reference
- `/memories/repo/quick-reference.md` - Quick lookup

---

## Decision Tree (Text Version)

```
Need to...
│
├─ Create? → 🚀 UserStory
├─ Fix bug? → 🐛 BugFix
├─ Improve?
│  ├─ Performance? → ⚡ Performance
│  └─ Structure? → ♻️ Refactor
├─ Write tests? → ✅ Testing
├─ Write docs? → 📖 Documentation
└─ Review code? → 👁️ Review
```

---

## File Locations

```
.github/
├── agents/
│   ├── USERSTORY.md        - 🚀 Feature creation
│   ├── BUGFIX.md           - 🐛 Bug fixing
│   ├── REFACTOR.md         - ♻️ Code quality
│   ├── TESTING.md          - ✅ Test writing
│   ├── DOCUMENTATION.md    - 📖 Documentation
│   ├── REVIEW.md           - 👁️ Code review
│   ├── PERFORMANCE.md      - ⚡ Performance
│   └── README.md           - Agent overview
├── AGENT_SELECTOR.md       - Detailed selection guide
└── README.md               - This directory guide
```

---

## Common Tasks → Agent Mapping

| Task | Agent | File |
|------|-------|------|
| Add payment export feature | 🚀 | USERSTORY.md |
| Fix date picker mobile bug | 🐛 | BUGFIX.md |
| Extract payment logic | ♻️ | REFACTOR.md |
| Write payment tests | ✅ | TESTING.md |
| Document API | 📖 | DOCUMENTATION.md |
| Review code quality | 👁️ | REVIEW.md |
| Speed up Dashboard | ⚡ | PERFORMANCE.md |

---

## Need Help?

1. **Choose agent**: Use chart above or decision tree
2. **Read guide**: Check agent's `.md` file in `.github/agents/`
3. **Prepare request**: Gather context and be specific
4. **Invoke**: Use `runSubagent()` with description and prompt
5. **Review**: Check results and request refinements

---

## Quick Links

- 🏠 [Main Project Guide](../USERSTORY_AGENT_GUIDE.md)
- 📋 [Agent Selector](AGENT_SELECTOR.md)
- 📂 [All Agents](agents/README.md)
- 💾 [Memory Files](/memories/repo/)

---

**Bookmark This! 🔖** Use this card for quick agent selection.  
**Last Updated**: April 24, 2026  
**Total Agents**: 7
