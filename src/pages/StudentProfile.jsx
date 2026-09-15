import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, GraduationCap, Sparkles, MapPin, Save, ArrowLeft } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TagInput from '../components/ui/TagInput';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../services/firebase';

export const StudentProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [degree, setDegree] = useState("Bachelor's");
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState(new Date().getFullYear().toString());
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [location, setLocation] = useState('');
  const [remotePreference, setRemotePreference] = useState('Remote');

  // Error states
  const [gradYearError, setGradYearError] = useState('');
  const [skillsError, setSkillsError] = useState('');

  // Fetch existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'studentProfiles', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.degree) setDegree(data.degree);
          if (data.major) setMajor(data.major);
          if (data.gradYear) setGradYear(data.gradYear.toString());
          if (data.skills) setSkills(data.skills);
          if (data.interests) setInterests(data.interests);
          if (data.location) setLocation(data.location);
          if (data.remotePreference) setRemotePreference(data.remotePreference);
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
        addToast({
          title: 'Error Loading Profile',
          message: 'Could not retrieve existing profile data.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGradYearError('');
    setSkillsError('');

    let hasError = false;

    // Validate graduation year
    const yearNum = parseInt(gradYear, 10);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2035) {
      setGradYearError('Graduation year must be between 2000 and 2035');
      hasError = true;
    }

    // Validate skills length
    if (skills.length === 0) {
      setSkillsError('At least 1 skill is required');
      hasError = true;
    }

    if (hasError) return;

    setSaving(true);
    try {
      const profileData = {
        degree,
        major,
        gradYear: yearNum,
        skills,
        interests,
        location,
        remotePreference,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'studentProfiles', currentUser.uid), profileData, { merge: true });

      addToast({
        title: 'Profile Saved',
        message: 'Your student profile has been updated successfully!',
        type: 'success',
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      addToast({
        title: 'Save Failed',
        message: 'An error occurred while saving your profile. Please try again.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Spinner size="lg" color="primary" label="Loading student profile..." />
          <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Profile Data...
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation back button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student-dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/55 dark:to-slate-900 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Student Profile</CardTitle>
                <CardDescription>Update your academic details, skills, and career preferences</CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8 p-6 sm:p-8">
              {/* Section 1: Education */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Education Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Degree Level"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    options={[
                      { label: "Bachelor's Degree", value: "Bachelor's" },
                      { label: "Master's Degree", value: "Master's" },
                      { label: "Associate's Degree", value: "Associate's" },
                      { label: "High School Diploma", value: "High School" },
                      { label: "PhD / Doctorate", value: "PhD" },
                      { label: "Other Certificate / Vocational", value: "Other" },
                    ]}
                  />

                  <Input
                    label="Major / Field of Study"
                    type="text"
                    placeholder="e.g. Computer Science, Business"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                </div>

                <div className="sm:w-1/2">
                  <Input
                    label="Graduation Year"
                    type="number"
                    placeholder="e.g. 2027"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    error={gradYearError}
                    helperText="Expected or completed graduation year"
                  />
                </div>
              </div>

              {/* Section 2: Skills & Interests */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Skills & Career Interests</h3>
                </div>

                <TagInput
                  label="Technical & Professional Skills"
                  tags={skills}
                  onChange={(newSkills) => {
                    setSkills(newSkills);
                    if (newSkills.length > 0) setSkillsError('');
                  }}
                  placeholder="Add a skill (e.g. React, Python, UI Design) and press Enter"
                  error={skillsError}
                  helperText="At least 1 skill required for candidate matching"
                />

                <TagInput
                  label="Career Interests & Specializations"
                  tags={interests}
                  onChange={setInterests}
                  placeholder="Add interest (e.g. Frontend Development, AI, Marketing)"
                  helperText="Topics and industries you want to work in"
                />
              </div>

              {/* Section 3: Location & Preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Location & Work Preferences</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Current Location"
                    type="text"
                    placeholder="e.g. San Francisco, CA or London, UK"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />

                  <Select
                    label="Remote Preference"
                    value={remotePreference}
                    onChange={(e) => setRemotePreference(e.target.value)}
                    options={[
                      { label: "Remote Only", value: "Remote" },
                      { label: "Hybrid Work", value: "Hybrid" },
                      { label: "On-site Only", value: "On-site" },
                      { label: "Any / Flexible", value: "Any" },
                    ]}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 dark:bg-slate-950 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/student-dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppShell>
  );
};

export default StudentProfile;
