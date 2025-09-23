import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [resetForm, setResetForm] = useState({ email: "", new_password: "" });
  const [showResetForm, setShowResetForm] = useState(false);
  
  const { login, register, resetPassword, isLoggingIn, isRegistering, isResettingPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      const result = await login(loginForm);
      if (result?.status === "success") {
        navigate("/dashboard");
      }
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (registerForm.name.trim().length < 3) {
      toast.error("Name must be at least 3 characters");
      return;
    }
    
    if (registerForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      const result = await register(registerForm);
      if (result?.status === "success") {
        navigate("/dashboard");
      }
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetForm.email || !resetForm.new_password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (resetForm.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      const result = await resetPassword(resetForm);
      if (result?.status === "success") {
        setShowResetForm(false);
        setResetForm({ email: "", new_password: "" });
      }
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Campus Admin</h1>
          <p className="text-muted-foreground">Manage your campus with AI-powered tools</p>
        </div>

        {showResetForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your email and new password to reset your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={resetForm.email}
                    onChange={(e) => setResetForm(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={resetForm.new_password}
                    onChange={(e) => setResetForm(prev => ({ ...prev, new_password: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? "Resetting..." : "Reset Password"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowResetForm(false)}
                >
                  Back to Login
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to your campus admin account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowResetForm(true)}
                        className="text-sm text-muted-foreground hover:text-foreground underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create account</CardTitle>
                  <CardDescription>
                    Sign up for a new campus admin account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Full name"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password (min. 6 characters)"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isRegistering}
                    >
                      {isRegistering ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;








