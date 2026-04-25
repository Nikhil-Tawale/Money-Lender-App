# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# 🎯 GitHub Agents Configuration

This directory contains configuration and documentation for automated agents that help develop the Money-Lender-App.

## 📂 Directory Structure

```
.github/
├── agents/                  # Agent implementations and guides
│   ├── README.md           # Agent directory overview
│   ├── USERSTORY.md        # Feature development agent
│   ├── BUGFIX.md           # Bug fixing agent
│   ├── REFACTOR.md         # Code refactoring agent
│   ├── TESTING.md          # Test creation agent
│   ├── DOCUMENTATION.md    # Documentation agent
│   ├── REVIEW.md           # Code review agent
│   └── PERFORMANCE.md      # Performance optimization agent
│
├── workflows/              # GitHub Actions workflows (future)
│   └── (CI/CD pipelines)
│
├── AGENT_SELECTOR.md       # Guide to selecting the right agent
└── README.md               # This file
```

## 🤖 Available Agents (7 Total)

### Quick Overview

| Agent | Icon | Purpose | When to Use |
|-------|------|---------|-------------|
| **UserStory** | 🚀 | Create new features | New pages, components, services |
| **BugFix** | 🐛 | Fix bugs and errors | Compilation, runtime, type errors |
| **Refactor** | ♻️ | Improve code quality | Duplication, extraction, cleanup |
| **Testing** | ✅ | Write tests | Unit, integration, edge cases |
| **Documentation** | 📖 | Create documentation | API docs, guides, architecture |
| **Review** | 👁️ | Code quality review | Standards, security, patterns |
| **Performance** | ⚡ | Optimize performance | Bundle size, load time, rendering |

For detailed information on each agent, see [agents/README.md](agents/README.md).

## 🎯 Agent Selection Flowchart

```
                    START
                      |
           What do you need to do?
                      |
          ____________|____________
         |            |            |
    CREATE NEW?  FIX BUG?  IMPROVE CODE?
         |            |            |
         ↓            ↓            ↓
       🚀        🐛          ├─ Performance? → ⚡
   UserStory   BugFix       └─ Structure? → ♻️
                                 |
                          ______|_______
                         |       |       |
                    TESTS?  DOCS?  REVIEW?
                         |       |       |
                         ↓       ↓       ↓
                        ✅      📖      👁️
                      Testing  Docs    Review
```

## 📖 How to Select an Agent

### 1. Using the Decision Tree
Answer these questions in order:

1. **Are you creating something NEW?**
   - ✅ YES → Use 🚀 **UserStory Agent**
   - ❌ NO → Continue

2. **Is there a BUG or ERROR to fix?**
   - ✅ YES → Use 🐛 **BugFix Agent**
   - ❌ NO → Continue

3. **Are you improving existing code?**
   - Performance focus? → Use ⚡ **Performance Agent**
   - Structure focus? → Use ♻️ **Refactor Agent**
   - ❌ NO → Continue

4. **Do you need to write TESTS?**
   - ✅ YES → Use ✅ **Testing Agent**
   - ❌ NO → Continue

5. **Do you need DOCUMENTATION?**
   - ✅ YES → Use 📖 **Documentation Agent**
   - ❌ NO → Continue

6. **Do you need CODE REVIEW?**
   - ✅ YES → Use 👁️ **Review Agent**

### 2. Using the Agent Selector Guide
See [AGENT_SELECTOR.md](AGENT_SELECTOR.md) for comprehensive guidance with examples.

