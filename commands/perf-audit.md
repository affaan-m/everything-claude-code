# Performance Audit

Analyze application performance across bundle, API, database, and frontend layers:

1. Bundle size analysis:
   - Run: npm run build (capture output sizes)
   - Check for large dependencies: npx @next/bundle-analyzer or npx vite-bundle-visualizer
   - Flag packages over 50KB gzipped
   - Identify tree-shaking opportunities

2. API endpoint profiling:
   - Measure response times for each endpoint
   - Identify endpoints over 200ms
   - Check for missing compression (gzip/brotli)
   - Verify proper Cache-Control headers

3. Database query analysis:
   - Detect N+1 query patterns in code
   - Check for missing indexes on frequently queried columns
   - Identify SELECT * usage (should select specific columns)
   - Verify connection pooling configuration

4. Frontend performance:
   - Check React components for missing memo/useMemo/useCallback
   - Identify unnecessary re-renders
   - Verify image optimization (next/image, WebP, lazy loading)
   - Check for layout shifts (dynamic content without dimensions)

5. Cache evaluation:
   - HTTP caching: stale-while-revalidate, ETag, max-age
   - CDN caching: static assets, ISR pages
   - Application caching: Redis, in-memory, React Query staleTime

6. Generate report with A-F grades:
   - A: Excellent (no action needed)
   - B: Good (minor optimizations)
   - C: Acceptable (should improve)
   - D: Poor (needs attention)
   - F: Critical (immediate action required)

   Include prioritized action items sorted by impact.

Focus on measurable improvements. Skip micro-optimizations.
