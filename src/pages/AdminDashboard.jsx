import React, { useState, useEffect, useMemo } from 'react';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore';
import {
  Shield,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  BarChart3,
  Briefcase,
  FileText,
  ThumbsUp,
  AlertCircle,
  GraduationCap,
  Mail,
  Eye,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import Tabs from '../components/ui/Tabs';
import { useToast } from '../context/ToastContext';
import { db } from '../services/firebase';

export const AdminDashboard = () => {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('pending');

  // Tab 1 State: Pending Listings
  const [pendingListings, setPendingListings] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [rejectModalListing, setRejectModalListing] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Tab 2 State: Users Management
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Tab 3 State: Platform Metrics
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalEmployers: 0,
    totalListings: 0,
    totalApplications: 0,
    feedbackUpCount: 0,
    feedbackDownCount: 0,
    feedbackRatio: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Tab 2 Detail Modal State
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [detailProfile, setDetailProfile] = useState(null);
  const [detailList, setDetailList] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleViewUser = async (user) => {
    setSelectedUserForDetail(user);
    setDetailProfile(null);
    setDetailList([]);
    setLoadingDetail(true);

    try {
      const uid = user.id;

      if (user.role === 'employer') {
        // 1. Fetch employerProfile
        const profRef = doc(db, 'employerProfiles', uid);
        const profSnap = await getDoc(profRef);
        if (profSnap.exists()) {
          setDetailProfile(profSnap.data());
        }

        // 2. Fetch listings
        const qListings = query(collection(db, 'listings'), where('employerId', '==', uid));
        const listingsSnap = await getDocs(qListings);
        const listings = [];

        // Count applicants per listing
        const appsSnap = await getDocs(collection(db, 'applications'));
        const countsMap = {};
        appsSnap.forEach((docSnap) => {
          const appData = docSnap.data();
          if (appData.listingId) {
            countsMap[appData.listingId] = (countsMap[appData.listingId] || 0) + 1;
          }
        });

        listingsSnap.forEach((docSnap) => {
          const lData = docSnap.data();
          listings.push({
            id: docSnap.id,
            title: lData.title || 'Untitled Listing',
            status: lData.status || 'pending',
            applicants: countsMap[docSnap.id] || 0,
          });
        });

        setDetailList(listings);
      } else {
        // Defaults to student
        // 1. Fetch studentProfile
        const profRef = doc(db, 'studentProfiles', uid);
        const profSnap = await getDoc(profRef);
        if (profSnap.exists()) {
          setDetailProfile(profSnap.data());
        }

        // 2. Fetch applications
        const qApps = query(collection(db, 'applications'), where('studentId', '==', uid));
        const appsSnap = await getDocs(qApps);
        const apps = [];

        for (const docSnap of appsSnap.docs) {
          const appData = docSnap.data();
          let listingTitle = appData.listingTitle || 'Job Position';

          if (appData.listingId) {
            const listSnap = await getDoc(doc(db, 'listings', appData.listingId));
            if (listSnap.exists()) {
              listingTitle = listSnap.data().title || listingTitle;
            }
          }

          apps.push({
            id: docSnap.id,
            listingTitle,
            status: appData.status || 'applied',
            appliedAt: appData.appliedAt,
          });
        }

        setDetailList(apps);
      }
    } catch (err) {
      console.error('Error fetching user detail data:', err);
      addToast({
        title: 'Error Loading Details',
        message: 'Failed to fetch full account profiling data.',
        type: 'error',
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Tab 1: Fetch Pending Listings
  // ---------------------------------------------------------------------------
  const fetchPendingListings = async () => {
    setLoadingPending(true);
    try {
      const q = query(
        collection(db, 'listings'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);

      const items = [];
      const employerIds = new Set();

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ id: docSnap.id, ...data });
        if (data.employerId) employerIds.add(data.employerId);
      });

      // Batch fetch company names from employerProfiles
      const companyMap = {};
      console.log({ items })
      console.log(employerIds)
      if (employerIds.size > 0) {
        const empDocsSnap = await getDocs(collection(db, 'employerProfiles'));
        console.log({ empDocsSnap })
        empDocsSnap.forEach((docSnap) => {
          if (employerIds.has(docSnap.id)) {
            companyMap[docSnap.id] = docSnap.data().companyName || 'Unknown Company';
          }
        });
      }
      console.log({ companyMap })
      const formatted = items.map((item) => ({
        ...item,
        companyName: companyMap[item.employerId] || item.companyName || 'Verified Employer',
      }));

      setPendingListings(formatted);
    } catch (err) {
      console.error('Error fetching pending listings:', err);
      addToast({
        title: 'Error Loading Listings',
        message: 'Could not retrieve pending job listings.',
        type: 'error',
      });
    } finally {
      setLoadingPending(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Tab 2: Fetch Users
  // ---------------------------------------------------------------------------
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const items = [];
      snap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setUsersList(items);
    } catch (err) {
      console.error('Error fetching users:', err);
      addToast({
        title: 'Error Loading Users',
        message: 'Could not retrieve user directory.',
        type: 'error',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Tab 3: Fetch Platform Metrics
  // ---------------------------------------------------------------------------
  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      // NOTE FOR SCALE: Currently using getCountFromServer for real-time MVP metrics.
      // If read costs or collection sizes scale significantly, migrate to cached/rollup documents updated via Cloud Firestore triggers.

      const studentsCountSnap = await getCountFromServer(
        query(collection(db, 'users'), where('role', '==', 'student'))
      );
      const employersCountSnap = await getCountFromServer(
        query(collection(db, 'users'), where('role', '==', 'employer'))
      );
      const listingsCountSnap = await getCountFromServer(collection(db, 'listings'));
      const appsCountSnap = await getCountFromServer(collection(db, 'applications'));

      const fbUpCountSnap = await getCountFromServer(
        query(collection(db, 'feedback'), where('rating', '==', 'up'))
      );
      const fbDownCountSnap = await getCountFromServer(
        query(collection(db, 'feedback'), where('rating', '==', 'down'))
      );

      const upCount = fbUpCountSnap.data().count;
      const downCount = fbDownCountSnap.data().count;
      const totalFb = upCount + downCount;
      const ratio = totalFb > 0 ? Math.round((upCount / totalFb) * 100) : 0;

      setMetrics({
        totalStudents: studentsCountSnap.data().count,
        totalEmployers: employersCountSnap.data().count,
        totalListings: listingsCountSnap.data().count,
        totalApplications: appsCountSnap.data().count,
        feedbackUpCount: upCount,
        feedbackDownCount: downCount,
        feedbackRatio: ratio,
      });
    } catch (err) {
      console.error('Error fetching platform metrics:', err);
      addToast({
        title: 'Error Loading Metrics',
        message: 'Could not compute system metrics.',
        type: 'error',
      });
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Fetch data on tab change
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingListings();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'metrics') {
      fetchMetrics();
    }
  }, [activeTab]);

  // ---------------------------------------------------------------------------
  // Approve & Reject Listing Handlers
  // ---------------------------------------------------------------------------
  const handleApprove = async (listingId) => {
    setActionLoadingId(listingId);
    try {
      const docRef = doc(db, 'listings', listingId);
      await updateDoc(docRef, {
        status: 'approved',
        updatedAt: serverTimestamp(),
      });

      // Optimistic UI update - remove approved listing from state
      setPendingListings((prevListings) =>
        prevListings.filter((item) => item.id !== listingId)
      );

      addToast({
        title: 'Listing Approved',
        message: 'Job posting is now approved and live for students.',
        type: 'success',
      });
    } catch (err) {
      console.error('Error approving listing:', err);
      addToast({
        title: 'Action Failed',
        message: 'Could not approve job listing. Please try again.',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalListing) return;
    const listingId = rejectModalListing.id;
    setActionLoadingId(listingId);

    try {
      const docRef = doc(db, 'listings', listingId);
      await updateDoc(docRef, {
        status: 'closed',
        updatedAt: serverTimestamp(),
      });

      // Optimistic UI update
      setPendingListings((prev) => prev.filter((item) => item.id !== listingId));

      addToast({
        title: 'Listing Rejected',
        message: 'Job posting status set to closed.',
        type: 'info',
      });
    } catch (err) {
      console.error('Error rejecting listing:', err);
      addToast({
        title: 'Action Failed',
        message: 'Could not reject job listing. Please try again.',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
      setRejectModalListing(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Client-Side User Directory Filtering
  // ---------------------------------------------------------------------------
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        !userSearchQuery ||
        (u.name && u.name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase()));

      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearchQuery, userRoleFilter]);

  // Helper date formatter
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    if (typeof timestamp === 'number') return new Date(timestamp).toLocaleDateString();
    return 'Recently';
  };

  // Helper badge color for roles
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'warning';
      case 'employer':
        return 'success';
      case 'student':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Admin Governance Console</h1>
                <Badge variant="success" dot>System Admin</Badge>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Review listings, oversee platform users, and monitor key performance indicators
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs
          tabs={[
            {
              id: 'pending',
              label: 'Pending Listings',
              icon: <Clock className="w-4 h-4" />,
              count: pendingListings.length,
            },
            {
              id: 'users',
              label: 'Users Directory',
              icon: <Users className="w-4 h-4" />,
              count: usersList.length > 0 ? usersList.length : undefined,
            },
            {
              id: 'metrics',
              label: 'System Metrics',
              icon: <BarChart3 className="w-4 h-4" />,
            },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* ========================================================================= */}
        {/* TAB 1: PENDING LISTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {loadingPending ? (
              <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
                <Spinner size="lg" color="primary" label="Loading pending listings..." />
                <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Fetching Moderation Queue...
                </p>
              </div>
            ) : pendingListings.length === 0 ? (
              <Card className="p-12 text-center border-slate-200">
                <div className="max-w-sm mx-auto space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">No listings pending review</h3>
                  <p className="text-sm text-slate-500">
                    All submitted job postings have been reviewed and processed.
                  </p>
                </div>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Listing Approvals Queue</CardTitle>
                  <CardDescription>
                    Listings pending admin review (ordered oldest first)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Title & Company</th>
                          <th className="py-3.5 px-4">Type</th>
                          <th className="py-3.5 px-4">Location</th>
                          <th className="py-3.5 px-4">Submitted Date</th>
                          <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingListings.map((listing) => (
                          <tr key={listing.id} className="hover:bg-slate-50/50">
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-900">{listing.title}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {listing.companyName}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="primary" size="sm">
                                {listing.type || 'Internship'}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-xs text-slate-600">
                              {listing.location || 'Remote'}
                            </td>
                            <td className="py-4 px-4 text-xs text-slate-500">
                              {formatDate(listing.createdAt)}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="success"
                                  size="sm"
                                  isLoading={actionLoadingId === listing.id}
                                  leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                                  onClick={() => handleApprove(listing.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  disabled={actionLoadingId === listing.id}
                                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                                  onClick={() => setRejectModalListing(listing)}
                                >
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rejection Confirmation Modal */}
            {rejectModalListing && (
              <Modal
                isOpen={Boolean(rejectModalListing)}
                onClose={() => setRejectModalListing(null)}
                title="Reject Job Listing"
                size="sm"
              >
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Are you sure you want to reject and close the listing{' '}
                    <strong className="text-slate-900">{rejectModalListing.title}</strong>?
                    This will set its status to <span className="font-semibold text-rose-600">closed</span>.
                  </p>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectModalListing(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleConfirmReject}
                      isLoading={actionLoadingId === rejectModalListing.id}
                    >
                      Reject & Close
                    </Button>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: USERS DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
              <div className="w-full sm:w-72">
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>

              <div className="w-full sm:w-48">
                <Select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  options={[
                    { label: 'All Roles', value: 'all' },
                    { label: 'Students', value: 'student' },
                    { label: 'Employers', value: 'employer' },
                    { label: 'Admins', value: 'admin' },
                  ]}
                />
              </div>
            </div>

            {/* Users Table */}
            {loadingUsers ? (
              <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
                <Spinner size="lg" color="primary" label="Loading users directory..." />
                <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Loading Accounts...
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card className="p-10 text-center border-slate-200">
                <p className="text-sm text-slate-500">No users match your filter criteria.</p>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-6">Name</th>
                          <th className="py-3.5 px-6">Email</th>
                          <th className="py-3.5 px-6">Role</th>
                          <th className="py-3.5 px-6">Created Date</th>
                          <th className="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50">
                            <td className="py-4 px-6 font-semibold text-slate-900">
                              {u.name || 'Unnamed User'}
                            </td>
                            <td className="py-4 px-6 text-slate-600">{u.email}</td>
                            <td className="py-4 px-6">
                              <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                                {u.role ? u.role.toUpperCase() : 'STUDENT'}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-500">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                                onClick={() => handleViewUser(u)}
                              >
                                View Profile
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SYSTEM METRICS */}
        {/* ========================================================================= */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {loadingMetrics ? (
              <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
                <Spinner size="lg" color="primary" label="Calculating platform metrics..." />
                <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Computing Aggregates...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Students
                    </span>
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-4">
                    {metrics.totalStudents}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Registered student candidates</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Employers
                    </span>
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-4">
                    {metrics.totalEmployers}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Verified hiring partners</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Listings
                    </span>
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-4">
                    {metrics.totalListings}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">All created job postings</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Applications
                    </span>
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-4">
                    {metrics.totalApplications}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Student application submissions</p>
                </Card>

                <Card className="p-6 sm:col-span-2 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Recommendation Feedback Satisfaction
                    </span>
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                      <ThumbsUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-3 mt-4">
                    <span className="text-4xl font-extrabold text-slate-900">
                      {metrics.feedbackRatio}%
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">
                      Positive Ratings
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {metrics.feedbackUpCount} Thumbs Up • {metrics.feedbackDownCount} Thumbs Down
                  </p>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student Profile Detail Modal */}
      {selectedUserForDetail && selectedUserForDetail.role !== 'employer' && selectedUserForDetail.role !== 'admin' && (
        <Modal
          isOpen={Boolean(selectedUserForDetail)}
          onClose={() => setSelectedUserForDetail(null)}
          title={`Student Profile: ${selectedUserForDetail.name || 'Unnamed Student'}`}
          description={`Email: ${selectedUserForDetail.email}`}
          maxWidth="max-w-2xl"
        >
          {loadingDetail ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Spinner size="lg" />
              <p className="text-xs text-slate-500 mt-3">Loading student profile data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b pb-1.5 uppercase tracking-wider text-indigo-600">
                  Profile Information
                </h4>
                {!detailProfile ? (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl">
                    This student hasn't completed their profile yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm">
                    <div>
                      <span className="font-semibold text-slate-500 block text-xs">University / Education</span>
                      <span className="text-slate-900 font-medium">{detailProfile.university || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-xs">Major / Field of Study</span>
                      <span className="text-slate-900 font-medium">{detailProfile.major || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-xs">Location</span>
                      <span className="text-slate-900 font-medium">{detailProfile.location || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-xs">Remote Preference</span>
                      <span className="text-slate-900 font-medium capitalize">
                        {detailProfile.remotePreference || 'Flexible'}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-slate-500 block text-xs mb-1">Key Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {Array.isArray(detailProfile.skills) && detailProfile.skills.length > 0
                          ? detailProfile.skills.map((sk) => (
                              <Badge key={sk} variant="primary" size="sm">
                                {sk}
                              </Badge>
                            ))
                          : 'None listed'}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-slate-500 block text-xs mb-1">Interests</span>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {Array.isArray(detailProfile.interests) && detailProfile.interests.length > 0
                          ? detailProfile.interests.map((i) => (
                              <Badge key={i} variant="neutral" size="sm">
                                {i}
                              </Badge>
                            ))
                          : 'None listed'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Applications */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 border-b pb-1.5 uppercase tracking-wider text-indigo-600">
                  Job Applications ({detailList.length})
                </h4>
                {detailList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No job applications submitted yet.</p>
                ) : (
                  <div className="overflow-hidden border border-slate-100 rounded-xl divide-y divide-slate-100">
                    {detailList.map((app) => (
                      <div key={app.id} className="p-3 flex items-center justify-between hover:bg-slate-50/40">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{app.listingTitle}</p>
                          {app.appliedAt && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Applied on {formatDate(app.appliedAt)}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            app.status === 'selected'
                              ? 'success'
                              : app.status === 'rejected'
                              ? 'danger'
                              : 'primary'
                          }
                          size="sm"
                        >
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Employer Profile Detail Modal */}
      {selectedUserForDetail && selectedUserForDetail.role === 'employer' && (
        <Modal
          isOpen={Boolean(selectedUserForDetail)}
          onClose={() => setSelectedUserForDetail(null)}
          title={`Employer Profile: ${selectedUserForDetail.name || 'Unnamed Recruiter'}`}
          description={`Recruiter Email: ${selectedUserForDetail.email}`}
          maxWidth="max-w-2xl"
        >
          {loadingDetail ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Spinner size="lg" />
              <p className="text-xs text-slate-500 mt-3">Loading employer profile data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b pb-1.5 uppercase tracking-wider text-indigo-600">
                  Company Information
                </h4>
                {!detailProfile ? (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl">
                    This employer hasn't completed their company profile yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm">
                    <div>
                      <span className="font-semibold text-slate-500 block text-xs">Company Name</span>
                      <span className="text-slate-900 font-bold">{detailProfile.companyName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-xs">Industry</span>
                      <span className="text-slate-900 font-medium">{detailProfile.industry || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-xs">Location</span>
                      <span className="text-slate-900 font-medium">{detailProfile.location || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block text-xs">Website / Reference</span>
                      <span className="text-slate-900 font-medium">{detailProfile.website || 'N/A'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-slate-500 block text-xs">Company Bio</span>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {detailProfile.bio || 'No details provided.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Listings */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 border-b pb-1.5 uppercase tracking-wider text-indigo-600">
                  Job Listings Posted ({detailList.length})
                </h4>
                {detailList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No job listings posted yet.</p>
                ) : (
                  <div className="overflow-hidden border border-slate-100 rounded-xl divide-y divide-slate-100">
                    {detailList.map((listing) => (
                      <div key={listing.id} className="p-3 flex items-center justify-between hover:bg-slate-50/40">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{listing.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {listing.applicants} applicant{listing.applicants !== 1 ? 's' : ''} received
                          </p>
                        </div>
                        <Badge
                          variant={listing.status === 'approved' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {listing.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </AppShell>
  );
};

export default AdminDashboard;
