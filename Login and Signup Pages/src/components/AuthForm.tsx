import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Cog, Settings, ArrowLeft } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";

export function AuthForm() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(loginEmail)) {
      toast.error("Invalid email address", {
        description: "Please enter a valid email address.",
      });
      return;
    }
    
    // Handle login logic here
    console.log("Login:", { loginEmail, loginPassword });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(signupEmail)) {
      toast.error("Invalid email address", {
        description: "Please enter a valid email address.",
      });
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure your passwords match.",
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password too short", {
        description: "Password must be at least 6 characters long.",
      });
      return;
    }
    
    // Handle signup logic here
    console.log("Signup:", { signupName, signupEmail, signupPassword });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(resetEmail)) {
      toast.error("Invalid email address", {
        description: "Please enter a valid email address.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error("Error sending reset email", {
          description: error.message,
        });
      } else {
        toast.success("Reset email sent!", {
          description: "Check your email for a password reset link.",
        });
        setResetEmail("");
        setShowForgotPassword(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header with steampunk branding - Always visible */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative">
          {/* Main gear */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary border-2 border-primary shadow-[0_0_20px_rgba(139,90,60,0.4)]">
            <Cog className="w-9 h-9 text-primary-foreground animate-spin [animation-duration:20s]" />
          </div>
          {/* Small accent gear */}
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-accent border border-primary">
            <Settings className="w-3 h-3 text-accent-foreground animate-spin [animation-duration:15s] [animation-direction:reverse]" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent pb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
            COGNIFY
          </h1>
        </div>
      </div>

      {/* Decorative top border */}
      <div className="relative mb-6">
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-background">
          <div className="w-2 h-2 bg-primary rotate-45 border border-primary" />
        </div>
      </div>

      {/* Tabs - Only visible on login/signup pages */}
      {!showForgotPassword && (
        <div className="grid w-full grid-cols-2 bg-muted border border-border rounded-md p-1 mb-4">
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setActiveTab("login");
            }}
            className={`py-2 px-4 rounded-sm transition-colors ${
              !showForgotPassword && activeTab === "login"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted-foreground/10"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setActiveTab("signup");
            }}
            className={`py-2 px-4 rounded-sm transition-colors ${
              !showForgotPassword && activeTab === "signup"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted-foreground/10"
            }`}
          >
            Sign Up
          </button>
        </div>
      )}

      {showForgotPassword ? (
        <Card className="border-2 border-border shadow-[0_0_30px_rgba(139,90,60,0.15)] bg-card/80 backdrop-blur-sm relative overflow-hidden">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary" />
          
          <CardHeader>
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="flex items-center gap-2 text-accent hover:text-primary transition-colors mb-2 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
            <CardTitle className="text-primary">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleForgotPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-foreground">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="border-border bg-input-background focus:border-primary focus:ring-primary"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {/* Informational section to match height */}
              <div className="space-y-3 pt-4 border-t border-border/50 mb-4">
                <p className="text-sm text-muted-foreground">
                  <span className="text-accent">•</span> You'll receive an email with a secure link
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-accent">•</span> The link will expire in 24 hours
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-accent">•</span> Check your spam folder if you don't see it
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:shadow-[0_0_20px_rgba(139,90,60,0.5)] transition-shadow border border-primary/50"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <>
          {activeTab === "login" && (
          <Card className="border-2 border-border shadow-[0_0_30px_rgba(139,90,60,0.15)] bg-card/80 backdrop-blur-sm relative overflow-hidden">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary" />
            
            <CardHeader className="relative">
              <CardTitle className="text-primary">Welcome back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="border-border bg-input-background focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="border-border bg-input-background focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-accent hover:text-primary transition-colors"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                
                {/* Welcome message section to match height */}
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Cog className="w-4 h-4 text-accent" />
                    <span>Secure authentication powered by Supabase</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:shadow-[0_0_20px_rgba(139,90,60,0.5)] transition-shadow border border-primary/50"
                >
                  Log In
                </Button>
              </CardFooter>
            </form>
          </Card>
          )}

          {activeTab === "signup" && (
          <Card className="border-2 border-border shadow-[0_0_30px_rgba(139,90,60,0.15)] bg-card/80 backdrop-blur-sm relative overflow-hidden">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary" />
            
            <CardHeader>
              <CardTitle className="text-primary">Create an account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Start your learning journey with Cognify
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-foreground">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="border-border bg-input-background focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="border-border bg-input-background focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="border-border bg-input-background focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="border-border bg-input-background focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap mb-4">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:shadow-[0_0_20px_rgba(139,90,60,0.5)] transition-shadow border border-primary/50"
                >
                  Create Account
                </Button>
              </CardFooter>
            </form>
          </Card>
          )}
        </>
      )}

      {/* Decorative bottom border */}
      <div className="relative mt-6">
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-background">
          <div className="w-2 h-2 bg-primary rotate-45 border border-primary" />
        </div>
      </div>
    </div>
  );
}