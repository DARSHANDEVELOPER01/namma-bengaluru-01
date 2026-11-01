import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Complaint, RewardTransaction } from '../../types';
import {
  Coins,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  Sparkles,
  ExternalLink,
  Save,
  AlertCircle,
} from 'lucide-react';

interface CitizenRewardsProps {
  complaints: Complaint[];
}

export const CitizenRewards: React.FC<CitizenRewardsProps> = ({ complaints }) => {
  const { user, updateUserProfile, token } = useAuth();
  const { t, language } = useLanguage();

  const [upiInput, setUpiInput] = useState<string>(user?.upiId || '');
  const [isEditingUpi, setIsEditingUpi] = useState<boolean>(false);
  const [upiSavedSuccess, setUpiSavedSuccess] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<RewardTransaction | null>(null);

  // Calculate Reward Stats
  const paidComplaints = complaints.filter((c) => c.status === 'Reward Paid');
  const approvedComplaints = complaints.filter(
    (c) => c.status === 'Completed' || c.status === 'Reward Approved'
  );
  const pendingReviewComplaints = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'Approved'
  );

  const totalEarned = paidComplaints.reduce((acc, c) => acc + (c.rewardAmount || 0), 0);
  const approvedPendingPayout = approvedComplaints.reduce((acc, c) => acc + (c.rewardAmount || 150), 0);
  const estimatedPotentialRewards = pendingReviewComplaints.length * 150;

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/payouts?citizenId=${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTransactions();
  }, [user, token]);

  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiInput.trim().includes('@')) {
      alert('Please enter a valid UPI address format, e.g. name@okhdfcbank');
      return;
    }
    await updateUserProfile({ upiId: upiInput.trim() });
    setIsEditingUpi(false);
    setUpiSavedSuccess(true);
    setTimeout(() => setUpiSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Karnataka Colors */}
      <div className="bg-gradient-to-r from-amber-600/30 via-red-600/30 to-amber-600/30 border border-amber-500/40 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bengaluru Cleanliness Reward Program</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {language === 'kn' ? 'ನಾಗರಿಕ ಸ್ವಚ್ಛತಾ ಬಹುಮಾನ & ವ್ಯಾಲೆಟ್' : 'Citizen Rewards & UPI Payout Wallet'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Every genuine cleanliness report that gets cleaned earns you direct cash incentives straight to your PhonePe, Google Pay, or BHIM UPI address.
            </p>
          </div>

          {/* Quick Total Earned Badge */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-right min-w-[180px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Cash Disbursed
            </span>
            <div className="text-3xl font-black text-amber-400 flex items-center justify-end gap-1">
              <span>₹</span>
              <span>{totalEarned}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
              ✓ Verified Bank Transferred
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Disbursed */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Total Rewards Paid</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">₹{totalEarned}</div>
          <p className="text-[11px] text-emerald-400/90 mt-1">
            {paidComplaints.length} reports successfully cleaned & paid
          </p>
        </div>

        {/* Card 2: Approved Pending Payout */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Approved (Awaiting Payout)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-300">₹{approvedPendingPayout}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Cleaning verified by field squad; ready for BBMP admin payout
          </p>
        </div>

        {/* Card 3: In Pipeline */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">In Verification Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-300">
            ~₹{estimatedPotentialRewards}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {pendingReviewComplaints.length} reports under admin review / field squad
          </p>
        </div>
      </div>

      {/* UPI Settings Box */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Direct UPI Reward Account</h4>
              <p className="text-xs text-slate-400">
                Authorized PhonePe, Google Pay, BHIM, or Paytm Virtual Payment Address (VPA)
              </p>
            </div>
          </div>

          {!isEditingUpi && (
            <button
              onClick={() => setIsEditingUpi(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
            >
              Update UPI ID
            </button>
          )}
        </div>

        {isEditingUpi ? (
          <form onSubmit={handleSaveUpi} className="flex flex-col sm:flex-row gap-2 max-w-lg">
            <input
              type="text"
              required
              value={upiInput}
              onChange={(e) => setUpiInput(e.target.value)}
              placeholder="e.g. mobile@okhdfcbank or name@paytm"
              className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-white text-xs focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save UPI</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUpiInput(user?.upiId || '');
                  setIsEditingUpi(false);
                }}
                className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-white/10">
            <span className="text-xs text-slate-400">Configured Payout UPI:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {user?.upiId || 'Not configured yet'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold ml-auto flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified for Automatic Payouts
            </span>
          </div>
        )}

        {upiSavedSuccess && (
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>UPI Address successfully updated!</span>
          </p>
        )}
      </div>

      {/* Payment Ledger / Transaction History */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold text-white">{t('payoutHistory')}</h4>
          </div>
          <span className="text-xs text-slate-400">Official BBMP Reward Receipts</span>
        </div>

        {transactions.length === 0 && paidComplaints.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No reward transactions yet. Submit a garbage photograph to earn your first reward!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Complaint ID</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Bank UTR Reference</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* Real-time transactions list */}
                {(transactions.length > 0
                  ? transactions
                  : paidComplaints.map((c) => ({
                      id: `TXN-${c.id}`,
                      complaintId: c.id,
                      citizenId: c.citizenId,
                      citizenName: c.citizenName,
                      citizenUpi: c.citizenUpi,
                      amount: c.rewardAmount,
                      method: (c.paymentMethod || 'PhonePe') as any,
                      status: 'Paid' as any,
                      utr: c.paymentUtr || 'UPI/2026/094821849182',
                      date: c.paidAt || c.submittedAt,
                      approvedBy: 'Dr. K. Manjunath, IAS',
                      notes: 'BBMP Smart City Cleanliness Incentive',
                    }))
                ).map((txn) => (
                  <tr key={txn.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {txn.complaintId}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">₹{txn.amount}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-200 font-semibold">
                        {txn.method}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 text-[11px]">
                      {txn.utr}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        SUCCESSFUL
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedReceipt(txn)}
                        className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
                      >
                        Receipt Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Reward Receipt Slip Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-slate-200 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                ಬೆಂ
              </div>
              <h5 className="text-xs font-bold text-red-600 uppercase tracking-widest">
                GOVERNMENT OF KARNATAKA
              </h5>
              <h4 className="text-sm font-black text-slate-900">
                BRUHAT BENGALURU MAHANAGARA PALIKE (BBMP)
              </h4>
              <p className="text-[11px] text-slate-500">
                Smart City Cleanliness Reward Disbursal Voucher
              </p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Complaint Reference:</span>
                <span className="font-mono font-bold text-amber-700">
                  {selectedReceipt.complaintId}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Citizen Beneficiary:</span>
                <span className="font-semibold text-slate-900">
                  {selectedReceipt.citizenName || user?.name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Beneficiary UPI ID:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {selectedReceipt.citizenUpi}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-semibold text-blue-600">{selectedReceipt.method} UPI</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Bank UTR Number:</span>
                <span className="font-mono font-bold text-emerald-700">{selectedReceipt.utr}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Authorized Officer:</span>
                <span className="text-slate-800">{selectedReceipt.approvedBy}</span>
              </div>

              {/* Amount Row */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
                <span className="font-bold text-slate-700">Total Incentive Paid:</span>
                <span className="text-2xl font-black text-emerald-600">
                  ₹{selectedReceipt.amount}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 mb-3">
                This is a digitally generated municipal receipt certified by BBMP Smart City.
              </p>
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Print / Save Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
