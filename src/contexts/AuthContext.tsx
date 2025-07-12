// TEMPORARY COMPATIBILITY LAYER
// This file re-exports everything from EnhancedAuthContext to maintain backward compatibility
// TODO: Update all imports to use EnhancedAuthContext directly

export {
  AuthProvider,
  useAuth,
  EnhancedAuthProvider,
  useEnhancedAuth
} from './EnhancedAuthContext';

export type {
  EnhancedProfile as Profile
} from './EnhancedAuthContext';