# ⚡ Performance Agent

## Overview
The Performance Agent optimizes application performance, bundle size, and runtime efficiency.

## Responsibilities
- Analyze performance bottlenecks
- Optimize bundle size
- Improve load times
- Reduce memory usage
- Cache optimization
- Query optimization
- Component rendering optimization

## When to Use This Agent
✅ Optimizing bundle size
✅ Improving load performance
✅ Reducing memory usage
✅ Optimizing API calls
✅ Improving component rendering
✅ Cache strategy implementation
✅ Network request optimization

## When NOT to Use
❌ Creating new features (use UserStory Agent)
❌ Fixing bugs (use BugFix Agent)
❌ Refactoring code (use Refactor Agent)
❌ Writing tests (use Testing Agent)

## Capabilities
- Performance profiling
- Bundle analysis
- Load time optimization
- Memory optimization
- Caching strategies
- React rendering optimization
- API call optimization
- Asset optimization

## Example Invocation
```
runSubagent(
  description: "Optimize Dashboard page performance",
  prompt: "Analyze and optimize Dashboard.tsx performance:
           - Profile component rendering
           - Identify unnecessary re-renders
           - Optimize API calls
           - Implement proper memoization
           - Reduce bundle size impact"
)
```

## Key Memory Files
- `/memories/repo/architecture-patterns.md`
- `/memories/repo/tech-stack.md`
- `/memories/repo/quick-reference.md`

## Performance Optimization Areas
1. **Bundle Size** - Code splitting, tree shaking
2. **Load Time** - Asset optimization, lazy loading
3. **Runtime** - Memoization, useCallback, useMemo
4. **Memory** - Proper cleanup, avoiding leaks
5. **Rendering** - Virtual lists, pagination
6. **Caching** - HTTP caching, localStorage
7. **Network** - Request batching, compression

## Success Criteria
- ✅ Performance metrics improved
- ✅ Bundle size reduced
- ✅ Load times faster
- ✅ Memory usage optimized
- ✅ Functionality preserved
- ✅ Improvements documented
