# .github/agents/documentation-agent.yml
name: Documentation Agent
description: Creates and maintains comprehensive project documentation.
version: 1.0.0
author: NikCoding

# What this agent does
responsibilities:
  - Create feature documentation
  - Update architecture documentation
  - Write API documentation
  - Create user guides
  - Maintain README files
  - Document code patterns
  - Create decision records (ADRs)

# When to use (triggers)
triggers:
  - label: "documentation"
  - label: "api-docs"
  - label: "user-guide"
  - label: "readme"
  - label: "adr"
  - comment: "/docs"

# When NOT to use
exclude_triggers:
  - label: "feature"
  - label: "bug"
  - label: "refactor"
  - label: "tests"

# Capabilities & tools
capabilities:
  - feature_documentation
  - api_documentation
  - architecture_documentation
  - setup_guide_creation
  - troubleshooting_guide_creation
  - decision_record_creation
  - code_example_documentation
  - markdown_formatting

# Memory files the agent can read
memory_files:
  - /memories/repo/project-overview.md
  - /memories/repo/api-contract.md
  - /memories/repo/architecture-patterns.md

# Documentation types we handle
documentation_types:
  - API Docs
  - Architecture Docs
  - Setup Guides
  - User Guides
  - Developer Guides
  - ADRs
  - Troubleshooting Guides

# Success criteria
success_criteria:
  - Documentation is comprehensive
  - Examples are accurate
  - Instructions are clear
  - Markdown formatting is clean
  - Links are correct
  - Code samples work

# Example invocation for users
example_invocation: |
  runSubagent(
    description: "Create API documentation",
    prompt: "Generate complete API documentation including:
             - All endpoints with examples
             - Request/response formats
             - Error codes and handling
             - Authentication details
             - Rate limiting info"
  )