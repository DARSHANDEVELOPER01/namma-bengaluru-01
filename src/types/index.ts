export type Role = 'admin' | 'citizen' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  ward?: string;
  zone?: string;
  upiId?: string;
  staffId?: string;
  badge?: string;
  avatarUrl?: string;
}

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Assigned to Field Staff'
  | 'Cleaning in Progress'
  | 'Completed'
  | 'Reward Approved'
  | 'Reward Paid'
  | 'Rejected';

export type GarbageCategory =
  | 'overflowing_bin'
  | 'illegal_dumping'
  | 'plastic_waste'
  | 'construction_debris'
  | 'sewage_overflow'
  | 'dead_animal'
  | 'other';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Complaint {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  citizenUpi: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  ward: string;
  zone?: string;
  category: GarbageCategory;
  description: string;
  severity: SeverityLevel;
  status: ComplaintStatus;
  submittedAt: string;
  rewardAmount: number;
  adminNotes?: string;
  rejectionReason?: string;
  staffId?: string;
  staffName?: string;
  staffAssignedAt?: string;
  beforeCleaningPhotoUrl?: string;
  afterCleaningPhotoUrl?: string;
  staffNotes?: string;
  completedAt?: string;
  paymentStatus?: 'Pending' | 'Approved' | 'Processing' | 'Paid' | 'Failed';
  paymentMethod?: 'PhonePe' | 'GooglePay' | 'BHIM' | 'Paytm';
  paymentUtr?: string;
  paidAt?: string;
}

export interface FieldStaff {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  ward: string;
  zone: string;
  activeTasks: number;
  completedTasks: number;
  isOnDuty: boolean;
  rating: number;
}

export interface RewardTransaction {
  id: string;
  complaintId: string;
  citizenId: string;
  citizenName: string;
  citizenUpi: string;
  amount: number;
  method: 'PhonePe' | 'GooglePay' | 'BHIM' | 'Paytm';
  status: 'Pending' | 'Approved' | 'Processing' | 'Paid' | 'Failed';
  utr: string;
  date: string;
  approvedBy: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // 'all' or specific user id or role
  role?: Role;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reward';
  read: boolean;
  timestamp: string;
  complaintId?: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleKn: string;
  content: string;
  contentKn: string;
  date: string;
  tag: string;
  important: boolean;
}

export interface SystemStats {
  totalCitizens: number;
  totalFieldStaff: number;
  totalComplaints: number;
  pendingComplaints: number;
  approvedComplaints: number;
  completedCleaningTasks: number;
  totalRewardsDistributed: number;
  pendingRewardPayments: number;
}
