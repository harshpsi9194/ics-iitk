import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { signInWithEmail } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        throw error;
      }

      if (data.user) {
        // Store username for the dashboard (extract from email or use user data)
        const username = email.split('@')[0];
        localStorage.setItem('iitk_username', username);
        toast.success('Signed in successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please verify your email address before signing in.');
      } else {
        toast.error(error.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-accent/50 flex items-center justify-center p-4">
      {/* IITK Logo at top left */}
      <div className="absolute top-4 left-4">
        <img 
          src="/lovable-uploads/8bd4508c-98fa-4e45-8181-1250d9b74933.png" 
          alt="IIT Kanpur Logo" 
          className="w-16 h-16"
        />
      </div>
      
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-elegant">
            <img 
              src="/lovable-uploads/0a9a944d-5c61-4c22-94be-77bb60746497.png" 
              alt="ICS - IITK Logo" 
              className="w-64 h-auto mx-auto mb-4"
            />
            <p className="text-muted-foreground text-sm font-medium">
              Developed by Web Team, ICS-IITK
            </p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="animate-slide-up">
          <Card className="w-full max-w-md mx-auto shadow-elegant border-primary/10">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-primary">
                Login
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to access the counselling portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@iitk.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10 border-primary/20 focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="ics" 
                  size="lg" 
                  className="w-full h-12 text-base"
                  disabled={loading}
                >
                  {loading ? 'SIGNING IN...' : 'SIGN IN'}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Don't have an account?
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-12 text-base border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => navigate('/signup')}
                  >
                    Create New Account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;