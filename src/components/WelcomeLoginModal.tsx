import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Role } from '../types';
import { THEME_IMAGES } from '../assets/themeImages';
import {
  ShieldCheck,
  User,
  Sparkles,
  Lock,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Globe,
  HardHat,
} from 'lucide-react';

interface WelcomeLoginModalProps {
  onSuccess?: () => void;
}

export const WelcomeLoginModal: React.FC<WelcomeLoginModalProps> = () => {
  const { login, registerCitizen, quickLoginDemo } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();

  const [activePortal, setActivePortal] = useState<Role>('citizen');
  const [citizenMode, setCitizenMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('Ward 112 - Domlur / Indiranagar');
  const [upiId, setUpiId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bengaluruWards = [
    'Ward 112 - Domlur / Indiranagar',
    'Ward 151 - Koramangala',
    'Ward 45 - Malleshwaram',
    'Ward 168 - Jayanagar 4th Block',
    'Ward 84 - Hagadur / Whitefield',
    'Ward 174 - HSR Layout',
    'Ward 77 - Dinnur / RT Nagar',
    'Ward 198 - Hemmigepura / Kengeri',
    'Ward 149 - Varthur / Bellandur',
    'Ward 32 - Hebbal Kempapura',
  ];

  const handlePortalSwitch = (role: Role) => {
    setActivePortal(role);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password, activePortal);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!name || !email || !password) {
      setError('Name, email and password are required');
      setIsSubmitting(false);
      return;
    }

    const res = await registerCitizen({
      name,
      email,
      phone,
      ward,
      upiId,
      password,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || 'Registration failed');
    }
  };

  const handleDemoFill = (role: Role) => {
    setError(null);
    if (role === 'admin') {
      setEmail('admin@bengaluru.gov.in');
      setPassword('Admin@123');
    } else if (role === 'citizen') {
      if (citizenMode === 'login') {
        setEmail('citizen.darshan@gmail.com');
        setPassword('Citizen@123');
      } else {
        setName('Kavya Sharma');
        setEmail('kavya.blr@gmail.com');
        setPhone('9845112233');
        setWard('Ward 151 - Koramangala');
        setUpiId('kavya@okhdfcbank');
        setPassword('Kavya@123');
      }
    } else if (role === 'staff') {
      setEmail('staff.rajesh@bbmp.gov.in');
      setPassword('Staff@123');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden text-slate-100">
      {/* Dynamic Karnataka Heritage Sunset Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={activePortal === 'admin' ? THEME_IMAGES.vidhanaSoudhaSunset : THEME_IMAGES.karnatakaHeritageCity}
          alt="Karnataka Heritage Vidhana Soudha"
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.08] transition-all duration-1000 scale-105"
        />
        {/* Karnataka Flag Color subtle radial ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#CE1126] via-[#FCD116] to-[#CE1126] shadow-lg shadow-amber-500/30" />
      </div>

      {/* Top Bar with Language Toggle & Official Seals */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-amber-400 text-sm tracking-tighter">
              ಬೆಂ
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {language === 'kn' ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ' : 'Government of Karnataka'}
              </span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-xs font-medium text-slate-300">BBMP Smart City</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{t('appName')}</span>
              <span className="hidden sm:inline-block text-xs font-normal text-amber-300/80 border-l border-white/20 pl-2">
                {t('tagline')}
              </span>
            </h1>
          </div>
        </div>

        {/* Language switch */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-semibold text-white transition active:scale-95 cursor-pointer shadow-sm"
          title="Switch Language / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
        </button>
      </header>

      {/* Hero Presentation & Portal Selection */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-6xl mx-auto w-full">
        {/* Main Branding Headings */}
        <div className="text-center mb-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('welcomeTitle')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
            {language === 'kn' ? 'ನಮ್ಮ ಬೆಂಗಳೂರು, ನಮ್ಮ ಜವಾಬ್ದಾರಿ' : 'Our Bengaluru, Our Responsibility'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            {t('welcomeDesc')}
          </p>
        </div>

        {/* 3 Dedicated Portal Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mb-6">
          {/* CITIZEN PORTAL BUTTON */}
          <button
            type="button"
            onClick={() => handlePortalSwitch('citizen')}
            className={`relative p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
              activePortal === 'citizen'
                ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900/90 border-emerald-500 shadow-xl shadow-emerald-500/20 scale-[1.02]'
                : 'bg-slate-900/60 hover:bg-slate-800/60 border-white/10 backdrop-blur-md opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                Rewards UPI
              </span>
            </div>
            <div>
              <div className="text-base font-bold text-white">{t('citizenPortal')}</div>
              <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t('citizenLoginDesc')}</div>
            </div>
          </button>

          {/* ADMIN PORTAL BUTTON */}
          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            className={`relative p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
              activePortal === 'admin'
                ? 'bg-gradient-to-b from-red-950/80 to-slate-900/90 border-red-500 shadow-xl shadow-red-500/20 scale-[1.02]'
                : 'bg-slate-900/60 hover:bg-slate-800/60 border-white/10 backdrop-blur-md opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 uppercase tracking-wider">
                Authorized
              </span>
            </div>
            <div>
              <div className="text-base font-bold text-white">{t('adminPortal')}</div>
              <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t('adminLoginDesc')}</div>
            </div>
          </button>

          {/* FIELD STAFF PORTAL BUTTON */}
          <button
            type="button"
            onClick={() => handlePortalSwitch('staff')}
            className={`relative p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
              activePortal === 'staff'
                ? 'bg-gradient-to-b from-amber-950/80 to-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/20 scale-[1.02]'
                : 'bg-slate-900/60 hover:bg-slate-800/60 border-white/10 backdrop-blur-md opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <HardHat className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                Sanitation
              </span>
            </div>
            <div>
              <div className="text-base font-bold text-white">{t('staffPortal')}</div>
              <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t('staffLoginDesc')}</div>
            </div>
          </button>
        </div>

        {/* Active Portal Glass Card Form */}
        <div className="w-full max-w-lg bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Ambient card corner glow */}
          <div
            className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
              activePortal === 'admin'
                ? 'bg-red-500'
                : activePortal === 'staff'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />

          {/* Portal Header Badge */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  activePortal === 'admin'
                    ? 'bg-red-500/20 text-red-400'
                    : activePortal === 'staff'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {activePortal === 'admin' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : activePortal === 'staff' ? (
                  <HardHat className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {activePortal === 'admin'
                    ? t('adminPortal')
                    : activePortal === 'staff'
                    ? t('staffPortal')
                    : t('citizenPortal')}
                </h3>
                <p className="text-xs text-slate-400">
                  {activePortal === 'admin'
                    ? 'BBMP Administrative & Municipal Control'
                    : activePortal === 'staff'
                    ? 'Ground Squad Task Assignment & Proof'
                    : 'Citizen Cleanliness & UPI Reward System'}
                </p>
              </div>
            </div>

            {/* Demo Quick-Fill Button */}
            <button
              type="button"
              onClick={() => handleDemoFill(activePortal)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
              title="Auto-fill credentials for demonstration"
            >
              <Sparkles className="w-3 h-3" />
              <span>{t('demoFill')}</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Citizen Sub-tabs (Login / Register) */}
          {activePortal === 'citizen' && (
            <div className="flex rounded-xl bg-slate-950/60 p-1 mb-5 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setCitizenMode('login');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  citizenMode === 'login'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('login')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCitizenMode('register');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  citizenMode === 'register'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('register')}
              </button>
            </div>
          )}

          {/* FORMS */}
          {activePortal === 'citizen' && citizenMode === 'register' ? (
            /* Citizen Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('fullName')} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('emailOrPhone')} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@bengaluru.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('phoneNumber')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9845012345"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('selectWard')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none"
                  >
                    {bengaluruWards.map((w) => (
                      <option key={w} value={w} className="bg-slate-900 text-white">
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('upiIdLabel')}
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okhdfcbank / paytm"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-amber-300/80 mt-1">
                  Verified cash rewards will be deposited directly to this UPI address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('password')} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>{t('register')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Login Form (for Admin, Staff, or Citizen Sign In) */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {activePortal === 'staff'
                    ? `${t('staffIdLabel')} or Email`
                    : activePortal === 'admin'
                    ? 'Authorized Admin Email'
                    : t('emailOrPhone')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      activePortal === 'admin'
                        ? 'admin@bengaluru.gov.in'
                        : activePortal === 'staff'
                        ? 'staff.rajesh@bbmp.gov.in or BBMP-STAFF-048'
                        : 'citizen.darshan@gmail.com'
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Security info notes */}
              {activePortal === 'admin' && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-[11px] text-red-300/90 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Restricted Access: BBMP Officers & Administrators only.</span>
                </div>
              )}

              {activePortal === 'staff' && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/20 text-[11px] text-amber-300/90 flex items-center gap-2">
                  <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>BBMP Sanitation Staff: Enter official ID to see ward missions.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-xl active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer ${
                  activePortal === 'admin'
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 shadow-red-600/30'
                    : activePortal === 'staff'
                    ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-extrabold shadow-amber-600/30'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                }`}
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{t('login')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Direct Demonstration Quick Jump Shortcuts */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-[11px] text-slate-400 block mb-2">
              Demonstration Mode: Instant Test Sign-In
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => quickLoginDemo('citizen')}
                className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition cursor-pointer"
              >
                ⚡ Citizen Demo
              </button>
              <button
                type="button"
                onClick={() => quickLoginDemo('admin')}
                className="px-2.5 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium border border-red-500/30 transition cursor-pointer"
              >
                ⚡ Admin Demo
              </button>
              <button
                type="button"
                onClick={() => quickLoginDemo('staff')}
                className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/30 transition cursor-pointer"
              >
                ⚡ Staff Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Karnataka Helpline info */}
      <footer className="relative z-10 w-full px-4 py-3 border-t border-white/10 backdrop-blur-md bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t('helpdesk')}</span>
        </div>
        <div>
          <span>© 2026 Bruhat Bengaluru Mahanagara Palike (BBMP). All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
};
