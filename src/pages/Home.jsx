import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, UserCheck, Briefcase, ShieldCheck, CheckCircle2, BellRing } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { useToast } from '../context/ToastContext';

export const Home = () => {
  const { addToast } = useToast();

  return (
    <AppShell>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Bridge the Gap Between Talent & Careers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Connect Skills to Real-World Opportunities
            </h1>

            <p className="text-indigo-100/90 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
              SkillBridge empowers students to showcase verified competencies, enables employers to discover matched talent, and provides administrators seamless platform controls.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg font-semibold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Create Free Account
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10 border border-white/20"
                onClick={() => {
                  addToast({
                    title: 'Welcome to SkillBridge!',
                    message: 'Explore the design system and portal dashboards below.',
                    type: 'success',
                  });
                }}
                leftIcon={<BellRing className="w-4 h-4 text-amber-300" />}
              >
                Test Toast Notification
              </Button>
            </div>
          </div>
        </section>

        {/* Portals Quick Access Grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Explore Platform Portals</h2>
              <p className="text-sm text-slate-500">Select a portal scaffold to view dedicated role views.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="bg-indigo-50/50">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
                  <UserCheck className="w-5 h-5" />
                </div>
                <CardTitle>Student Portal</CardTitle>
                <CardDescription>Build portfolio, match skills, apply for jobs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified Skill Badges
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time Application Tracker
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/student-dashboard" className="w-full">
                  <Button variant="outline" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Launch Student View
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Employer Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="bg-blue-50/50">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3">
                  <Briefcase className="w-5 h-5" />
                </div>
                <CardTitle>Employer Portal</CardTitle>
                <CardDescription>Post roles, evaluate candidates, hire talent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Skill Matching Engine
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Direct Candidate Outreach
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/employer-dashboard" className="w-full">
                  <Button variant="outline" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Launch Employer View
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Admin Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-100/50">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CardTitle>Admin Portal</CardTitle>
                <CardDescription>Manage users, verify skills, platform analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Platform Governance
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> User Verification Pipeline
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/admin-dashboard" className="w-full">
                  <Button variant="outline" className="w-full justify-between" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Launch Admin View
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>


      </div>
    </AppShell>
  );
};

export default Home;
