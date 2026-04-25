# UserStory Agent - Complete Project Scope

## 🎯 Agent Name
**UserStory Agent** - Autonomous agent for creating and implementing new functionality in the Money-Lender-App project.

## 📋 Agent Purpose
The UserStory Agent is designed to:
- Understand complete project context and architecture
- Implement new features from user stories
- Maintain code consistency and standards
- Handle full feature development lifecycle (design → implementation → integration)
- Create features that follow established patterns and conventions

## 🔍 What's Available for the Agent

### Memory Files Created (Repository Scope)
All memory files are stored in `/memories/repo/` and provide complete project context:

1. **project-overview.md** ✓
   - Project purpose and business domain
   - Complete project structure
   - Core domain models (User, Payment, Auth)
   - Current features list
   - Storage/data access strategy

2. **architecture-patterns.md** ✓
   - Service layer architecture (factory pattern)
   - React component architecture
   - Key design patterns used
   - API integration approach
   - State management structure
   - File organization conventions
   - Notification system design

3. **tech-stack.md** ✓
   - Complete frontend stack and versions
   - Mobile support (Capacitor/Android)
   - Development tools and build configuration
   - Dev workflow and commands
   - Environment configuration details

4. **coding-standards.md** ✓
   - TypeScript strict mode standards
   - Component structure patterns
   - Context pattern implementation
   - Service implementation patterns
   - Error handling conventions
   - Styling rules and responsive design
   - File naming conventions
   - Import/export best practices

5. **feature-guidelines.md** ✓
   - Complete feature development checklist
   - Design phase guidelines
   - Type definition process
   - Service layer integration
   - Context/state management
   - Page/component development
   - Routing setup
   - Styling approach
   - Data flow patterns
   - Testing guidelines

6. **api-contract.md** ✓
   - Complete API endpoint specifications
   - Authentication endpoints
   - User management endpoints
   - Payment endpoints
   - Statistics endpoints
   - Notification endpoints
   - Error response format
   - Authentication headers
   - Vite dev proxy configuration

7. **quick-reference.md** ✓
   - Project commands (dev, build, preview)
   - Environment setup
   - Key files to modify for different tasks
   - TypeScript compilation info
   - Debugging tips

## 💻 How to Use the UserStory Agent

### Invocation Command
```
runSubagent(
  agentName: "Explore",  // Or your custom agent if created
  description: "Create new feature",
  prompt: [Your feature requirements and user story]
)
```

### What to Provide the Agent
When asking the agent to implement a feature, include:

1. **User Story/Requirements**
   - Feature description
   - User benefits
   - Acceptance criteria

2. **Technical Details**
   - New data models needed (if any)
   - UI/UX requirements
   - Integration points

3. **Context Reference**
   - Ask agent to review `/memories/repo/` files
   - Point to similar existing features to use as templates

### Example Usage
```
"Create a new feature for loan refinancing. 
- Users should be able to refinance existing loans
- Should recalculate interest
- Should send SMS notification
- Should integrate with User model
- Reference UserDetails.tsx for payment patterns"
```

## 🏗️ Project Context Summary

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with dark mode
- **Routing**: React Router v6
- **State**: React Context API
- **HTTP**: Axios
- **Mobile**: Capacitor (Android)

### Key Architectural Decisions
1. **Service Layer**: Factory pattern abstracts LocalStorage vs API
2. **Type Safety**: Strict TypeScript throughout
3. **Component Architecture**: Functional components with hooks
4. **State Management**: Minimal - Context API for global state
5. **Styling**: Utility-first Tailwind, no CSS files
6. **Error Handling**: Toast notifications for user feedback

### Core Domain
- **Users (Borrowers)**: Loans, interest rates, payment tracking
- **Payments**: Record and manage loan repayments
- **Interest**: Daily/weekly/monthly/yearly calculation
- **Notifications**: Email, WhatsApp, SMS integration
- **Reminders**: Automated reminder scheduling

