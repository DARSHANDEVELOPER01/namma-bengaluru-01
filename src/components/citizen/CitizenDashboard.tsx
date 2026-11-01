import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Complaint, Announcement } from '../../types';
import { ReportGarbageForm } from './ReportGarbageForm';
import { CitizenComplaintsList } from './CitizenComplaintsList';
import { CitizenRewards } from './CitizenRewards';
import { InteractiveMap } from '../InteractiveMap';
import { THEME_IMAGES } from '../../assets/themeImages';
import {
  PlusCircle,
  FileText,
  Coins,
  MapPin,
  User,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Megaphone,
  CheckCircle2,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user, token, updateUserProfile } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'report' | 'complaints' | 'rewards' | 'map' | 'profile'>('complaints');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Profile edit states
  const [phone, setPhone] = useState(user?.phone || '');
  const [ward, setWard] = useState(user?.ward || 'Ward 112 - Domlur / Indiranagar');
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/complaints?role=citizen&userId=${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchAnnouncements();
  }, [user, token]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({ phone, ward, upiId });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // Metrics
  const totalReports = complaints.length;
  const inProgressReports = complaints.filter(
    (c) =>
      c.status === 'Submitted' ||
      c.status === 'Under Review' ||
      c.status === 'Approved' ||
      c.status === 'Assigned to Field Staff' ||
      c.status === 'Cleaning in Progress'
  ).length;
  const cleanedReports = complaints.filter(
    (c) => c.status === 'Completed' || c.status === 'Reward Approved' || c.status === 'Reward Paid'
  ).length;
  const totalEarnedCash = complaints
    .filter((c) => c.status === 'Reward Paid')
    .reduce((acc, c) => acc + (c.rewardAmount || 0), 0);

  return (
    <div className="min-h-screen text-slate-100 pb-16">
      {/* Background with Vidhana Soudha & Karnataka Theme */}
      <div className="fixed inset-0 -z-10">
        <img
          src={THEME_IMAGES.vidhanaSoudhaSunset}
          alt="Karnataka Heritage"
          className="w-full h-full object-cover object-center filter brightness-[0.25] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Swachh Bengaluru Announcement Banner */}
        {announcements.length > 0 && announcements[0].important && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-amber-950/80 to-slate-950/80 border border-amber-500/40 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 uppercase tracking-wider mr-2">
                  {announcements[0].tag}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {language === 'kn' ? announcements[0].titleKn : announcements[0].title}
                </span>
                <p className="text-xs text-slate-300 mt-0.5 hidden sm:block">
                  {language === 'kn' ? announcements[0].contentKn : announcements[0].content}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('report')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-md"
            >
              Report Hotspot Now
            </button>
          </div>
        )}

        {/* User Hero Greeting & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Welcome User Card */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'kn' ? 'ನಾಗರಿಕ ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ' : 'Citizen Cleanliness Hub'}</span>
              </div>
              <h2 className="text-2xl font-black text-white">
                {language === 'kn' ? `ನಮಸ್ಕಾರ, ${user?.name}` : `Welcome back, ${user?.name}`}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {user?.ward || 'Bengaluru Municipal Ward'} • Registered Citizen
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveTab('report')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('reportGarbageTitle')}</span>
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Rewards Wallet</span>
              </button>
            </div>
          </div>

          {/* Stat 1: Total Reports */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              My Reports
            </span>
            <div className="my-2">
              <div className="text-3xl font-black text-white">{totalReports}</div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="text-amber-400 font-semibold">{inProgressReports} In Action</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{cleanedReports} Cleared</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('complaints')}
              className="text-xs text-amber-400 hover:underline font-semibold text-left cursor-pointer"
            >
              View 8-stage progress →
            </button>
          </div>

          {/* Stat 2: Rewards Earned */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/60 to-slate-900/90 border border-amber-500/40 backdrop-blur-xl flex flex-col justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span>UPI Cash Rewards</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </span>
            <div className="my-2">
              <div className="text-3xl font-black text-amber-400 flex items-center gap-1">
                <span>₹</span>
                <span>{totalEarnedCash}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                Direct to {user?.upiId || 'UPI ID'}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('rewards')}
              className="text-xs text-amber-300 hover:underline font-semibold text-left cursor-pointer"
            >
              View payment history →
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-white/10 scrollbar-none">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Reports & Live Status ({complaints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'report'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Garbage (Camera & GPS)</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Rewards & Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'map'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Bengaluru City Map</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Citizen Profile</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'report' && (
          <ReportGarbageForm
            onSuccess={() => {
              fetchComplaints();
              setActiveTab('complaints');
            }}
          />
        )}

        {activeTab === 'complaints' && (
          <CitizenComplaintsList complaints={complaints} onRefresh={fetchComplaints} />
        )}

        {activeTab === 'rewards' && <CitizenRewards complaints={complaints} />}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">Bengaluru Cleanliness Heatmap</h4>
                <p className="text-xs text-slate-400">
                  Interactive OpenStreetMap showing your complaints and cleared civic spots across Bengaluru.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-400">● Cleared</span>
                <span className="flex items-center gap-1 text-blue-400">● In Progress</span>
                <span className="flex items-center gap-1 text-amber-400">● Verified</span>
              </div>
            </div>
            <InteractiveMap complaints={complaints} height="500px" />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-4 pb-6 border-b border-white/10 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl border border-emerald-500/30">
                {user?.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{user?.name}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Verified Bengaluru Citizen
                </span>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-white/10 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-white/10 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned BBMP Ward
                </label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  UPI ID for Cash Rewards
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {profileSaved && (
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
