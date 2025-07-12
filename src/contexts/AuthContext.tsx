// DEPRECATED: This file will be removed once all components are migrated
// All new components should import directly from EnhancedAuthContext
// FIXME: Remove this file after verifying all imports are updated

export {
  AuthProvider,
  useAuth,
  EnhancedAuthProvider,
  useEnhancedAuth
} from './EnhancedAuthContext';

export type {
  EnhancedProfile as Profile
} from './EnhancedAuthContext';