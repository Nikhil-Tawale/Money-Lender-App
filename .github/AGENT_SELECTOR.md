# 🎯 Agent Selector Guide

## Available Agents for Money-Lender-App

Use this guide to select the right agent for your task. Each agent has specific expertise and responsibilities.

---

## Quick Decision Tree

```
What do you want to do?
│
├─→ Create NEW functionality?
│   └─→ 🚀 USE USERSTORY AGENT
│
├─→ Fix a BUG or ERROR?
│   └─→ 🐛 USE BUGFIX AGENT
│
├─→ Improve EXISTING CODE?
│   ├─→ Refactor/restructure?
│   │   └─→ ♻️ USE REFACTOR AGENT
│   └─→ Optimize performance?
│       └─→ ⚡ USE PERFORMANCE AGENT
│
├─→ Write or improve TESTS?
│   └─→ ✅ USE TESTING AGENT
│
├─→ Write or improve DOCUMENTATION?
│   └─→ 📖 USE DOCUMENTATION AGENT
│
└─→ Review CODE QUALITY?
    └─→ 👁️ USE REVIEW AGENT
```

---

## Agent Comparison Matrix

| Agent | Use Case | Expertise | Output |
|-------|----------|-----------|--------|
| **🚀 UserStory** | New features | Full-stack development | Pages, components, services, types |
| **🐛 BugFix** | Error fixing | Debugging, root cause analysis | Fixed code, bug explanation |
| **♻️ Refactor** | Code improvement | Architecture, patterns | Restructured code, improved quality |
| **✅ Testing** | Test creation | Unit & integration tests | Test files, mocks, coverage |
| **📖 Documentation** | Docs & guides | Technical writing | Documentation files, guides |
| **👁️ Review** | Quality assurance | Code standards, best practices | Review report, recommendations |
| **⚡ Performance** | Optimization | Performance tuning | Optimized code, metrics |

---

## Agent Descriptions & When to Use

### 🚀 UserStory Agent
**Purpose**: Create and implement new features

**Use when:**
- Building new pages or components
- Adding new data models
- Implementing new business logic
- Creating new service methods
- Adding new features from user stories

**Example**:
```
Create a loan refinancing feature where users can:
- Select existing loan
- Choose new terms
- Recalculate interest
- Get SMS notification
```

**Related Files**: [.github/agents/userstory.agent.md](.github/agents/userstory.agent.md)

---

### 🐛 BugFix Agent
**Purpose**: Identify and fix bugs in the codebase

**Use when:**
- Compilation or runtime errors
- TypeScript strict mode violations
- Authentication/routing issues
- Service layer bugs
- State management issues
- UI/styling problems

**Example**:
```
Fix the error in Dashboard where user list doesn't update 
after payment. Error: setState not triggering re-render.
```

**Related Files**: [.github/agents/bugfix.agent.md](.github/agents/bugfix.agent.md)

---

### ♻️ Refactor Agent
**Purpose**: Improve code quality and maintainability

**Use when:**
- Reducing code duplication
- Extracting reusable components
- Improving code organization
- Simplifying complex functions
- Updating naming conventions
- Extracting custom hooks

**Example**:
```
Extract duplicate payment calculation logic from 
UserDetails.tsx and InterestCalculator.tsx into a 
reusable service utility.
```

**Related Files**: [.github/agents/refactor.agent.md](.github/agents/refactor.agent.md)

---

### ✅ Testing Agent
**Purpose**: Create comprehensive tests

**Use when:**
- Writing unit tests for services
- Creating component tests
- Testing error scenarios
- Creating test fixtures/mocks
- Improving test coverage
- Testing edge cases

**Example**:
```
Write unit tests for the payment calculation service 
with 80%+ coverage including edge cases like:
- Zero payment
- Negative amounts
- Very large numbers
```

**Related Files**: [.github/agents/testing.agent.md](.github/agents/testing.agent.md)

---

### 📖 Documentation Agent
**Purpose**: Create and maintain documentation

**Use when:**
- Writing API documentation
- Creating setup guides
- Documenting features
- Writing troubleshooting guides
- Updating README files
- Recording architecture decisions

**Example**:
```
Create comprehensive API documentation including:
- All endpoints with examples
- Request/response formats
- Error codes
- Authentication details
```

**Related Files**: [.github/agents/documentation.agent.md](.github/agents/documentation.agent.md)

---

### 👁️ Review Agent
**Purpose**: Conduct code quality reviews

