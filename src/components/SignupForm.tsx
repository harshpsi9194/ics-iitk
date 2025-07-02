import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon, ArrowLeft } from 'lucide-react';
import { signUpWithEmail } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    rollNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return false;
    }
    
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await signUpWithEmail(
        formData.email,
        formData.password,
        {
          username: formData.username,
          full_name: formData.fullName,
          roll_number: formData.rollNumber
        }
      );

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email to verify your account.');
        // Store username for potential auto-login after verification
        localStorage.setItem('pending_username', formData.username);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message.includes('already registered')) {
        toast.error('An account with this email already exists. Please sign in instead.');
      } else if (error.message.includes('Invalid email')) {
        toast.error('Please enter a valid email address');
      } else {
        toast.error(error.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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

        {/* Signup Form Section */}
        <div className="animate-slide-up">
          <Card className="w-full max-w-md mx-auto shadow-elegant border-primary/10">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="absolute left-4 top-4 text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                Create Account
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Join the ICS-IITK counselling portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username *
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g., harshps23"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required
                    className="h-11 border-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@iitk.ac.in"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-11 border-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                    className="h-11 border-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollNumber" className="text-sm font-medium">
                    Roll Number
                  </Label>
                  <Input
                    id="rollNumber"
                    type="text"
                    placeholder="e.g., 23111012"
                    value={formData.rollNumber}
                    onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                    className="h-11 border-primary/20 focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional - can be added later
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
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
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      className="h-11 pr-10 border-primary/20 focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
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
                  {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="text-primary hover:text-primary/80 font-medium underline"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;