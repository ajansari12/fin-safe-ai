
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await login(email, password);
      
      if (error) {
        toast.error(error.message || "Login failed");
        return;
      }
      
      // Navigation will be handled by the useEffect above when user state changes
      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/auth/register" className="text-primary hover:underline">
                Create one now
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
