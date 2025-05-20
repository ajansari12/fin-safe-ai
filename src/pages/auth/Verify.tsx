
import React from "react";
import { Link } from "react-router-dom";
import { Shield, Mail, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Verify = () => {
  const { user } = useAuth();

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
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center mt-4">Verify your email</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification email to{" "}
              <span className="font-medium">{user?.email || "your email address"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground">
              Click the link in the email to verify your account and continue setting up your organization.
            </p>
            <p className="text-sm text-muted-foreground">
              Didn't receive an email? Check your spam folder or{" "}
              <button className="text-primary hover:underline">
                resend verification email
              </button>
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild className="mt-2 flex items-center">
              <Link to="/dashboard">
                Continue to dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Verify;
