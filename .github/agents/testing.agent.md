# .github/agents/testing-agent.yml
name: Testing Agent
description: Creates comprehensive tests for the Money-Lender-App codebase.
version: 1.0.0
author: NikCoding

# What this agent does
responsibilities:
  - Write unit tests for services
  - Write component tests
  - Write integration tests
  - Create test fixtures and mocks
  - Ensure high code coverage
  - Test error scenarios
  - Document test strategies

# When to use (triggers)
triggers:
  - label: "tests"
  - label: "unit-tests"
  - label: "integration-tests"
  - label: "test-coverage"
  - comment: "/test"

# When NOT to use
exclude_triggers:
  - label: "feature"
  - label: "bug"
  - label: "refactor"
  - label: "review"

# Capabilities & tools
capabilities:
  - unit_test_creation
  - component_testing
  - mock_and_fixture_creation
  - test_organization_and_structure
  - coverage_analysis
  - edge_case_testing
  - integration_test_design

# Memory files the agent can read
memory_files:
  - /memories/repo/project-overview.md
  - /memories/repo/coding-standards.md
  - /memories/repo/feature-guidelines.md

# Test categories
test_categories:
  - Unit Tests
  - Integration Tests
  - E2E Tests
  - Edge Cases
  - Accessibility
  - Responsive

# Success criteria
success_criteria:
  - Tests are comprehensive
  - High code coverage (>80%)
  - All edge cases covered
  - Tests follow conventions
  - Mocks properly isolated
  - Documentation included

# Example invocation for users
example_invocation: |
  runSubagent(
    description: "Create tests for UserDetails page",
    prompt: "Write comprehensive tests for UserDetails.tsx including:
             - Loading and error states
             - Payment form submission
             - Dark mode rendering
             - Mobile responsiveness
             - Auth guard verification"
  )