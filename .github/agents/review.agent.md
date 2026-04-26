# .github/agents/review-agent.yml
name: Review Agent
description: Conducts thorough code reviews for quality assurance and standards compliance.
version: 1.0.0
author: NikCoding

# What this agent does
responsibilities:
  - Review code for quality
  - Verify pattern adherence
  - Check TypeScript compliance
  - Validate error handling
  - Review performance implications
  - Verify security practices
  - Provide improvement suggestions

# When to use (triggers)
triggers:
  - label: "review"
  - label: "code-review"
  - label: "quality-check"
  - comment: "/review"

# When NOT to use
exclude_triggers:
  - label: "feature"
  - label: "bug"
  - label: "refactor"
  - label: "tests"

# Capabilities & tools
capabilities:
  - code_quality_assessment
  - pattern_compliance_checking
  - typescript_strict_mode_verification
  - performance_analysis
  - security_best_practices_review
  - error_handling_verification
  - documentation_quality_check

# Memory files the agent can read
memory_files:
  - /memories/repo/architecture-patterns.md
  - /memories/repo/coding-standards.md
  - /memories/repo/feature-guidelines.md

# Review checklist
review_checklist:
  - TypeScript strict mode compliance
  - Proper error handling
  - Pattern adherence (Factory, Provider, etc.)
  - Security considerations
  - Performance implications
  - Test coverage
  - Documentation completeness
  - Accessibility compliance
  - Mobile responsiveness
  - Dark mode support

# Success criteria
success_criteria:
  - Review is thorough
  - Issues are documented
  - Suggestions are actionable
  - Examples provided
  - Standards verified
  - No critical issues missed

# Example invocation for users
example_invocation: |
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