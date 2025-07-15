/**
 * Environment variable validation utility
 * Ensures required configuration is present at startup
 */

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validates and returns environment configuration
 * Throws error if required variables are missing
 */
export const validateEnvironment = (): EnvConfig => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const mode = import.meta.env.MODE;

  // Check for required variables
  const missingVars: string[] = [];
  
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('VITE_SUPABASE_URL must be a valid URL');
  }

  // Validate key format (basic check for JWT structure)
  if (!supabaseAnonKey.includes('.') || supabaseAnonKey.split('.').length !== 3) {
    throw new Error('VITE_SUPABASE_ANON_KEY appears to be invalid');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    isDevelopment: mode === 'development',
    isProduction: mode === 'production',
  };
};

/**
 * Log environment status (safe for production)
 */
export const logEnvironmentStatus = (): void => {
  const config = validateEnvironment();
  
  console.log('🔧 Environment Configuration:');
  console.log(`  Mode: ${config.isDevelopment ? 'Development' : 'Production'}`);
  console.log(`  Supabase URL: ${config.supabaseUrl}`);
  console.log(`  Supabase Key: ${config.supabaseAnonKey.substring(0, 20)}...`);
  
  if (config.isDevelopment) {
    console.log('⚠️  Development mode: Using fallback credentials if env vars missing');
  } else {
    console.log('🔒 Production mode: All credentials from environment variables');
  }
};