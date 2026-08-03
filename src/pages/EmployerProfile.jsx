import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Building2, Globe, MapPin, Save, ArrowLeft, Briefcase, FileText } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../services/firebase';

const INDUSTRY_OPTIONS = [
  { label: 'Technology & Software', value: 'Technology & Software' },
  { label: 'Financial Services & Fintech', value: 'Financial Services & Fintech' },
  { label: 'Healthcare & Biotech', value: 'Healthcare & Biotech' },
  { label: 'E-commerce & Retail', value: 'E-commerce & Retail' },
  { label: 'Education & EdTech', value: 'Education & EdTech' },
  { label: 'Media & Entertainment', value: 'Media & Entertainment' },
  { label: 'Consulting & Professional Services', value: 'Consulting & Professional Services' },
  { label: 'Manufacturing & Industrial', value: 'Manufacturing & Industrial' },
  { label: 'Non-profit & Public Sector', value: 'Non-profit & Public Sector' },
  { label: 'Other', value: 'Other' },
];

export const EmployerProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Validation errors
  const [companyNameError, setCompanyNameError] = useState('');
  const [industryError, setIndustryError] = useState('');

  // Fetch existing employer profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'employerProfiles', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.companyName) setCompanyName(data.companyName);
          if (data.industry) setIndustry(data.industry);
          if (data.location) setLocation(data.location);
          if (data.website) setWebsite(data.website);
          if (data.description) setDescription(data.description);
        }
      } catch (err) {
        console.error('Error fetching employer profile:', err);
        addToast({
          title: 'Error Loading Profile',
          message: 'Could not retrieve company profile data.',
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
    setCompanyNameError('');
    setIndustryError('');

    let hasError = false;

    if (!companyName.trim()) {
      setCompanyNameError('Company name is required');
      hasError = true;
    }

    if (!industry.trim()) {
      setIndustryError('Industry is required');
      hasError = true;
    }

    if (hasError) return;

    setSaving(true);
    try {
      const profileData = {
        companyName: companyName.trim(),
        industry: industry.trim(),
        location: location.trim(),
        website: website.trim(),
        description: description.trim(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'employerProfiles', currentUser.uid), profileData, { merge: true });

      addToast({
        title: 'Company Profile Saved',
        message: 'Your company profile has been updated successfully!',
        type: 'success',
      });

      // Return to dashboard
      navigate('/employer-dashboard');
    } catch (err) {
      console.error('Error saving employer profile:', err);
      addToast({
        title: 'Save Failed',
        message: 'An error occurred while saving company profile. Please try again.',
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
          <Spinner size="lg" color="primary" label="Loading company profile..." />
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
            onClick={() => navigate('/employer-dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-b from-slate-50 to-white pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">Company Profile</CardTitle>
                <CardDescription>Manage your company information and recruiter details</CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8 p-6 sm:p-8">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Company Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    type="text"
                    placeholder="e.g. TechPulse Innovations"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (e.target.value.trim()) setCompanyNameError('');
                    }}
                    error={companyNameError}
                    leftIcon={<Building2 className="w-4 h-4" />}
                  />

                  <Select
                    label="Industry"
                    value={industry}
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      if (e.target.value) setIndustryError('');
                    }}
                    options={INDUSTRY_OPTIONS}
                    error={industryError}
                  />
                </div>
              </div>

              {/* Section 2: Location & Contact */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Location & Website</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Headquarters Location"
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />

                  <Input
                    label="Company Website"
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    leftIcon={<Globe className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Section 3: Overview & Culture */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">About the Company</h3>
                </div>

                <Textarea
                  label="Company Description"
                  placeholder="Provide a brief summary of your company, team mission, or workplace culture..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText="This overview helps prospective student applicants learn about your organization"
                />
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/employer-dashboard')}
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

export default EmployerProfile;
