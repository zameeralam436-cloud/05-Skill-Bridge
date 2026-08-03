import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Compass } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardPath = (role) => {
    if (role === 'student') return '/student-dashboard';
    if (role === 'employer') return '/employer-dashboard';
    if (role === 'admin') return '/admin-dashboard';
    return '/student-dashboard';
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const profile = await login(email, password);
      const targetRole = profile?.role || 'student';

      addToast({
        title: 'Logged In Successfully',
        message: `Welcome back, ${profile?.name || 'User'}!`,
        type: 'success',
      });

      navigate(getDashboardPath(targetRole), { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Invalid email or password. Please try again.';

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email address or password.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please reset your password or try again later.';
      }

      addToast({
        title: 'Authentication Error',
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto py-6 sm:py-12">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center bg-gradient-to-b from-slate-50 to-white pb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Welcome Back</CardTitle>
            <CardDescription>Log in to access your SkillBridge dashboard</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                size="lg"
                isLoading={isLoading}
                rightIcon={<LogIn className="w-4 h-4" />}
              >
                Log In
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center bg-slate-50 text-xs text-slate-500 gap-1">
            <span>Don't have an account?</span>
            <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
              Sign up here
            </Link>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
};

export default Login;
