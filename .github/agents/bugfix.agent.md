# .github/agents/bugfix-agent.yml
name: BugFix Agent
description: Identifies, analyzes, and fixes bugs in the Money-Lender-App codebase.
version: 1.0.0
author: NikCoding

# What this agent does
responsibilities:
  - Identify root causes of bugs
  - Fix type errors and runtime issues
  - Ensure fixes don't break existing functionality
  - Write comprehensive bug fix explanations
  - Verify fixes with proper testing

# When to use (triggers)
triggers:
  - label: "bug"
  - label: "type-error"
  - label: "runtime-error"
  - label: "ui-issue"
  - label: "auth-issue"
  - label: "state-issue"
  - comment: "/fix-bug"

# When NOT to use
exclude_triggers:
  - label: "feature"
  - label: "refactor"
  - label: "tests"
  - label: "review"

# Capabilities & tools
capabilities:
  - error_analysis
  - root_cause_investigation
  - code_debugging
  - cross_file_dependency_check
  - service_layer_debugging
  - typescript_error_resolution
  - react_component_debugging
  - state_management_debugging

# Memory files the agent can read
memory_files:
  - /memories/repo/architecture-patterns.md
  - /memories/repo/coding-standards.md
  - /memories/repo/api-contract.md

# Investigation workflow
investigation_steps:
  - Gather error logs and stack traces
  - Identify file and line numbers
  - Check for type mismatches
  - Verify imports and exports
  - Check context providers and wrapping
  - Test fix in both storage modes (LocalStorage + API)

# Success criteria
success_criteria:
  - Error is resolved
  - No new errors introduced
  - Existing tests still pass
  - Root cause documented
  - Fix follows established patterns

# Example invocation for users
example_invocation: |
  runSubagent(
    description: "Fix authentication context error",
    prompt: "Fix the error in AuthContext where useAuth hook throws 
             'must be used within provider' even though wrapped. 
             Error occurs on Login page. Include error logs: [paste logs]"
  )