### Feature Flags/Configuration
- Storage type: Environment variable `VITE_STORAGE_TYPE`
- Development uses LocalStorage
- Production connects to API backend on port 5000
- Frontend runs on port 5173

## 📁 Key Directories for Agent Reference

| Directory | Purpose | When to Modify |
|-----------|---------|-------------------|
| `src/types/` | TypeScript interfaces | Adding new data models |
| `src/services/` | Business logic & data access | New feature logic |
| `src/pages/` | Full page components | New user-facing features |
| `src/components/` | Reusable UI components | Shared UI elements |
| `src/contexts/` | Global state providers | App-wide state needed |
| `src/` | App root, routing, themes | Main app setup only |

## ✅ Agent Capabilities

The agent with this context can:
- ✅ Create new pages with proper routing
- ✅ Add new data types and models
- ✅ Implement service methods in both LocalStorage and API layers
- ✅ Create reusable components
- ✅ Add context providers for state management
- ✅ Integrate notifications (Email, WhatsApp, SMS)
- ✅ Create forms with validation and error handling
- ✅ Implement dark mode support
- ✅ Handle authentication and authorization
- ✅ Create responsive, mobile-friendly UI
- ✅ Follow all established patterns and conventions
- ✅ Write TypeScript with strict type safety

## 🔐 Constraints & Best Practices

1. **Always implement both**:
   - LocalStorageService version (dev/offline)
   - ApiService version (production)

2. **Follow patterns**:
   - Use factory pattern for services
   - Use provider pattern for context
   - Use custom hooks for context consumption
   - Use private routes for authenticated features

3. **Maintain standards**:
   - Strict TypeScript (no `any` types)
   - Tailwind only for styling (no CSS files)
   - Handle all errors with try-catch and toast notifications
   - Support dark mode on all components

4. **Test checklist**:
   - Compile without errors (tsc)
   - Test with LocalStorage
   - Test with API backend
   - Test dark mode
   - Test responsive design

## 🚀 Getting Started with the Agent

### To Create a New Feature:

1. **Prepare Your Request**
   - Write a clear user story
   - List acceptance criteria
   - Identify data model changes
   - Reference similar existing features

2. **Invoke the Agent**
   ```
   runSubagent(
     prompt: "Implement [feature] based on user story: [description]. 
              Reference feature-guidelines.md and coding-standards.md from memory.
              Similar features: [point to examples]",
     description: "[Short feature description]"
   )
   ```

3. **Agent Actions**
   - Reviews all memory files for context
   - Creates/modifies necessary files
   - Implements service methods in both storage layers
   - Creates UI components with Tailwind
   - Handles routing and authentication
   - Ensures TypeScript strict mode compliance
   - Tests implementation

4. **Agent Deliverables**
   - ✅ New or modified source files
   - ✅ Type definitions
   - ✅ Service implementations
   - ✅ UI components
   - ✅ Integration points documented
   - ✅ Verification that it follows patterns

## 📊 Success Criteria

The UserStory Agent successfully completes a feature when:
- [ ] All TypeScript files compile without errors
- [ ] Feature implements all acceptance criteria
- [ ] Code follows established patterns (Factory, Provider, etc.)
- [ ] All new data types defined in types/
- [ ] Service methods exist in IDataService interface
- [ ] Both LocalStorage and API implementations created
- [ ] Components use Tailwind CSS only
- [ ] Dark mode fully supported
- [ ] Responsive design implemented
- [ ] Error handling with toast notifications
- [ ] Proper routing and auth guards applied
- [ ] Related memory files can be referenced

## 🔗 Related Documentation

All documentation is stored in `/memories/repo/`:
- For project structure: See `project-overview.md`
- For patterns: See `architecture-patterns.md`
- For tech details: See `tech-stack.md`
- For code style: See `coding-standards.md`
- For implementation: See `feature-guidelines.md`
- For API: See `api-contract.md`
- For quick lookup: See `quick-reference.md`
