import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Complaint } from '../../types';
import { InteractiveMap } from '../InteractiveMap';
import { THEME_IMAGES } from '../../assets/themeImages';
import {
  HardHat,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  Clock,
  ExternalLink,
  Navigation,
  Send,
  AlertTriangle,
  Sparkles,
  Phone,
  Calendar,
  X,
  Eye,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();

  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'in_progress' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);

  // Before & After upload states for modal
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [staffNotes, setStaffNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isOnDuty, setIsOnDuty] = useState<boolean>(true);

  // Active camera state
  const [activeCameraTarget, setActiveCameraTarget] = useState<'before' | 'after' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/complaints?role=staff&userId=${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, token]);

  const startCamera = async (target: 'before' | 'after') => {
    try {
      setActiveCameraTarget(target);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera failed', err);
      alert('Camera access unavailable. Please use file upload.');
      setActiveCameraTarget(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setActiveCameraTarget(null);
  };

  const capturePhoto = (target: 'before' | 'after') => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      if (target === 'before') setBeforePhoto(dataUrl);
      if (target === 'after') setAfterPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === 'before') setBeforePhoto(reader.result as string);
      if (target === 'after') setAfterPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStartCleaning = async (task: Complaint) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${task.id}/staff-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Cleaning in Progress',
          beforeCleaningPhotoUrl: beforePhoto || task.photoUrl,
          staffNotes: 'Squad arrived on site. Clearance operations underway.',
        }),
      });

      if (res.ok) {
        await fetchTasks();
        setSelectedTask(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitCompleted = async (task: Complaint) => {
    if (!afterPhoto && !task.afterCleaningPhotoUrl) {
      alert('Please capture or upload an AFTER-CLEANING photograph as proof.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${task.id}/staff-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Completed',
          beforeCleaningPhotoUrl: beforePhoto || task.beforeCleaningPhotoUrl || task.photoUrl,
          afterCleaningPhotoUrl: afterPhoto || task.afterCleaningPhotoUrl,
          staffNotes: staffNotes || 'Debris removed, sidewalk swept, and lime powder sprayed.',
        }),
      });

      if (res.ok) {
        await fetchTasks();
        setSelectedTask(null);
        setBeforePhoto(null);
        setAfterPhoto(null);
        setStaffNotes('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'assigned') return t.status === 'Assigned to Field Staff' || t.status === 'Approved';
    if (filter === 'in_progress') return t.status === 'Cleaning in Progress';
    if (filter === 'completed') return t.status === 'Completed' || t.status === 'Reward Paid';
    return true;
  });

  return (
    <div className="min-h-screen text-slate-100 pb-16">
      {/* Background with Vidhana Soudha & Karnataka Theme */}
      <div className="fixed inset-0 -z-10">
        <img
          src={THEME_IMAGES.vidhanaSoudhaSunset}
          alt="Karnataka Vidhana Soudha"
          className="w-full h-full object-cover object-center filter brightness-[0.25] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Staff Header Hero Card */}
        <div className="p-6 rounded-3xl bg-slate-900/85 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <HardHat className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                  BBMP FIELD SANITATION WARRIOR
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {user?.staffId || 'BBMP-STAFF-048'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{user?.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {user?.ward || 'Ward 112 - Domlur / Indiranagar'} • {user?.zone || 'East Zone'}
              </p>
            </div>
          </div>

          {/* On-Duty toggle & Stats */}
          <div className="flex items-center gap-3">
            <div className="text-right pr-4 border-r border-white/10 hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Sanitation Rating
              </span>
              <span className="text-lg font-black text-amber-400">★ 4.9 / 5.0</span>
            </div>

            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                isOnDuty
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnDuty ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span>{isOnDuty ? 'On Duty (Active)' : 'Off Duty'}</span>
            </button>
          </div>
        </div>

        {/* Task Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <span className="text-xs text-slate-400 font-semibold block">Total Missions</span>
            <span className="text-2xl font-black text-white">{tasks.length}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md">
            <span className="text-xs text-amber-300 font-semibold block">Assigned / Ready</span>
            <span className="text-2xl font-black text-amber-400">
              {tasks.filter((t) => t.status === 'Assigned to Field Staff' || t.status === 'Approved').length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 backdrop-blur-md">
            <span className="text-xs text-blue-300 font-semibold block">In Progress</span>
            <span className="text-2xl font-black text-blue-400">
              {tasks.filter((t) => t.status === 'Cleaning in Progress').length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md">
            <span className="text-xs text-emerald-300 font-semibold block">Cleaned & Certified</span>
            <span className="text-2xl font-black text-emerald-400">
              {tasks.filter((t) => t.status === 'Completed' || t.status === 'Reward Paid').length}
            </span>
          </div>
        </div>

        {/* Task Filtering Tabs */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>{t('myAssignedTasks')}</span>
            <span className="text-xs text-amber-400">({filteredTasks.length})</span>
          </h3>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10">
            {(['all', 'assigned', 'in_progress', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition capitalize cursor-pointer ${
                  filter === tab
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-white/10 p-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-white">All clean! No pending tasks</h4>
            <p className="text-xs text-slate-400 mt-1">
              No tasks currently waiting in this filter. New citizen reports will automatically appear here once assigned by the administrator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const isAssigned = task.status === 'Assigned to Field Staff' || task.status === 'Approved';
              const isInProgress = task.status === 'Cleaning in Progress';
              const isCompleted = task.status === 'Completed' || task.status === 'Reward Paid';

              return (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-500/40 transition shadow-xl backdrop-blur-md flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top */}
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {task.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.severity === 'Critical'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {task.severity} Priority
                        </span>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isInProgress
                            ? 'bg-blue-500/20 text-blue-300 animate-pulse'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {/* Image & Details */}
                    <div className="flex gap-3 mb-3">
                      <img
                        src={task.photoUrl}
                        alt="Garbage spot"
                        className="w-24 h-24 object-cover rounded-xl border border-white/10 shrink-0"
                      />
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-white line-clamp-1">
                          {task.address}
                        </div>
                        {task.landmark && (
                          <div className="text-[11px] text-amber-300/80">
                            Landmark: {task.landmark}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                          "{task.description}"
                        </p>
                        <div className="text-[10px] text-slate-400">
                          Reported by: {task.citizenName} ({task.citizenPhone})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    {/* Google Maps Directions */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t('openDirections')}</span>
                    </a>

                    {/* Task Progress Buttons */}
                    {isAssigned && (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setBeforePhoto(task.photoUrl);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow"
                      >
                        {t('markInProgress')}
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow"
                      >
                        Submit Cleaned Proof →
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
                      >
                        View Verification Proof
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Proof Upload & Task Completion Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-base font-bold text-white">
                    Cleanliness Mission: {selectedTask.id}
                  </h4>
                  <p className="text-xs text-slate-400">{selectedTask.address}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setSelectedTask(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Viewfinder if open */}
            {activeCameraTarget && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-lg mx-auto border border-amber-500/50">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => capturePhoto(activeCameraTarget)}
                    className="px-5 py-2 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xl"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take {activeCameraTarget.toUpperCase()} Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs border border-white/20 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Before and After Upload Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BEFORE Photo Box */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                  1. Before-Cleaning Photo
                </span>
                {beforePhoto || selectedTask.beforeCleaningPhotoUrl || selectedTask.photoUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                    <img
                      src={
                        beforePhoto ||
                        selectedTask.beforeCleaningPhotoUrl ||
                        selectedTask.photoUrl
                      }
                      alt="Before cleaning"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                    No photo yet
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera('before')}
                    className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera</span>
                  </button>
                  <label className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'before')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* AFTER Photo Box */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  2. After-Cleaning Photo (Proof)
                </span>
                {afterPhoto || selectedTask.afterCleaningPhotoUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                    <img
                      src={afterPhoto || selectedTask.afterCleaningPhotoUrl}
                      alt="After cleaning"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                    Must capture after clean
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera('after')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera</span>
                  </button>
                  <label className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'after')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Cleaning Staff Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Field Squad Clearance Notes:
              </label>
              <textarea
                rows={2}
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="e.g. Cleared 250kg waste, disinfected with bleaching powder, tipper truck completed pickup."
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              {selectedTask.status === 'Assigned to Field Staff' ||
              selectedTask.status === 'Approved' ? (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStartCleaning(selectedTask)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer"
                >
                  {isUpdating ? 'Starting...' : 'Confirm: Start Cleaning Mission'}
                </button>
              ) : selectedTask.status === 'Cleaning in Progress' ? (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleSubmitCompleted(selectedTask)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
                >
                  {isUpdating ? 'Submitting...' : 'Certify Cleaned & Notify Admin →'}
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-semibold">
                  ✓ Mission Completed & Certified
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
