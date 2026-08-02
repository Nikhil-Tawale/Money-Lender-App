# .github/agents/userstory-agent.yml
name: UserStory Agent
description: Creates and implements new features based on user stories and requirements.
version: 1.0.0
author: NikCoding

# What this agent does
responsibilities:
  - Design new features from user stories
  - Create new data models and types
  - Implement service methods in both LocalStorage and API layers
  - Build UI components with proper styling
  - Integrate new features with existing systems
  - Handle routing and authentication

# When to use (triggers)
triggers:
  - label: "feature"
  - label: "user-story"
  - label: "new-page"
  - label: "new-model"
  - comment: "/feature"

# When NOT to use
exclude_triggers:
  - label: "bug"
  - label: "refactor"
  - label: "tests"
  - label: "review"

# Capabilities & tools
capabilities:
  - full_stack_feature_development
  - type_safe_typescript_implementation
  - dual_service_implementations
  - tailwind_css_styling_with_dark_mode
  - react_context_state_management
  - form_handling_and_validation
  - error_handling_with_toast_notifications
  - responsive_mobile_design

# Memory files the agent can read
memory_files:
  - /.github/userStory-agent-guide.md

# Success criteria
success_criteria:
  - All TypeScript strict mode compliance
  - Both service implementations (LocalStorage + API)
  - UI components with Tailwind CSS
  - Dark mode support
  - Responsive design
  - Error handling
  - Proper routing and auth guards

# Example invocation for users
example_invocation: |
  runSubagent(
    agentName: "Explore",
    description: "Create new loan refinancing feature",
    prompt: "Implement a loan refinancing feature allowing users to 
             refinance existing loans. Should include UI form, 
             interest recalculation, and SMS notification. 
             Reference UserDetails.tsx for similar patterns."
  )