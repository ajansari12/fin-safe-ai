# Console Logging Migration Patterns

## Search & Replace Patterns

### Phase 1: Critical Error Logging
Replace `console.error` statements with structured error logging:

```bash
# Pattern 1: Simple console.error
Find: console.error\('([^']+)',\s*([^)]+)\);
Replace: logger.error('$1', { metadata: $2 });

# Pattern 2: Console.error with try-catch
Find: console.error\('([^']+)',\s*([^)]+)\);
Replace: logger.error('$1', { component: 'COMPONENT_NAME' }, $2);
```

### Phase 2: Debug Logging Cleanup
Remove or replace development debug statements:

```bash
# Pattern 1: Navigation debug logs (REMOVE)
Find: console.log\('🧭[^']+',\s*\{[^}]+\}\);
Replace: // TODO: REMOVED - Excessive navigation debug logging

# Pattern 2: Auth context debug logs (REMOVE)
Find: console.log\('🔐[^']+',\s*\{[^}]+\}\);
Replace: // TODO: REMOVED - Auth debug logging
```

### Phase 3: Warning Consolidation
```bash
# Pattern: Console.warn to logger.warn
Find: console.warn\('([^']+)'\);
Replace: logger.warn('$1', { component: 'COMPONENT_NAME' });
```

## File Categories for Migration

### High Priority (Week 1)
- `src/contexts/EnhancedAuthContext.tsx` - 40+ debug logs
- `src/components/navigation/RoleAwareNavigation.tsx` - 20+ debug logs
- `src/components/auth/EnhancedProtectedRoute.tsx` - Auth validation logs

### Medium Priority (Week 2)
- Service layer files with error handling
- API integration components
- Performance monitoring components

### Low Priority (Week 3)
- Component development debug logs
- Temporary troubleshooting statements
- Success logging statements

## Implementation Strategy
1. **Start with error logging** - Replace console.error with logger.error
2. **Add TODO comments** for guidance
3. **Remove debug noise** - Development-only console.log statements
4. **Consolidate warnings** - Use structured logger.warn
5. **Test incrementally** - Verify logging works before removing console statements