import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Complaint, SystemStats, FieldStaff, RewardTransaction, Announcement } from '../../types';
import { InteractiveMap } from '../InteractiveMap';
import { THEME_IMAGES } from '../../assets/themeImages';
import {
  ShieldCheck,
  Users,
  HardHat,
  FileText,
  Clock,
  CheckCircle2,
  Coins,
  AlertCircle,
  MapPin,
  ExternalLink,
  Search,
  Filter,
  DollarSign,
  ArrowRight,
  Send,
  Eye,
  Check,
  X,
  CreditCard,
  Printer,
  Sparkles,
  Calendar,
  Layers,
  Megaphone,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'queue' | 'before_after' | 'payouts' | 'staff' | 'map' | 'announcements'
  >('queue');

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [staffList, setStaffList] = useState<FieldStaff[]>([]);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');

  // Modals
  const [verifyModalComplaint, setVerifyModalComplaint] = useState<Complaint | null>(null);
  const [assignModalComplaint, setAssignModalComplaint] = useState<Complaint | null>(null);
  const [payoutModalComplaint, setPayoutModalComplaint] = useState<Complaint | null>(null);

  // Verification Form State
  const [rewardAmount, setRewardAmount] = useState<number>(150);
  const [adminNotes, setAdminNotes] = useState<string>('Verified genuine municipal waste violation.');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Assignment Form State
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Payout Form State
  const [paymentMethod, setPaymentMethod] = useState<'PhonePe' | 'GooglePay' | 'BHIM' | 'Paytm'>(
    'PhonePe'
  );
  const [customUtr, setCustomUtr] = useState<string>('');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [lastProcessedTxn, setLastProcessedTxn] = useState<RewardTransaction | null>(null);

  // Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');

  const fetchData = async () => {
    try {
      const [compRes, statsRes, staffRes, txnRes, annRes] = await Promise.all([
        fetch('/api/complaints', { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        fetch('/api/stats'),
        fetch('/api/staff-list'),
        fetch('/api/payouts'),
        fetch('/api/announcements'),
      ]);

      if (compRes.ok) setComplaints(await compRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (staffRes.ok) {
        const staffData: FieldStaff[] = await staffRes.json();
        setStaffList(staffData);
        if (staffData.length > 0 && !selectedStaffId) {
          setSelectedStaffId(staffData[0].staffId);
        }
      }
      if (txnRes.ok) setTransactions(await txnRes.json());
      if (annRes.ok) setAnnouncements(await annRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle Verify (Approve / Reject)
  const handleVerifyAction = async (action: 'approve' | 'reject') => {
    if (!verifyModalComplaint) return;
    try {
      const res = await fetch(`/api/complaints/${verifyModalComplaint.id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          rewardAmount,
          adminNotes,
          rejectionReason,
        }),
      });

      if (res.ok) {
        await fetchData();
        setVerifyModalComplaint(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Staff Assignment
  const handleAssignStaff = async () => {
    if (!assignModalComplaint || !selectedStaffId) return;
    const staff = staffList.find((s) => s.staffId === selectedStaffId);

    try {
      const res = await fetch(`/api/complaints/${assignModalComplaint.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          staffId: selectedStaffId,
          staffName: staff?.name || 'BBMP Squad',
        }),
      });

      if (res.ok) {
        await fetchData();
        setAssignModalComplaint(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Payout Process
  const handleProcessPayout = async () => {
    if (!payoutModalComplaint) return;
    setIsProcessingPayout(true);

    try {
      const res = await fetch('/api/payouts/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          complaintId: payoutModalComplaint.id,
          paymentMethod,
          manualUtr: customUtr,
          customAmount: payoutModalComplaint.rewardAmount || 150,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLastProcessedTxn(data.transaction);
        await fetchData();
        setPayoutModalComplaint(null);
        setCustomUtr('');
      } else {
        alert(data.error || 'Payment failed');
      }
    } catch (e) {
      console.error(e);
      alert('Network error initiating payout');
    } finally {
      setIsProcessingPayout(false);
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesWard = wardFilter === 'all' || c.ward === wardFilter;

    return matchesSearch && matchesStatus && matchesWard;
  });

  const pendingVerificationComplaints = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  );
  const pendingPayoutComplaints = complaints.filter(
    (c) => c.status === 'Completed' && c.paymentStatus !== 'Paid'
  );

  return (
    <div className="min-h-screen text-slate-100 pb-16">
      {/* Background with Vidhana Soudha & Karnataka Theme */}
      <div className="fixed inset-0 -z-10">
        <img
          src={THEME_IMAGES.vidhanaSoudhaSunset}
          alt="Vidhana Soudha Bengaluru"
          className="w-full h-full object-cover object-center filter brightness-[0.22] contrast-[1.1]"
        />
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Admin Header */}
        <div className="p-6 rounded-3xl bg-slate-900/85 border border-red-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 font-black text-xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 uppercase tracking-wider">
                  BBMP EXECUTIVE COMMAND CENTER
                </span>
                <span className="text-xs text-amber-400 font-semibold">
                  Namma Bengaluru Smart City Mission
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{user?.name}</h2>
              <p className="text-xs text-slate-300">
                {user?.badge || 'Chief Municipal Commissioner, BBMP'} • Administrative Operations
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setStatusFilter('Submitted');
                setActiveTab('queue');
              }}
              className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{pendingVerificationComplaints.length} To Verify</span>
            </button>

            <button
              onClick={() => setActiveTab('payouts')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{pendingPayoutComplaints.length} Payouts Ready</span>
            </button>
          </div>
        </div>

        {/* 8 CRITICAL METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Registered Citizens */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{t('totalCitizens')}</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats?.totalCitizens?.toLocaleString() || '1,846'}
            </div>
          </div>

          {/* 2. Field Staff On Duty */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{t('totalFieldStaff')}</span>
              <HardHat className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{staffList.length} Squads</div>
          </div>

          {/* 3. Total Complaints */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>{t('totalComplaints')}</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {complaints.length + (stats?.totalComplaints || 342)}
            </div>
          </div>

          {/* 4. Pending Verification */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-red-500/30 backdrop-blur-md">
            <div className="flex items-center justify-between text-red-300 text-xs mb-1">
              <span>{t('pendingComplaints')}</span>
              <Clock className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-red-400">
              {pendingVerificationComplaints.length}
            </div>
          </div>

          {/* 5. Verified & Approved */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md">
            <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
              <span>{t('approvedComplaints')}</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {complaints.filter((c) => c.status === 'Approved' || c.status === 'Assigned to Field Staff').length}
            </div>
          </div>

          {/* 6. Completed Cleanups */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md">
            <div className="flex items-center justify-between text-emerald-300 text-xs mb-1">
              <span>{t('completedTasks')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {complaints.filter((c) => c.status === 'Completed' || c.status === 'Reward Paid').length + 310}
            </div>
          </div>

          {/* 7. Total Rewards Disbursed */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/40 backdrop-blur-md">
            <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
              <span>{t('rewardsDistributed')}</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">
              ₹{(stats?.totalRewardsDistributed || 78500).toLocaleString()}
            </div>
          </div>

          {/* 8. Pending Reward Payouts */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 backdrop-blur-md">
            <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
              <span>{t('pendingRewards')}</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400">
              ₹{pendingPayoutComplaints.reduce((a, c) => a + (c.rewardAmount || 150), 0)}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Complaints Queue & Verification ({complaints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>UPI Payout Hub ({pendingPayoutComplaints.length} Ready)</span>
          </button>

          <button
            onClick={() => setActiveTab('before_after')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'before_after'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Before & After Photo Proofs</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Field Staff Squads ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'map'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>City Cleanliness Map</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Announcements & Alerts</span>
          </button>
        </div>

        {/* TAB 1: COMPLAINTS QUEUE & VERIFICATION */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            {/* Filters bar */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, landmark, citizen..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Submitted">Submitted (New)</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Assigned to Field Staff">Assigned to Staff</option>
                  <option value="Cleaning in Progress">Cleaning in Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Reward Paid">Reward Paid</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="all">All Wards</option>
                  <option value="Ward 112 - Domlur / Indiranagar">Ward 112 - Indiranagar</option>
                  <option value="Ward 151 - Koramangala">Ward 151 - Koramangala</option>
                  <option value="Ward 45 - Malleshwaram">Ward 45 - Malleshwaram</option>
                  <option value="Ward 168 - Jayanagar 4th Block">Ward 168 - Jayanagar</option>
                  <option value="Ward 84 - Hagadur / Whitefield">Ward 84 - Whitefield</option>
                </select>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden backdrop-blur-md shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">Complaint ID & Ward</th>
                      <th className="py-3 px-4">Citizen Details</th>
                      <th className="py-3 px-4">GPS & Location</th>
                      <th className="py-3 px-4">Status & Reward</th>
                      <th className="py-3 px-4">Assigned Squad</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredComplaints.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-4">
                          <img
                            src={item.photoUrl}
                            alt="garbage"
                            className="w-14 h-14 object-cover rounded-xl border border-white/10 cursor-pointer"
                            onClick={() => setVerifyModalComplaint(item)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-amber-400">{item.id}</div>
                          <div className="text-slate-300 font-semibold mt-0.5">{item.ward}</div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{item.citizenName}</div>
                          <div className="text-[11px] text-slate-400">{item.citizenPhone}</div>
                          <div className="text-[10px] text-amber-300/80 font-mono">
                            {item.citizenUpi}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-[200px]">
                          <div className="text-slate-200 line-clamp-1">{item.address}</div>
                          <a
                            href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>GPS: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</span>
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Reward Paid'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : item.status === 'Completed'
                                ? 'bg-teal-500/20 text-teal-300'
                                : item.status === 'Rejected'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {item.status}
                          </span>
                          <div className="text-[11px] font-bold text-amber-400 mt-1">
                            Reward: ₹{item.rewardAmount || 150}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {item.staffName ? (
                            <div>
                              <div className="font-semibold text-white">{item.staffName}</div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.staffId}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          {/* Verify / Inspect */}
                          <button
                            onClick={() => {
                              setVerifyModalComplaint(item);
                              setRewardAmount(item.rewardAmount || 150);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition cursor-pointer"
                          >
                            Verify & Reward
                          </button>

                          {/* Assign Staff */}
                          {(item.status === 'Approved' || item.status === 'Submitted') && (
                            <button
                              onClick={() => setAssignModalComplaint(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black transition cursor-pointer"
                            >
                              Assign Squad
                            </button>
                          )}

                          {/* Instant Payout */}
                          {item.status === 'Completed' && item.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => setPayoutModalComplaint(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer"
                            >
                              Process UPI Payout
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BEFORE & AFTER PHOTO INSPECTION */}
        {activeTab === 'before_after' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Before & After Cleaning Audits</h3>
                <p className="text-xs text-slate-400">
                  Inspect photographic proof submitted by field staff before certifying civic work and releasing citizen rewards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints
                .filter((c) => c.afterCleaningPhotoUrl || c.status === 'Completed' || c.status === 'Reward Paid')
                .map((comp) => (
                  <div
                    key={comp.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400">{comp.id}</span>
                      <span className="text-xs text-slate-300 font-semibold">{comp.ward}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-950 p-2 rounded-xl border border-red-500/30">
                        <span className="text-[10px] font-bold text-red-400 block mb-1">
                          BEFORE (REPORTED)
                        </span>
                        <img
                          src={comp.beforeCleaningPhotoUrl || comp.photoUrl}
                          alt="Before"
                          className="w-full h-36 object-cover rounded-lg"
                        />
                      </div>

                      <div className="bg-slate-950 p-2 rounded-xl border border-emerald-500/40">
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">
                          AFTER (CLEANED BY SQUAD)
                        </span>
                        <img
                          src={comp.afterCleaningPhotoUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600'}
                          alt="After"
                          className="w-full h-36 object-cover rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-slate-300">
                      <div className="font-semibold text-white">{comp.address}</div>
                      <p className="text-[11px] text-slate-400 italic mt-0.5">
                        Staff Log: "{comp.staffNotes || 'Cleared and sanitized'}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">
                        Reward: ₹{comp.rewardAmount || 150} ({comp.citizenUpi})
                      </span>
                      {comp.status === 'Completed' && comp.paymentStatus !== 'Paid' ? (
                        <button
                          onClick={() => setPayoutModalComplaint(comp)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                        >
                          Approve & Pay Reward →
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-bold">
                          ✓ Reward Disbursed ({comp.paymentUtr})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: UPI REWARD PAYOUT HUB */}
        {activeTab === 'payouts' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600/20 to-emerald-600/20 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md">
              <div>
                <h3 className="text-base font-bold text-white">
                  Citizen Reward Disbursal Center (PhonePe / Google Pay UPI)
                </h3>
                <p className="text-xs text-slate-300">
                  Execute authorized citizen incentive payments for verified cleanups. Generates official 12-digit bank UTR numbers.
                </p>
              </div>
              <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {pendingPayoutComplaints.length} Payments Awaiting Disbursal
              </div>
            </div>

            {/* Pending Payout Queue */}
            <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden backdrop-blur-md">
              <div className="p-4 border-b border-white/10 font-bold text-xs text-amber-400 uppercase tracking-wider">
                Ready for Disbursal Queue
              </div>
              {pendingPayoutComplaints.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No pending reward payouts at this moment.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {pendingPayoutComplaints.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white/5 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {comp.id}
                          </span>
                          <span className="text-xs text-white font-semibold">
                            {comp.citizenName}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            ({comp.citizenUpi})
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{comp.address}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-base font-black text-amber-400">
                            ₹{comp.rewardAmount || 150}
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            Cleaning Verified
                          </span>
                        </div>

                        <button
                          onClick={() => setPayoutModalComplaint(comp)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                        >
                          Execute UPI Payout
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Disbursal Ledger */}
            <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden backdrop-blur-md">
              <div className="p-4 border-b border-white/10 font-bold text-xs text-slate-300 uppercase tracking-wider">
                Recent Disbursed UPI Transactions
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-4">Txn ID</th>
                      <th className="py-2.5 px-4">Complaint ID</th>
                      <th className="py-2.5 px-4">Citizen & UPI</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Channel</th>
                      <th className="py-2.5 px-4">Bank UTR Ref</th>
                      <th className="py-2.5 px-4">Authorized By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-white/5 transition">
                        <td className="py-2.5 px-4 font-mono text-slate-300">{txn.id}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-amber-400">
                          {txn.complaintId}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-white">{txn.citizenName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {txn.citizenUpi}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-emerald-400">₹{txn.amount}</td>
                        <td className="py-2.5 px-4 font-semibold text-blue-400">{txn.method}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-200 text-[11px]">
                          {txn.utr}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">{txn.approvedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FIELD STAFF FLEET MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">BBMP Field Staff Fleet Management</h3>
                <p className="text-xs text-slate-400">
                  Inspect on-duty sanitation squads, active cleaning tasks, and completion metrics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        staff.isOnDuty
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {staff.isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{staff.name}</h4>
                    <p className="text-xs font-mono text-amber-400">{staff.staffId}</p>
                    <p className="text-xs text-slate-400 mt-1">{staff.ward}</p>
                    <p className="text-[11px] text-slate-400">{staff.phone}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Active Tasks</span>
                      <span className="font-bold text-amber-400">{staff.activeTasks}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Completed</span>
                      <span className="font-bold text-emerald-400">{staff.completedTasks}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Rating</span>
                      <span className="font-bold text-white">★ {staff.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CITY CLEANLINESS MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Bengaluru Smart City Real-Time Waste Map
                </h3>
                <p className="text-xs text-slate-400">
                  Interactive OpenStreetMap with color-coded complaint hotspots (Red: Submitted, Amber: Assigned, Green: Cleared).
                </p>
              </div>
            </div>
            <InteractiveMap complaints={complaints} height="520px" />
          </div>
        )}

        {/* TAB 6: ANNOUNCEMENTS & ALERTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <h3 className="text-base font-bold text-white mb-2">Live Public Announcements</h3>
              <p className="text-xs text-slate-400 mb-4">
                Broadcast official cleanliness drives and monsoon advisories to all citizens across Bengaluru.
              </p>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex items-start gap-3"
                  >
                    <Megaphone className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{ann.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {ann.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{ann.content}</p>
                      <p className="text-xs text-amber-300/80 mt-1 font-serif">{ann.titleKn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VERIFICATION MODAL */}
      {verifyModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-base font-bold text-white">
                Verify Complaint: {verifyModalComplaint.id}
              </h4>
              <button
                onClick={() => setVerifyModalComplaint(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo preview */}
            <img
              src={verifyModalComplaint.photoUrl}
              alt="Reported Spot"
              className="w-full h-56 object-cover rounded-2xl border border-white/10"
            />

            <div className="text-xs space-y-1">
              <div className="font-semibold text-white">{verifyModalComplaint.address}</div>
              <div className="text-slate-400">
                Landmark: {verifyModalComplaint.landmark || 'None specified'}
              </div>
              <div className="text-slate-300 italic">"{verifyModalComplaint.description}"</div>
              <div className="text-slate-400">
                Reported by: {verifyModalComplaint.citizenName} ({verifyModalComplaint.citizenPhone})
                • UPI: <span className="text-amber-400">{verifyModalComplaint.citizenUpi}</span>
              </div>
            </div>

            {/* Set Reward Amount */}
            <div className="p-3 rounded-xl bg-slate-950 border border-white/10">
              <label className="block text-xs font-bold text-amber-300 mb-2">
                Allocate Citizen Incentive Reward (₹)
              </label>
              <div className="flex items-center gap-2 mb-2">
                {[50, 100, 150, 200, 250, 300, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRewardAmount(amt)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      rewardAmount === amt
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-white/15 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Audit Notes:
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleVerifyAction('reject')}
                className="px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs font-bold transition cursor-pointer"
              >
                Reject Report
              </button>
              <button
                type="button"
                onClick={() => handleVerifyAction('approve')}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
              >
                Approve & Allocate ₹{rewardAmount} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN SQUAD MODAL */}
      {assignModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-base font-bold text-white">
                Assign Sanitation Squad: {assignModalComplaint.id}
              </h4>
              <button
                onClick={() => setAssignModalComplaint(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Available Field Staff:
              </label>
              <div className="space-y-2">
                {staffList.map((s) => (
                  <label
                    key={s.staffId}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      selectedStaffId === s.staffId
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-slate-950 border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="staff"
                        checked={selectedStaffId === s.staffId}
                        onChange={() => setSelectedStaffId(s.staffId)}
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{s.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {s.staffId} • {s.ward}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-amber-300">
                      {s.activeTasks} Active
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setAssignModalComplaint(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStaff}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI PAYOUT MODAL */}
      {payoutModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">Execute Direct UPI Payout</h4>
              </div>
              <button
                onClick={() => setPayoutModalComplaint(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payout Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Complaint ID:</span>
                <span className="font-mono font-bold text-amber-400">
                  {payoutModalComplaint.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Citizen Beneficiary:</span>
                <span className="font-semibold text-white">{payoutModalComplaint.citizenName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Beneficiary UPI ID:</span>
                <span className="font-mono font-bold text-amber-300">
                  {payoutModalComplaint.citizenUpi}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="font-bold text-white">Reward Incentive:</span>
                <span className="text-xl font-black text-emerald-400">
                  ₹{payoutModalComplaint.rewardAmount || 150}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select UPI Payment Gateway / Payout API:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['PhonePe', 'GooglePay', 'BHIM'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      paymentMethod === method
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Manual UTR */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bank UTR / Transaction Reference (Optional, auto-generated if blank):
              </label>
              <input
                type="text"
                value={customUtr}
                onChange={(e) => setCustomUtr(e.target.value)}
                placeholder="e.g. UPI/2026/094821849182"
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
              Note: This initiates the official payment disbursal and will notify the citizen with the 12-digit bank reference number.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPayoutModalComplaint(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayout}
                onClick={handleProcessPayout}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                {isProcessingPayout ? 'Processing...' : `Disburse ₹${payoutModalComplaint.rewardAmount || 150} via ${paymentMethod} →`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
