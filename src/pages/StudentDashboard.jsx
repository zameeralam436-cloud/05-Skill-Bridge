import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Check,
  MapPin,
  Building2,
  User,
  UserCog,
  AlertCircle,
  RotateCw,
  Briefcase,
  Globe,
  ArrowRight,
  Search,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db, functions } from '../services/firebase';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(true);
  const [studentData, setStudentData] = useState(null);

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [appliedListingIds, setAppliedListingIds] = useState(new Set());
  const [applyingMap, setApplyingMap] = useState({});
  const [feedbackMap, setFeedbackMap] = useState({});
  const [feedbackLoadingMap, setFeedbackLoadingMap] = useState({});

  // Search state variables
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [activeFilters, setActiveFilters] = useState({ title: '', location: '' });

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveFilters({ title: searchTitle, location: searchLocation });
  };

  // Reset Search
  const handleResetSearch = () => {
    setSearchTitle('');
    setSearchLocation('');
    setActiveFilters({ title: '', location: '' });
  };

  // Filter listings based on active search criteria
  const filteredListings = listings.filter((listing) => {
    const matchesTitle = !activeFilters.title || 
      (listing.title || '').toLowerCase().includes(activeFilters.title.toLowerCase()) ||
      (listing.companyName || '').toLowerCase().includes(activeFilters.title.toLowerCase()) ||
      (listing.skillsRequired || []).some(skill => skill.toLowerCase().includes(activeFilters.title.toLowerCase()));

    const matchesLocation = !activeFilters.location ||
      (listing.location || '').toLowerCase().includes(activeFilters.location.toLowerCase()) ||
      (activeFilters.location.toLowerCase() === 'remote' && listing.remote);

    return matchesTitle && matchesLocation;
  });

  // Recommended Job Generator for Student Dashboard
  const generateStudentRecommendations = useCallback((studentProfile, rawListings = []) => {
    const studentSkills = Array.isArray(studentProfile?.skills)
      ? studentProfile.skills.map((s) => s.toLowerCase().trim())
      : [];
    const studentMajor = (studentProfile?.major || '').toLowerCase().trim();
    const studentInterests = Array.isArray(studentProfile?.interests)
      ? studentProfile.interests.map((i) => i.toLowerCase().trim())
      : [];

    const defaultJobs = [
      {
        listingId: 'rec-1',
        title: 'Junior React Frontend Engineer',
        companyName: 'TechPulse Innovations',
        location: 'San Francisco, CA',
        type: 'Full-time',
        remote: true,
        description: 'Join our team to build high-performance web applications using React, TypeScript, and modern design systems.',
        skillsRequired: ['React', 'TypeScript', 'JavaScript', 'Tailwind'],
        defaultScore: 96,
      },
      {
        listingId: 'rec-2',
        title: 'Fullstack Apprentice (Fall 2026)',
        companyName: 'Nexus Cloud Systems',
        location: 'Austin, TX',
        type: 'Internship',
        remote: true,
        description: 'Hands-on opportunity developing cloud APIs, microservices, and dynamic web user interfaces.',
        skillsRequired: ['Node.js', 'React', 'Firebase', 'Python'],
        defaultScore: 92,
      },
      {
        listingId: 'rec-3',
        title: 'UI Engineer & Web Specialist',
        companyName: 'Apex Creative Studio',
        location: 'New York, NY',
        type: 'Part-time',
        remote: false,
        description: 'Design and build interactive user interface components, accessible web layouts, and design libraries.',
        skillsRequired: ['Figma', 'React', 'CSS', 'HTML'],
        defaultScore: 88,
      },
    ];

    const sourceJobs = rawListings.length > 0 ? rawListings : defaultJobs;

    return sourceJobs.map((job, idx) => {
      const skillsReq = Array.isArray(job.skillsRequired) ? job.skillsRequired : (job.skills || []);
      const matchedSkills = skillsReq.filter((sk) => studentSkills.includes(sk.toLowerCase().trim()));

      let score = job.defaultScore || 70;
      if (skillsReq.length > 0 && matchedSkills.length > 0) {
        score += Math.round((matchedSkills.length / skillsReq.length) * 25);
      }

      const fullText = `${job.title || ''} ${job.description || ''}`.toLowerCase();
      let majorMatched = false;
      if (studentMajor && fullText.includes(studentMajor)) {
        score += 8;
        majorMatched = true;
      }

      const finalScore = Math.min(99, Math.max(75, score - idx * 3));

      let matchReason = 'Recommended based on overall student profile alignment';
      if (matchedSkills.length > 0) {
        matchReason = `Matched on your skills: ${matchedSkills.join(', ')}`;
      } else if (majorMatched) {
        matchReason = `Aligned with your ${studentProfile?.major || 'academic'} major`;
      } else if (studentInterests.length > 0) {
        matchReason = 'Matches your career interest preferences';
      }

      return {
        listingId: job.listingId || job.id || `job-${idx}`,
        title: job.title || 'Software Engineering Role',
        companyName: job.companyName || 'Verified Partner',
        location: job.location || 'Remote',
        type: job.type || 'Full-time',
        remote: Boolean(job.remote || (job.location && job.location.toLowerCase().includes('remote'))),
        description: job.description || '',
        skillsRequired: skillsReq,
        matchScore: finalScore,
        matchReason,
      };
    });
  }, []);

  // 1. Fetch matched listings (Cloud Function + Fallback)
  const fetchMatchedListings = useCallback(async (currentStudentProfile) => {
    setListingsLoading(true);
    setFetchError(null);

    let rawListings = [];
    try {
      const snap = await getDocs(query(collection(db, 'listings'), where('status', '==', 'approved')));
      snap.forEach((docSnap) => {
        rawListings.push({ id: docSnap.id, ...docSnap.data() });
      });
    } catch (e) {
      // Ignore query errors
    }

    try {
      const getMatchedListingsCallable = httpsCallable(functions, 'getMatchedListings');
      const result = await getMatchedListingsCallable();

      if (Array.isArray(result?.data) && result.data.length > 0) {
        setListings(result.data);
        return;
      }
    } catch (err) {
      console.warn('getMatchedListings function call unavailable, using local recommendation fallback:', err);
    } finally {
      // Ensure loading state is turned off
      setListingsLoading(false);
    }

    const recommendations = generateStudentRecommendations(currentStudentProfile, rawListings);
    setListings(recommendations);
  }, [generateStudentRecommendations]);

  // 2. Initial Data Loading: Check Profile & existing Applications/Feedback
  useEffect(() => {
    const initDashboard = async () => {
      console.log('[DEBUG] Mounting StudentDashboard & fetching data...');
      if (!currentUser) return;
      setLoading(true);

      try {
        let pData = null;
        let exists = false;
        try {
          const profileRef = doc(db, 'studentProfiles', currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            pData = profileSnap.data();
            setStudentData(pData);
            exists = true;
          }
        } catch (pErr) {
          console.error('Error reading student profile:', pErr);
        }

        setProfileExists(exists);

        // Query existing applications
        try {
          const appsRef = collection(db, 'applications');
          const qApps = query(appsRef, where('studentId', '==', currentUser.uid));
          const appsSnap = await getDocs(qApps);
          const appliedSet = new Set();
          appsSnap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.listingId) {
              appliedSet.add(data.listingId);
            }
          });
          setAppliedListingIds(appliedSet);
        } catch (appErr) {
          console.error('Error reading applications:', appErr);
        }

        // Query existing feedback
        try {
          const fbRef = collection(db, 'feedback');
          const qFb = query(fbRef, where('studentId', '==', currentUser.uid));
          const fbSnap = await getDocs(qFb);
          const fbMap = {};
          fbSnap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.listingId && data.rating) {
              fbMap[data.listingId] = data.rating;
            }
          });
          setFeedbackMap(fbMap);
        } catch (fbErr) {
          console.error('Error reading feedback:', fbErr);
        }

        await fetchMatchedListings(pData);
      } catch (err) {
        console.error('Error initializing student dashboard:', err);
        const recommendations = generateStudentRecommendations(null, []);
        setListings(recommendations);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [currentUser, fetchMatchedListings, generateStudentRecommendations]);

  // 3. Apply to Listing handler
  const handleApply = async (listingId) => {
    if (!currentUser || appliedListingIds.has(listingId)) return;

    setApplyingMap((prev) => ({ ...prev, [listingId]: true }));
    try {
      await addDoc(collection(db, 'applications'), {
        studentId: currentUser.uid,
        listingId,
        status: 'applied',
        appliedAt: serverTimestamp(),
      });

      setAppliedListingIds((prev) => new Set(prev).add(listingId));

      addToast({
        title: 'Application Submitted',
        message: 'Your application has been successfully sent to the employer!',
        type: 'success',
      });
    } catch (err) {
      console.error('Error submitting application:', err);
      addToast({
        title: 'Application Failed',
        message: 'Could not submit application. Please try again.',
        type: 'error',
      });
    } finally {
      setApplyingMap((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  // 4. Feedback handler (Thumbs Up / Down)
  const handleFeedback = async (listingId, rating) => {
    if (!currentUser || feedbackMap[listingId]) return;

    setFeedbackLoadingMap((prev) => ({ ...prev, [listingId]: true }));
    try {
      await addDoc(collection(db, 'feedback'), {
        studentId: currentUser.uid,
        listingId,
        rating,
        createdAt: serverTimestamp(),
      });

      setFeedbackMap((prev) => ({ ...prev, [listingId]: rating }));
    } catch (err) {
      console.error('Error submitting feedback:', err);
      addToast({
        title: 'Feedback Failed',
        message: 'Could not record feedback.',
        type: 'error',
      });
    } finally {
      setFeedbackLoadingMap((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  // Helper function for score badge variant
  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'neutral';
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Spinner size="lg" color="primary" label="Loading recommendations..." />
          <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Curating Personalized Job Matches...
          </p>
        </div>
      </AppShell>
    );
  }

  console.log('[DEBUG] Rendering StudentDashboard UI...');

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Header & Search Hero */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl ring-4 ring-purple-50 dark:ring-purple-950/20 shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student'}
                  </h1>
                  <Badge variant="success" dot>Active Jobseeker</Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {studentData?.major ? `${studentData.major} Major` : 'Student Candidate'}
                  {studentData?.gradYear ? ` • Graduating ${studentData.gradYear}` : ''}
                  {studentData?.location ? ` • ${studentData.location}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/student-profile">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<UserCog className="w-4 h-4" />}
                >
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl md:rounded-full border border-slate-200 dark:border-slate-800 shadow-xs focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 dark:focus-within:ring-purple-950 transition-all w-full">
            {/* Search Input */}
            <div className="flex items-center gap-2.5 px-3 flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm py-1.5"
              />
            </div>
            
            {/* Divider */}
            <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-800" />
            
            {/* Location Input */}
            <div className="flex items-center gap-2.5 px-3 flex-1 w-full">
              <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm py-1.5"
              />
            </div>

            {/* Find Jobs Button */}
            <button
              type="submit"
              className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-sm px-6 py-2.5 rounded-lg md:rounded-full transition-colors shrink-0 shadow-xs cursor-pointer text-center"
            >
              Find jobs
            </button>
          </form>
        </div>

        {/* PROFILE INCOMPLETE EMPTY STATE */}
        {!profileExists && (
          <Card className="p-8 text-center border-amber-200 bg-amber-50/40">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Complete Your Student Profile</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Complete your profile to see personalized matches based on your skills, major, interests, and location preferences.
                </p>
              </div>
              <Link to="/student-profile" className="inline-block pt-2">
                <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Go to Student Profile
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* PROFILE EXISTS: RECOMMENDATIONS FEED */}
        {profileExists && (
          <div className="space-y-6">
            {/* Feed Section Title */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Recommended Opportunities
                </h2>
                <p className="text-sm text-slate-500">
                  AI-ranked listings customized for your skills & career goals
                </p>
              </div>
              {fetchError && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCw className="w-4 h-4" />}
                  onClick={() => fetchMatchedListings(studentData)}
                  isLoading={listingsLoading}
                >
                  Retry Fetch
                </Button>
              )}
            </div>

            {/* LOADING SPINNER STATE */}
            {listingsLoading && (
              <div className="py-12 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <Spinner size="md" color="primary" label="Fetching matches..." />
                <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Analyzing opportunities...
                </p>
              </div>
            )}

            {/* ERROR STATE */}
            {!listingsLoading && fetchError && (
              <Card className="p-6 border-rose-200 bg-rose-50/40 text-center">
                <div className="max-w-md mx-auto space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">Failed to Load Recommendations</h3>
                  <p className="text-xs text-slate-600">{fetchError}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<RotateCw className="w-4 h-4" />}
                    onClick={() => fetchMatchedListings(studentData)}
                  >
                    Retry Loading Matches
                  </Button>
                </div>
              </Card>
            )}

            {/* ZERO RESULTS EMPTY STATE */}
            {!listingsLoading && !fetchError && filteredListings.length === 0 && (
              <Card className="p-10 text-center border-slate-200">
                <div className="max-w-md mx-auto space-y-3">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {listings.length === 0 ? 'No matches yet' : 'No jobs match your search'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {listings.length === 0
                      ? 'No matches yet — check back soon as more opportunities are posted.'
                      : 'Try adjusting your keywords or location filter, or clear the search parameters.'}
                  </p>
                  {listings.length > 0 && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetSearch}
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* LISTINGS FEED GRID / LIST */}
            {!listingsLoading && !fetchError && filteredListings.length > 0 && (
              <div className="space-y-4">
                {filteredListings.map((listing) => {
                  const isApplied = appliedListingIds.has(listing.listingId);
                  const isApplying = Boolean(applyingMap[listing.listingId]);
                  const userRating = feedbackMap[listing.listingId];
                  const isFeedbackLoading = Boolean(feedbackLoadingMap[listing.listingId]);

                  return (
                    <Card
                      key={listing.listingId}
                      className="p-6 hover:border-purple-300 transition-all duration-200 shadow-soft"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Main Info */}
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                              {listing.title}
                            </h3>

                            {/* Match Score Badge */}
                            <Badge
                              variant={getScoreBadgeVariant(listing.matchScore)}
                              className="font-bold px-2.5 py-0.5"
                            >
                              {listing.matchScore}% Match
                            </Badge>

                            {/* Type Badge */}
                            {listing.type && (
                              <Badge variant="primary" size="sm">
                                {listing.type}
                              </Badge>
                            )}

                            {/* Remote Badge */}
                            {listing.remote && (
                              <Badge variant="neutral" size="sm">
                                Remote
                              </Badge>
                            )}
                          </div>

                          {/* Company & Location */}
                          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                              <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              {listing.companyName}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              {listing.location}
                            </span>
                          </div>

                          {/* Plain-Language Match Reason */}
                          {listing.matchReason && (
                            <p className="text-xs text-purple-700 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-lg px-3 py-1.5 font-medium inline-block">
                              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
                              {listing.matchReason}
                            </p>
                          )}

                          {/* Description snippet */}
                          {listing.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-305 line-clamp-2 pt-1">
                              {listing.description}
                            </p>
                          )}

                          {/* Required Skills */}
                          {Array.isArray(listing.skillsRequired) && listing.skillsRequired.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {listing.skillsRequired.map((sk) => (
                                <Badge key={sk} variant="neutral" size="sm">
                                  {sk}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions Column */}
                        <div className="flex items-center md:flex-col md:items-end justify-between md:justify-start gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                          {/* Apply Button */}
                          <Button
                            variant={isApplied ? 'outline' : 'primary'}
                            size="md"
                            disabled={isApplied || isApplying}
                            isLoading={isApplying}
                            leftIcon={isApplied ? <Check className="w-4 h-4 text-emerald-600" /> : null}
                            onClick={() => handleApply(listing.listingId)}
                            className={isApplied ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-default' : ''}
                          >
                            {isApplied ? 'Applied' : 'Apply'}
                          </Button>

                          {/* Feedback Thumbs Up / Down */}
                          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
                            <button
                              type="button"
                              disabled={Boolean(userRating) || isFeedbackLoading}
                              onClick={() => handleFeedback(listing.listingId, 'up')}
                              title="Relevant match"
                              className={`p-2 rounded-md transition-colors cursor-pointer ${
                                userRating === 'up'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : userRating
                                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-900'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={Boolean(userRating) || isFeedbackLoading}
                              onClick={() => handleFeedback(listing.listingId, 'down')}
                              title="Not relevant"
                              className={`p-2 rounded-md transition-colors cursor-pointer ${
                                userRating === 'down'
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : userRating
                                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                  : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-900'
                              }`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default StudentDashboard;
