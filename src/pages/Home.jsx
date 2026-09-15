import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, User, Briefcase, ShieldCheck, CheckCircle2, ChevronDown, FileCheck, Check, Shield } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

export const Home = () => {
  return (
    <AppShell>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl flex items-center justify-center">
          {/* Glowing Radial Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.18),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(147,51,234,0.22),transparent_50%)] pointer-events-none" />
          <div className="absolute -right-40 -top-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-40 -bottom-40 w-96 h-96 rounded-full bg-purple-700/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-purple-200 text-xs font-semibold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse-slow"></span>
                <span>Bridge the Gap Between Talent & Careers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Connect Skills to <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-300 to-purple-100">Real-World</span> Opportunities
              </h1>

              <p className="text-purple-100/80 text-base sm:text-lg max-w-xl font-light leading-relaxed">
                SkillBridge empowers students to showcase verified competencies, enables employers to discover matched talent, and provides administrators seamless platform controls.
              </p>

              <div className="flex flex-wrap gap-4 pt-4 w-full">
                <Link to="/signup">
                  <Button
                    variant="custom"
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 shadow-lg font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-500/50"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Create Free Account
                  </Button>
                </Link>
                <a href="#portals">
                  <Button
                    variant="custom"
                    size="lg"
                    className="border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50 dark:border-purple-500/30 dark:text-purple-400 dark:hover:bg-purple-950/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-500/50"
                    rightIcon={<ChevronDown className="w-4 h-4" />}
                  >
                    Explore Portals
                  </Button>
                </a>
              </div>

              {/* Trust/Social Proof */}
              <div className="flex items-center gap-3 pt-6 border-t border-white/15 w-full">
                <div className="flex -space-x-2">
                  <span className="w-8 h-8 rounded-full bg-purple-600 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-md">S</span>
                  <span className="w-8 h-8 rounded-full bg-purple-500 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-md">M</span>
                  <span className="w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-md">R</span>
                  <span className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-md">K</span>
                </div>
                <p className="text-xs text-purple-200/70">
                  Built for <span className="text-white font-semibold">students</span>, <span className="text-white font-semibold">employers</span> and <span className="text-white font-semibold">administrators</span>
                </p>
              </div>
            </div>

            {/* Right Interactive Mockup Column */}
            <div className="lg:col-span-5 relative w-full flex items-center justify-center py-6 animate-fade-in-up [animation-delay:200ms]">
              {/* Circular Concentric Rings SVG */}
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
                <svg className="w-full h-full max-w-[420px] max-h-[420px]" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="45" stroke="rgba(129, 140, 248, 0.15)" strokeWidth="0.4" strokeDasharray="1 2" />
                  <circle cx="50" cy="50" r="35" stroke="rgba(129, 140, 248, 0.2)" strokeWidth="0.4" />
                  <circle cx="50" cy="50" r="25" stroke="rgba(129, 140, 248, 0.25)" strokeWidth="0.4" strokeDasharray="2 2" />
                  <circle cx="50" cy="50" r="15" stroke="rgba(129, 140, 248, 0.3)" strokeWidth="0.4" />
                </svg>
              </div>

              {/* Main Profile Mockup Card */}
              <div className="relative z-10 w-full max-w-[390px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 transition-all duration-500 hover:shadow-purple-500/10 hover:border-purple-100 text-slate-800">
                {/* Header info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">Your Skill Profile</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-none">Build proof. Get discovered.</p>
                  </div>
                </div>

                {/* Profile Strength Slider */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">Profile strength</span>
                    <span className="text-purple-600">86% complete</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[86%] h-full bg-purple-600 rounded-full transition-all duration-500" />
                  </div>
                </div>

                {/* Verified Competencies */}
                <div className="mt-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Verified competencies</h4>
                    <span className="text-xs font-semibold text-purple-600 hover:underline cursor-pointer">View portfolio</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {/* Competency 1 */}
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                      <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-purple-700 flex items-center justify-center text-xs font-bold">
                        UX
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">Product Design</p>
                        <p className="text-[10px] text-slate-500 leading-tight">Advanced • Verified</p>
                      </div>
                    </div>

                    {/* Competency 2 */}
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                      <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-purple-700 flex items-center justify-center text-xs font-bold">
                        FE
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">Frontend Skills</p>
                        <p className="text-[10px] text-slate-500 leading-tight">Advanced • Verified</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dark Banner: Opportunity Matched */}
                <div className="mt-6 bg-slate-950 text-white rounded-2xl p-4 flex justify-between items-center shadow-lg border border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">Opportunity matched</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Product Designer • Full time</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">94% match</span>
                </div>
              </div>

              {/* Floating Badge 1 (Application tracked) - Top Right */}
              <div className="absolute -top-2 -right-4 z-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/90 p-4 max-w-[210px] flex items-center gap-3 animate-float-gentle">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-inner shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 leading-none">Application tracked</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">Status updated in real time</p>
                </div>
              </div>

              {/* Floating Badge 2 (Skill verified) - Bottom Left */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/90 p-4 max-w-[210px] flex items-center gap-3 animate-float-offset">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 leading-none">Skill verified</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">Credential added to portfolio</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portals Quick Access Grid */}
        <section id="portals" className="space-y-8 pt-4 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="lg:col-span-7 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                One Platform. Three Experiences.
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explore Platform Portals
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Select a portal scaffold to view dedicated role views. Each experience is designed around the tools and outcomes that matter most.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="relative group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 dark:hover:border-purple-950 border-t-4 border-t-transparent hover:border-t-purple-600 dark:hover:border-t-purple-500 flex flex-col justify-between h-full">
              <div className="p-8 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-purple-600/20">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Student Portal</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Build portfolio, match skills, apply for jobs</p>
              </div>

              <div className="p-8 pt-0 space-y-6">
                <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-medium">Verified Skill Badges</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-650 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-medium">Real-time Application Tracker</span>
                  </div>
                </div>

                <Link to="/student-dashboard" className="w-full block">
                  <button className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold py-3.5 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                    <span>Launch Student View</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Employer Card */}
            <div className="relative group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 dark:hover:border-purple-950 border-t-4 border-t-transparent hover:border-t-purple-600 dark:hover:border-t-purple-500 flex flex-col justify-between h-full">
              <div className="p-8 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-purple-600/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Employer Portal</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Post roles, evaluate candidates, hire talent</p>
              </div>

              <div className="p-8 pt-0 space-y-6">
                <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-655 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-medium">AI Skill Matching Engine</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-655 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-medium">Direct Candidate Outreach</span>
                  </div>
                </div>

                <Link to="/employer-dashboard" className="w-full block">
                  <button className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold py-3.5 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                    <span>Launch Employer View</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Admin Card */}
            <div className="relative group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 dark:hover:border-purple-950 border-t-4 border-t-transparent hover:border-t-purple-600 dark:hover:border-t-purple-500 flex flex-col justify-between h-full">
              <div className="p-8 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-purple-600/20">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Portal</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Manage users, verify skills, platform analytics</p>
              </div>

              <div className="p-8 pt-0 space-y-6">
                <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-650 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-medium">Platform Governance</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-655 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-medium">User Verification Pipeline</span>
                  </div>
                </div>

                <Link to="/admin-dashboard" className="w-full block">
                  <button className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold py-3.5 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                    <span>Launch Admin View</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>


      </div>
    </AppShell>
  );
};

export default Home;
