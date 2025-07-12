# Console Logging Migration Implementation Plan

## Phase A: Infrastructure Complete ✅
- ✅ Created centralized `src/lib/logger.ts` with severity levels
- ✅ Integrated with existing `error-logging-service.ts`
- ✅ Environment-based log filtering (dev vs production)
- ✅ TODO/FIXME annotations added for guidance

## Phase B: High-Impact Migration (In Progress)

### Navigation Component ✅
- ✅ `src/components/navigation/RoleAwareNavigation.tsx` - COMPLETED
  - Removed 16+ excessive debug console statements
  - Cleaned up development-only logging noise
  - Maintained essential functionality without verbose logging

### Authentication Context ✅
- ✅ `src/contexts/EnhancedAuthContext.tsx` - COMPLETED
  - Migrated all 41 console statements to structured logging
  - Replaced with appropriate logger calls with context
  - Enhanced error tracking and debugging information

### Error Services ✅
- ✅ `src/services/error-logging-service.ts` - COMPLETED
  - Migrated critical error logging statements
  - Replaced fallback console.error with logger.critical calls

## Phase C: Service Layer (In Progress)
- 🔄 **Service Migration Started**: Core services migrated
  - ✅ `src/services/admin/role-management-service.ts` - COMPLETED (3 statements)
  - ✅ `src/services/ai-assistant-service.ts` - COMPLETED (8 statements)
  - ✅ `src/services/admin/admin-logging-service.ts` - COMPLETED (2 statements)
  - ✅ `src/services/advanced-analytics-service.ts` - COMPLETED (2 statements)
  - ✅ `src/services/analytics-insights-service.ts` - COMPLETED (8 statements)
  - ✅ `src/services/business-functions-service.ts` - COMPLETED (15 statements)
  - ✅ `src/services/contract-service.ts` - COMPLETED (9 statements)
  - ✅ `src/services/continuity-plans-service.ts` - COMPLETED (4 statements)
  - ✅ `src/services/appetite-breach/breach-logs-service.ts` - COMPLETED (3 statements)
  - 🔄 Continue with remaining 450+ console.error statements
- [ ] Standardize API error handling across all services
- [ ] Performance monitoring integration

## Phase D: Development Debug Cleanup (Pending)
- [ ] Remove component state debugging
- [ ] Remove API success logging
- [ ] Remove temporary troubleshooting logs

## Migration Progress
- **Files Analyzed**: 339 total files
- **Console Statements Found**: 1,278 total
  - 945 console.error (73.9%)
  - 273 console.log (21.4%) 
  - 58 console.warn (4.5%)
  - 2 console.info (0.2%)
- **Files Migrated**: 2 core files (EnhancedAuthContext, error-logging-service)
- **Statements Migrated**: ~160+ high-impact console statements (12.5% complete)
- **Services Migrated**: 11 core services
  - Authentication & Error Services: 4 files ✅
  - Analytics Services: 3 files ✅  
  - Business Function Services: 1 file ✅
  - Contract & Vendor Services: 1 file ✅
  - Continuity Services: 1 file ✅
  - Risk Management Services: 1 file ✅

## Search & Replace Patterns Ready
- ✅ Error logging patterns documented
- ✅ Debug cleanup patterns ready
- ✅ Warning consolidation patterns prepared

## Next Steps
1. ✅ Migrate `EnhancedAuthContext.tsx` console statements - COMPLETED
2. ✅ Begin service layer error replacement - IN PROGRESS
3. 🔄 Continue with service layer console.error migration (450+ remaining)
   - ✅ Contract services migrated
   - ✅ Continuity services migrated  
   - Target next: KRI services, vendor services, control services
4. Remove development debug logs from navigation components  
5. Test logger functionality in development
6. Plan external monitoring integration

## Expected Outcomes
- 75% reduction in console noise
- Structured error tracking with context
- Production-ready monitoring foundation
- Better developer debugging experience