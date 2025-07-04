import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

type AuthMode = 'login' | 'register' | 'forgot-password' | 'verify' | 'update-password';

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  
  const { login, register, resetPassword, updatePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine auth mode from URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('register')) {
      setMode('register');
    } else if (path.includes('forgot-password')) {
      setMode('forgot-password');
    } else if (path.includes('verify')) {
      setMode('verify');
    } else if (path.includes('update-password')) {
      setMode('update-password');
    } else {
      setMode('login');
    }
  }, [location.pathname]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && mode !== 'update-password') {
      navigate("/app/dashboard");
    }
  }, [isAuthenticated, navigate, mode]);

  // Handle password update on mount if coming from email link
  useEffect(() => {
    if (mode === 'update-password') {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        // Session is handled automatically by Supabase
        toast.info("Please enter your new password");
      }
    }
  }, [mode, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && mode !== 'update-password') {
      toast.error("Email is required");
      return;
    }
    
    if (!password && mode !== 'forgot-password' && mode !== 'verify') {
      toast.error("Password is required");
      return;
    }

    if (mode === 'register') {
      if (!fullName) {
        toast.error("Full name is required");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
    }

    if (mode === 'update-password') {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      switch (mode) {
        case 'login':
          await login(email, password);
          break;
        case 'register':
          await register(email, password, fullName);
          break;
        case 'forgot-password':
          await resetPassword(email);
          break;
        case 'update-password':
          await updatePassword(password);
          break;
      }
    } catch (error) {
      console.error("Auth error:", error);
      // Toast is handled in the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to your account';
      case 'register': return 'Create your account';
      case 'forgot-password': return 'Reset your password';
      case 'verify': return 'Check your email';
      case 'update-password': return 'Update your password';
      default: return 'Authentication';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login': return 'Enter your credentials to access the platform';
      case 'register': return 'Join ResilientFI to start managing operational resilience';
      case 'forgot-password': return 'Enter your email to receive a password reset link';
      case 'verify': return 'We sent you a verification email. Please check your inbox and click the link to verify your account.';
      case 'update-password': return 'Enter your new password below';
      default: return '';
    }
  };

  if (mode === 'verify') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold">ResilientFI</span>
            </Link>
          </div>
          
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
              <CardDescription>{getDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Didn't receive the email? Check your spam folder or{" "}
                  <button 
                    onClick={() => setMode('register')} 
                    className="text-primary hover:underline"
                  >
                    try registering again
                  </button>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link to="/auth/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center">
            <Shield className="h-8 w-8 text-primary" />
            <span className="ml-2 text-2xl font-bold">ResilientFI</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">{getTitle()}</CardTitle>
            <CardDescription className="text-center">
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode !== 'update-password' && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={mode !== 'update-password'}
                  />
                </div>
              )}
              
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              {mode !== 'forgot-password' && mode !== 'verify' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">
                      {mode === 'update-password' ? 'New password' : 'Password'}
                    </Label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {(mode === 'register' || mode === 'update-password') && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Processing..." : 
                  mode === 'login' ? "Sign in" :
                  mode === 'register' ? "Create account" :
                  mode === 'forgot-password' ? "Send reset email" :
                  "Update password"
                }
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            {mode === 'login' && (
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button 
                  onClick={() => setMode('register')}
                  className="text-primary hover:underline"
                >
                  Create one now
                </button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button 
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'forgot-password' && (
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <button 
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline"
                >
                  Back to login
                </button>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;