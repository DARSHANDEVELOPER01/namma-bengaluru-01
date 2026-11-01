import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Coins,
  CheckCircle2,
  AlertCircle,
  Eye,
  CheckCircle,
  ChevronRight,
  HardHat,
  ArrowRight,
} from 'lucide-react';

interface CitizenComplaintsListProps {
  complaints: Complaint[];
  onRefresh: () => void;
}

export const CitizenComplaintsList: React.FC<CitizenComplaintsListProps> = ({
  complaints,
  onRefresh,
}) => {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paid'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // 8 Canonical Stages
  const stages: { key: ComplaintStatus; label: string; labelKn: string }[] = [
    { key: 'Submitted', label: '1. Submitted', labelKn: '೧. ಸಲ್ಲಿಸಲಾಗಿದೆ' },
    { key: 'Under Review', label: '2. Under Review', labelKn: '೨. ಪರಿಶೀಲನೆಯಲ್ಲಿ' },
    { key: 'Approved', label: '3. Approved', labelKn: '೩. ಅನುಮೋದನೆ' },
    { key: 'Assigned to Field Staff', label: '4. Staff Assigned', labelKn: '೪. ಸಿಬ್ಬಂದಿ ನಿಯೋಜನೆ' },
    { key: 'Cleaning in Progress', label: '5. Cleaning', labelKn: '೫. ಸ್ವಚ್ಛತೆ ಪ್ರಗತಿಯಲ್ಲಿ' },
    { key: 'Completed', label: '6. Completed', labelKn: '೬. ಪೂರ್ಣಗೊಂಡಿದೆ' },
    { key: 'Reward Approved', label: '7. Reward Approved', labelKn: '೭. ಬಹುಮಾನ ಅನುಮೋದನೆ' },
    { key: 'Reward Paid', label: '8. Reward Paid', labelKn: '೮. ಬಹುಮಾನ ಪಾವತಿ' },
  ];

  const getStageIndex = (status: ComplaintStatus): number => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'Under Review':
        return 1;
      case 'Approved':
        return 2;
      case 'Assigned to Field Staff':
        return 3;
      case 'Cleaning in Progress':
        return 4;
      case 'Completed':
        return 5;
      case 'Reward Approved':
        return 6;
      case 'Reward Paid':
        return 7;
      case 'Rejected':
        return -1;
      default:
        return 0;
    }
  };

  const filtered = complaints.filter((c) => {
    if (filter === 'active') {
      return (
        c.status === 'Submitted' ||
        c.status === 'Under Review' ||
        c.status === 'Approved' ||
        c.status === 'Assigned to Field Staff' ||
        c.status === 'Cleaning in Progress'
      );
    }
    if (filter === 'completed') {
      return c.status === 'Completed' || c.status === 'Reward Approved';
    }
    if (filter === 'paid') {
      return c.status === 'Reward Paid';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Count Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{language === 'kn' ? 'ನನ್ನ ವರದಿಗಳು ಮತ್ತು ಸ್ಥಿತಿ' : 'My Cleanliness Complaints'}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {complaints.length} Total
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of BBMP ground squad action and your UPI rewards.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10">
          {(['all', 'active', 'completed', 'paid'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition capitalize cursor-pointer ${
                filter === tab
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-white/10 p-8">
          <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">No complaints found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You have no cleanliness reports in this view. Use the "Report Garbage" tab to submit a new public waste report.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => {
            const currentStage = getStageIndex(item.status);
            const isPaid = item.status === 'Reward Paid';
            const isRejected = item.status === 'Rejected';

            return (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 hover:border-amber-500/40 transition shadow-lg backdrop-blur-md"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      {item.id}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">{item.ward}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {item.rewardAmount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                        <Coins className="w-3.5 h-3.5" />
                        <span>₹{item.rewardAmount}</span>
                      </span>
                    )}

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isRejected
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Complaint Body Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Photo Thumbnail */}
                  <div className="relative rounded-xl overflow-hidden aspect-video md:aspect-square bg-slate-950 border border-white/10 group cursor-pointer"
                       onClick={() => setSelectedComplaint(item)}>
                    <img
                      src={item.photoUrl}
                      alt="Garbage spot"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Eye className="w-4 h-4" />
                      <span>Inspect Photo</span>
                    </div>
                  </div>

                  {/* Address & GPS details */}
                  <div className="md:col-span-3 space-y-2">
                    <div className="flex items-start gap-1.5 text-xs text-slate-200">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{item.address}</span>
                        {item.landmark && (
                          <span className="text-slate-400 block text-[11px]">
                            Landmark: {item.landmark}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 italic">
                      "{item.description || 'Public garbage spot reported by citizen.'}"
                    </p>

                    {/* Staff Assigned & Action */}
                    {item.staffName && (
                      <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                        <HardHat className="w-3.5 h-3.5 text-amber-400" />
                        <span>BBMP Cleaning Squad:</span>
                        <strong className="text-white">{item.staffName}</strong>
                        <span className="text-[10px] text-slate-400">({item.staffId})</span>
                      </div>
                    )}

                    {/* Quick links & Google Maps */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <a
                        href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View GPS on Google Maps ({item.latitude.toFixed(4)}, {item.longitude.toFixed(4)})</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedComplaint(item)}
                        className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer ml-auto"
                      >
                        Detailed Status & Photos →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 8-STAGE VISUAL PROGRESS TRACKER */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      8-Stage Lifecycle Progress
                    </span>
                    <span className="text-[10px] font-bold text-amber-300">
                      {isRejected
                        ? 'Complaint Rejected'
                        : `Stage ${currentStage + 1} of 8: ${item.status}`}
                    </span>
                  </div>

                  {/* Step indicators */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {stages.map((stage, idx) => {
                      const isComplete = !isRejected && currentStage >= idx;
                      const isCurrent = !isRejected && currentStage === idx;

                      return (
                        <div
                          key={stage.key}
                          className={`p-1.5 rounded-lg text-center transition flex flex-col items-center justify-center border ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                              : isComplete
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 font-semibold'
                              : 'bg-slate-950/50 text-slate-500 border-white/5 text-[10px]'
                          }`}
                        >
                          <div className="text-[9px] truncate w-full">
                            {language === 'kn' ? stage.labelKn : stage.label}
                          </div>
                          {isComplete && !isCurrent && (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* If Reward Paid: Show Instant Receipt Banner */}
                {isPaid && item.paymentUtr && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        ₹
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          ₹{item.rewardAmount} Credited via {item.paymentMethod || 'UPI'}
                        </div>
                        <div className="text-[11px] text-emerald-300 font-mono">
                          Bank UTR Ref: {item.paymentUtr}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      Transferred to: <strong className="text-white">{item.citizenUpi}</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal: Before/After & GPS View */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {selectedComplaint.id}
                </span>
                <h4 className="text-lg font-black text-white">{selectedComplaint.address}</h4>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Before and After Side by Side */}
            <div>
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Garbage Verification & Cleaning Proof
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold text-red-400 block mb-1">
                    REPORTED DIRTY SPOT (CITIZEN PHOTO)
                  </span>
                  <img
                    src={selectedComplaint.photoUrl}
                    alt="Reported spot"
                    className="w-full h-44 object-cover rounded-lg"
                  />
                </div>

                <div className="bg-slate-950 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold text-emerald-400 block mb-1">
                    AFTER CLEANING (BBMP SQUAD PROOF)
                  </span>
                  {selectedComplaint.afterCleaningPhotoUrl ? (
                    <img
                      src={selectedComplaint.afterCleaningPhotoUrl}
                      alt="Cleaned proof"
                      className="w-full h-44 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-44 flex flex-col items-center justify-center bg-slate-900/50 rounded-lg text-slate-500 text-xs">
                      <Clock className="w-6 h-6 mb-1" />
                      <span>Cleaning proof will be uploaded by field squad</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin notes & Staff notes */}
            {selectedComplaint.staffNotes && (
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs">
                <span className="text-amber-400 font-bold block mb-0.5">Field Staff Log:</span>
                <p className="text-slate-300">{selectedComplaint.staffNotes}</p>
              </div>
            )}

            {selectedComplaint.adminNotes && (
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs">
                <span className="text-blue-400 font-bold block mb-0.5">Admin Verification Note:</span>
                <p className="text-slate-300">{selectedComplaint.adminNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
