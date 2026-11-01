import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AppNotification } from '../types';
import {
  LogOut,
  Bell,
  Globe,
  ShieldCheck,
  User,
  HardHat,
  Info,
  PhoneCall,
  CheckCircle,
  Clock,
  Coins,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenAboutModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAboutModal }) => {
  const { user, logout, token } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}&role=${user.role}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data: AppNotification[] = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.read).length);
        }
      } catch (e) {
        console.error('Failed to load notifications', e);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user, token]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      {/* Karnataka flag ribbon accent top border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#CE1126] via-[#FCD116] to-[#CE1126]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-amber-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-amber-400 text-sm">
              ಬೆಂ
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
                {language === 'kn' ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ' : 'Govt of Karnataka'}
              </span>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-medium">BBMP</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {t('appName')}
              </h1>
              <span className="hidden md:inline-block text-[11px] text-amber-300/80 border-l border-white/20 pl-2">
                {t('tagline')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions: User info, Role badge, Notifications, Language, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                user.role === 'admin'
                  ? 'bg-red-500/20 text-red-400'
                  : user.role === 'staff'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {user.role === 'admin' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : user.role === 'staff' ? (
                <HardHat className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{user.name}</span>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-extrabold ${
                    user.role === 'admin'
                      ? 'bg-red-500/30 text-red-300'
                      : user.role === 'staff'
                      ? 'bg-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                {user.ward || user.zone || user.badge || 'Bengaluru Citizen'}
              </div>
            </div>
          </div>

          {/* About / VS Code Setup Guide Modal Trigger */}
          <button
            onClick={onOpenAboutModal}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
            title="About Mission & Project Details"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Notifications</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`p-2.5 rounded-xl transition text-left cursor-pointer border ${
                          n.read
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
                            : 'bg-slate-800/70 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {n.type === 'reward' ? (
                              <Coins className="w-4 h-4 text-amber-400" />
                            ) : n.type === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">{n.title}</div>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-slate-500 block mt-1">
                              {new Date(n.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bilingual Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition cursor-pointer"
            title="Switch Language / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition cursor-pointer"
            title={t('logout')}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
