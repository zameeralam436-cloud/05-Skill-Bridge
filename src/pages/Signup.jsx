import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserCheck, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();

  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const getDashboardPath = (targetRole) => {
    if (targetRole === 'student') return '/student-dashboard';
    if (targetRole === 'employer') return '/employer-dashboard';
    if (targetRole === 'admin') return '/admin-dashboard';
    return '/student-dashboard';
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!fullName.trim()) {
      setValidationError('Please enter your full name');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(email, password, fullName, role);
      addToast({
        title: 'Account Created!',
        message: `Welcome to SkillBridge, ${fullName}!`,
        type: 'success',
      });
      navigate(getDashboardPath(role), { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      let errorMessage = 'Failed to create account. Please try again.';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please provide a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }

      addToast({
        title: 'Signup Failed',
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto py-6 sm:py-10">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center bg-gradient-to-b from-slate-50 to-white pb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Join SkillBridge</CardTitle>
            <CardDescription>Select your account role and build your career bridge</CardDescription>

            {/* Role Toggle Selector */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  role === 'student'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">I'm a Student</div>
                  <div className="text-xs text-slate-500 font-normal">Build skills & find jobs</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  role === 'employer'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 text-indigo-950 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'employer' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">I'm an Employer</div>
                  <div className="text-xs text-slate-500 font-normal">Recruit verified talent</div>
                </div>
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="sarah@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Create Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                error={validationError}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign up as {role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center bg-slate-50 text-xs text-slate-500 gap-1">
            <span>Already have an account?</span>
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Log in here
            </Link>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
};

export default Signup;
