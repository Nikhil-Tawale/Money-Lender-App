# .github/agents/performance-agent.yml
name: Performance Agent
description: Optimizes application performance, bundle size, and runtime efficiency.
version: 1.0.0
author: NikCoding

# What this agent does
responsibilities:
  - Analyze performance bottlenecks
  - Optimize bundle size
  - Improve load times
  - Reduce memory usage
  - Cache optimization
  - Query optimization
  - Component rendering optimization

# When to use (triggers)
triggers:
  - label: "performance"
  - label: "bundle-size"
  - label: "load-time"
  - label: "memory-usage"
  - label: "rendering-optimization"
  - comment: "/perf"

# When NOT to use
exclude_triggers:
  - label: "feature"
  - label: "bug"
  - label: "refactor"
  - label: "tests"

# Capabilities & tools
capabilities:
  - performance_profiling
  - bundle_analysis
  - load_time_optimization
  - memory_optimization
  - caching_strategies
  - react_rendering_optimization
  - api_call_optimization
  - asset_optimization

# Memory files the agent can read
memory_files:
  - /memories/repo/architecture-patterns.md
  - /memories/repo/tech-stack.md
  - /memories/repo/quick-reference.md

# Performance optimization areas
optimization_areas:
  - Bundle Size
  - Load Time
  - Runtime
  - Memory
  - Rendering
  - Caching
  - Network

# Success criteria
success_criteria:
  - Performance metrics improved
  - Bundle size reduced
  - Load times faster
  - Memory usage optimized
  - Functionality preserved
  - Improvements documented

# Example invocation for users
example_invocation: |
  runSubagent(
    description: "Optimize Dashboard page performance",
    prompt: "Analyze and optimize Dashboard.tsx performance:
             - Profile component rendering
             - Identify unnecessary re-renders
             - Optimize API calls
             - Implement proper memoization
             - Reduce bundle size impact"
  )