**Use when:**
- Reviewing code for quality
- Verifying pattern adherence
- Checking security practices
- Analyzing performance
- Validating error handling
- Ensuring test coverage

**Example**:
```
Review the new payment feature implementation for:
- TypeScript compliance
- Pattern adherence
- Security issues
- Error handling
```

**Related Files**: [.github/agents/review.agent.md](.github/agents/review.agent.md)

---

### ⚡ Performance Agent
**Purpose**: Optimize application performance

**Use when:**
- Improving bundle size
- Reducing load times
- Optimizing rendering
- Implementing caching
- Reducing memory usage
- Optimizing API calls

**Example**:
```
Optimize Dashboard page performance:
- Profile rendering issues
- Identify unnecessary re-renders
- Optimize API calls
- Implement memoization
```

**Related Files**: [.github/agents/performance.agent.md](.github/agents/performance.agent.md)

---

## How to Use Agents in Chat

### 1. Using Agent with Invoke Command
```
runSubagent(
  agentName: "Explore",  // Uses default Explore agent
  description: "Short description of task",
  prompt: "Detailed requirements and context..."
)
```

### 2. Specify Agent Type in Prompt
```
"I want to create a new feature...
[Invoke: UserStory Agent]"
```

### 3. Let Me Help You Choose
Just describe what you want to do:
- "I have a bug that needs fixing" → I'll invoke BugFix Agent
- "I want to add a new feature" → I'll invoke UserStory Agent
- "The code needs optimization" → I'll invoke Performance Agent

---

## Agent Selection Examples

### Scenario 1: New Feature
**Problem**: "Users need to export loan data to PDF"

**Decision**: 🚀 **UserStory Agent**
```
runSubagent(
  description: "Create PDF export feature",
  prompt: "Implement PDF export functionality for loan data..."
)
```

---

### Scenario 2: Bug Fix
**Problem**: "The reminder date picker isn't working on mobile"

**Decision**: 🐛 **BugFix Agent**
```
runSubagent(
  description: "Fix mobile date picker issue",
  prompt: "Fix date picker not working on mobile devices..."
)
```

---

### Scenario 3: Code Improvement
**Problem**: "We have duplicate payment logic in multiple files"

**Decision**: ♻️ **Refactor Agent**
```
runSubagent(
  description: "Extract duplicate payment logic",
  prompt: "Extract duplicate payment calculation code into service..."
)
```

---

### Scenario 4: Performance
**Problem**: "Dashboard is loading too slowly with many users"

**Decision**: ⚡ **Performance Agent**
```
runSubagent(
  description: "Optimize Dashboard performance",
  prompt: "Profile and optimize Dashboard page load time..."
)
```

---

### Scenario 5: Testing
**Problem**: "We need better test coverage for UserDetails page"

**Decision**: ✅ **Testing Agent**
```
runSubagent(
  description: "Add tests for UserDetails",
  prompt: "Write comprehensive tests for UserDetails.tsx..."
)
```

---

## Memory Files Available to All Agents

Every agent has access to these memory files for complete project context:

```
/memories/repo/
├── project-overview.md          # Project structure & features
├── architecture-patterns.md     # Design patterns & architecture
├── tech-stack.md               # Technologies & versions
├── coding-standards.md         # Code style & conventions
├── feature-guidelines.md       # Feature development process
├── api-contract.md            # API endpoints & formats
└── quick-reference.md         # Commands & quick lookups
```

---

## Tips for Best Results

### 1. Be Specific
✅ **Good**: "Create a loan refinancing feature that allows users to extend loan terms"
❌ **Bad**: "Create a new feature"

### 2. Provide Context
✅ **Good**: "Fix the payment calculation that shows wrong total"
❌ **Bad**: "Fix the bug"

### 3. Reference Similar Features
✅ **Good**: "Create feature similar to UserDetails.tsx payment handling"
❌ **Bad**: "Create a feature"

### 4. Specify Success Criteria
✅ **Good**: "Ensure mobile responsiveness and dark mode support"
❌ **Bad**: "Make it work"

### 5. Mention Constraints
✅ **Good**: "Must use existing Payment service interface"
❌ **Bad**: "Implement payment feature"

---

## Next Steps

1. **Identify your task** using the decision tree above
2. **Select the appropriate agent** from the descriptions
3. **Provide detailed context** to the agent
4. **Wait for results** and review the implementation
5. **Request refinements** if needed

---

## For More Information

- See individual agent files in `.github/agents/`
- Check project documentation in root directory
- Review memory files in `/memories/repo/`

**Happy coding!** 🚀