### 3. Quick Reference Table
See [agents/README.md](agents/README.md#-quick-selection-guide) for quick selection checklist.

## 🚀 Using an Agent

### Invocation Syntax

```
runSubagent(
  description: "[Brief 3-5 word task description]",
  prompt: "[Detailed requirements and context]"
)
```

### Example Usage

**Create a New Feature:**
```
runSubagent(
  description: "Create loan refinancing feature",
  prompt: "Implement a loan refinancing feature where users can:
          - Select existing loan to refinance
          - Choose new terms and interest rate
          - Recalculate total interest
          - Send SMS notification
          Reference UserDetails.tsx for payment patterns."
)
```

**Fix a Bug:**
```
runSubagent(
  description: "Fix Dashboard user list not updating",
  prompt: "Fix bug in Dashboard where user list doesn't update after 
          payment is recorded. The payment is saved but UI doesn't refresh.
          Error in console: [paste error]"
)
```

**Refactor Code:**
```
runSubagent(
  description: "Extract payment calculation logic",
  prompt: "Extract duplicate payment calculation from UserDetails.tsx 
          and InterestCalculator.tsx into a reusable service."
)
```

## 📚 Memory & Context

All agents have access to comprehensive memory files:

### Repository Memory (`/memories/repo/`)
- `project-overview.md` - Project structure and features
- `architecture-patterns.md` - Design patterns used
- `tech-stack.md` - Technology stack details
- `coding-standards.md` - Code style and conventions
- `feature-guidelines.md` - Feature development process
- `api-contract.md` - API specifications
- `quick-reference.md` - Commands and quick lookup
- `available-agents.md` - Agent reference

### Session Memory (`/memories/session/`)
- `agent-selection.md` - Current session's agent work

## ✅ Agent Checklist

### Before Invoking an Agent
- [ ] Clearly identify your task
- [ ] Select the right agent using the decision tree
- [ ] Read the agent's guide in `.github/agents/`
- [ ] Gather all necessary context
- [ ] Be specific with requirements
- [ ] Provide success criteria

### After Agent Completes
- [ ] Review the generated code/output
- [ ] Verify it meets requirements
- [ ] Check for proper integration
- [ ] Test functionality
- [ ] Request refinements if needed

## 🎓 Agent Documentation

Each agent has a detailed guide:

1. **[agents/USERSTORY.md](agents/USERSTORY.md)** - Feature development
2. **[agents/BUGFIX.md](agents/BUGFIX.md)** - Bug fixing
3. **[agents/REFACTOR.md](agents/REFACTOR.md)** - Code refactoring
4. **[agents/TESTING.md](agents/TESTING.md)** - Test creation
5. **[agents/DOCUMENTATION.md](agents/DOCUMENTATION.md)** - Documentation
6. **[agents/REVIEW.md](agents/REVIEW.md)** - Code review
7. **[agents/PERFORMANCE.md](agents/PERFORMANCE.md)** - Performance

## 📊 Agent Capabilities

| Feature | Supported By |
|---------|-------------|
| Create new features | 🚀 UserStory |
| Fix bugs | 🐛 BugFix, 🚀 UserStory |
| Improve code | ♻️ Refactor, ⚡ Performance |
| Write tests | ✅ Testing, 🚀 UserStory |
| Create documentation | 📖 Documentation, 🚀 UserStory |
| Review code | 👁️ Review, ♻️ Refactor |
| Optimize performance | ⚡ Performance, ♻️ Refactor |

## 🔗 Related Resources

### Main Project Documentation
- [USERSTORY_AGENT_GUIDE.md](../USERSTORY_AGENT_GUIDE.md) - Master agent guide
- [README.md](../README.md) - Project README

### Agent Guides
- [Agent Selector](AGENT_SELECTOR.md) - Detailed selection guide
- [Agents Overview](agents/README.md) - Complete agent list

### Memory Files
- [Available Agents](/memories/repo/available-agents.md)
- [Project Overview](/memories/repo/project-overview.md)
- [Architecture Patterns](/memories/repo/architecture-patterns.md)

## 💡 Tips for Success

### 1. Be Specific
```
✅ GOOD: "Create a loan approval feature with status tracking"
❌ BAD: "Create a new page"
```

### 2. Provide Context
```
✅ GOOD: "Reference UserDetails.tsx for similar payment patterns"
❌ BAD: "Make it similar to other pages"
```

### 3. Include Examples
```
✅ GOOD: "When approved, send SMS: 'Loan #123 approved'"
❌ BAD: "Send notifications"
```

### 4. Specify Constraints
```
✅ GOOD: "Must support LocalStorage and API backends"
❌ BAD: "Make it work everywhere"
```

### 5. Define Success
```
✅ GOOD: "Success: Mobile responsive, dark mode, 80% test coverage"
❌ BAD: "Make it good"
```

## 🆘 Getting Help

1. **Not sure which agent to use?**
   - Use the [Agent Selector Guide](AGENT_SELECTOR.md)
   - Follow the decision tree above
   - Check the quick reference table in [agents/README.md](agents/README.md)

2. **Want agent documentation?**
   - See individual agent files in [agents/](agents/)
   - Check [agents/README.md](agents/README.md) for overview

3. **Need project context?**
   - Review memory files in `/memories/repo/`
   - See [USERSTORY_AGENT_GUIDE.md](../USERSTORY_AGENT_GUIDE.md)

## 📞 Quick Links

- **Agent Selector**: [AGENT_SELECTOR.md](AGENT_SELECTOR.md) - Choose the right agent
- **All Agents**: [agents/README.md](agents/README.md) - Complete agent list
- **Project Guide**: [USERSTORY_AGENT_GUIDE.md](../USERSTORY_AGENT_GUIDE.md) - Full project scope
- **Project Memory**: [/memories/repo/](../../memories/repo/) - Project knowledge base

---

**Status**: ✅ Complete with 7 agents
**Last Updated**: April 24, 2026
**Version**: 1.0

