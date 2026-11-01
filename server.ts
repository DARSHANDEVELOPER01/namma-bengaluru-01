import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { Complaint, AppNotification, RewardTransaction } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// ----------------------------------------------------
// IN-MEMORY / PERSISTENT MOCK DATABASE FOR FULL-STACK
// ----------------------------------------------------

interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Plain/hashed comparison for demo
  role: 'admin' | 'citizen' | 'staff';
  phone?: string;
  ward?: string;
  zone?: string;
  upiId?: string;
  staffId?: string;
  badge?: string;
  avatarUrl?: string;
}

const users: DbUser[] = [
  {
    id: 'user-admin-1',
    name: 'Dr. K. Manjunath, IAS',
    email: 'admin@bengaluru.gov.in',
    passwordHash: 'Admin@123',
    role: 'admin',
    phone: '080-22660001',
    badge: 'Chief Municipal Commissioner, BBMP',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-citizen-1',
    name: 'Darshan Gowda',
    email: 'citizen.darshan@gmail.com',
    passwordHash: 'Citizen@123',
    role: 'citizen',
    phone: '9845012345',
    ward: 'Ward 112 - Domlur / Indiranagar',
    zone: 'East Zone',
    upiId: 'darshankr2604@okhdfcbank',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-staff-1',
    name: 'Rajesh Nayak',
    email: 'staff.rajesh@bbmp.gov.in',
    passwordHash: 'Staff@123',
    role: 'staff',
    staffId: 'BBMP-STAFF-048',
    phone: '9845099881',
    ward: 'Ward 112 - Domlur / Indiranagar',
    zone: 'East Zone',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

const fieldStaffList = [
  {
    id: 'user-staff-1',
    staffId: 'BBMP-STAFF-048',
    name: 'Rajesh Nayak',
    email: 'staff.rajesh@bbmp.gov.in',
    phone: '9845099881',
    ward: 'Ward 112 - Domlur / Indiranagar',
    zone: 'East Zone',
    activeTasks: 1,
    completedTasks: 34,
    isOnDuty: true,
    rating: 4.9,
  },
  {
    id: 'user-staff-2',
    staffId: 'BBMP-STAFF-072',
    name: 'Suresh Kumar',
    email: 'staff.suresh@bbmp.gov.in',
    phone: '9845077123',
    ward: 'Ward 151 - Koramangala',
    zone: 'South Zone',
    activeTasks: 2,
    completedTasks: 48,
    isOnDuty: true,
    rating: 4.8,
  },
  {
    id: 'user-staff-3',
    staffId: 'BBMP-STAFF-105',
    name: 'Venkatesh Murthy',
    email: 'staff.venkatesh@bbmp.gov.in',
    phone: '9845066442',
    ward: 'Ward 45 - Malleshwaram',
    zone: 'West Zone',
    activeTasks: 0,
    completedTasks: 52,
    isOnDuty: true,
    rating: 4.95,
  },
  {
    id: 'user-staff-4',
    staffId: 'BBMP-STAFF-142',
    name: 'Anand Kumar Swamy',
    email: 'staff.anand@bbmp.gov.in',
    phone: '9845033991',
    ward: 'Ward 168 - Jayanagar 4th Block',
    zone: 'South Zone',
    activeTasks: 1,
    completedTasks: 29,
    isOnDuty: true,
    rating: 4.7,
  },
];

let complaints: Complaint[] = [
  {
    id: 'BLR-2026-1042',
    citizenId: 'user-citizen-1',
    citizenName: 'Darshan Gowda',
    citizenPhone: '9845012345',
    citizenUpi: 'darshankr2604@okhdfcbank',
    photoUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
    latitude: 12.9784,
    longitude: 77.6408,
    address: '100 Feet Road, Near Metro Pillar 42, Indiranagar',
    landmark: 'Behind CMH Road Junction',
    ward: 'Ward 112 - Domlur / Indiranagar',
    zone: 'East Zone',
    category: 'overflowing_bin',
    description: 'Large commercial bin overflowing across footpath. Foul odor spreading to bus shelter.',
    severity: 'High',
    status: 'Reward Paid',
    submittedAt: '2026-10-29T10:15:00Z',
    rewardAmount: 200,
    adminNotes: 'Genuine violation confirmed by ward supervisor. Approved for ₹200 incentive.',
    staffId: 'BBMP-STAFF-048',
    staffName: 'Rajesh Nayak',
    staffAssignedAt: '2026-10-29T11:00:00Z',
    beforeCleaningPhotoUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
    afterCleaningPhotoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    staffNotes: 'Cleared 320kg wet waste, disinfected bin area with lime powder and swept sidewalk.',
    completedAt: '2026-10-29T14:30:00Z',
    paymentStatus: 'Paid',
    paymentMethod: 'PhonePe',
    paymentUtr: 'UPI/2026/094821849182',
    paidAt: '2026-10-29T16:00:00Z',
  },
  {
    id: 'BLR-2026-1088',
    citizenId: 'user-citizen-1',
    citizenName: 'Darshan Gowda',
    citizenPhone: '9845012345',
    citizenUpi: 'darshankr2604@okhdfcbank',
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    latitude: 12.9352,
    longitude: 77.6245,
    address: '80 Feet Road, 4th Block, Koramangala',
    landmark: 'Opposite Sony World Signal side park',
    ward: 'Ward 151 - Koramangala',
    zone: 'South Zone',
    category: 'construction_debris',
    description: 'Truck illegally unloaded concrete rubble and sand bags on the pedestrian walkway.',
    severity: 'Critical',
    status: 'Cleaning in Progress',
    submittedAt: '2026-10-30T09:20:00Z',
    rewardAmount: 250,
    adminNotes: 'Illegal dumping verified. BBMP JCB and tipper truck dispatched with squad.',
    staffId: 'BBMP-STAFF-048',
    staffName: 'Rajesh Nayak',
    staffAssignedAt: '2026-10-30T10:05:00Z',
    beforeCleaningPhotoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    staffNotes: 'Tipper truck arrived. Loading debris now.',
  },
  {
    id: 'BLR-2026-1104',
    citizenId: 'user-citizen-1',
    citizenName: 'Darshan Gowda',
    citizenPhone: '9845012345',
    citizenUpi: 'darshankr2604@okhdfcbank',
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    latitude: 13.0031,
    longitude: 77.5685,
    address: '8th Cross Market Road, Malleshwaram',
    landmark: 'Near Sampige Theater Cross',
    ward: 'Ward 45 - Malleshwaram',
    zone: 'West Zone',
    category: 'plastic_waste',
    description: 'Discarded single-use plastics and packaging boxes left on roadside corner.',
    severity: 'Medium',
    status: 'Under Review',
    submittedAt: '2026-10-31T14:10:00Z',
    rewardAmount: 100,
    adminNotes: '',
  },
  {
    id: 'BLR-2026-1115',
    citizenId: 'user-citizen-2',
    citizenName: 'Priya Raman',
    citizenPhone: '9845088221',
    citizenUpi: 'priya.raman@icici',
    photoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
    latitude: 12.9299,
    longitude: 77.5824,
    address: '11th Main, 4th T Block, Jayanagar',
    landmark: 'Adjacent to Jayanagar BDA Complex',
    ward: 'Ward 168 - Jayanagar 4th Block',
    zone: 'South Zone',
    category: 'overflowing_bin',
    description: 'Broken secondary waste collection container with garbage spilling into stormwater drain.',
    severity: 'High',
    status: 'Approved',
    submittedAt: '2026-10-31T16:45:00Z',
    rewardAmount: 175,
    adminNotes: 'Inspection team verified. Allocated ₹175 reward on clearance.',
  },
  {
    id: 'BLR-2026-1120',
    citizenId: 'user-citizen-3',
    citizenName: 'Karthik Rao',
    citizenPhone: '9845044556',
    citizenUpi: 'karthik.rao@upi',
    photoUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?w=800&auto=format&fit=crop&q=80',
    latitude: 12.9863,
    longitude: 77.7301,
    address: 'ITPL Main Road, Whitefield',
    landmark: 'Near Hope Farm Junction',
    ward: 'Ward 84 - Hagadur / Whitefield',
    zone: 'Mahadevapura Zone',
    category: 'sewage_overflow',
    description: 'Choked public drainage causing dark water stagnation on the side lane.',
    severity: 'Critical',
    status: 'Completed',
    submittedAt: '2026-10-31T08:00:00Z',
    rewardAmount: 300,
    adminNotes: 'Verified genuine emergency. Cleared by suction squad.',
    staffId: 'BBMP-STAFF-072',
    staffName: 'Suresh Kumar',
    staffAssignedAt: '2026-10-31T08:45:00Z',
    beforeCleaningPhotoUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?w=800&auto=format&fit=crop&q=80',
    afterCleaningPhotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    staffNotes: 'Drain unclogged using jetting machine. Debris extracted and road sanitized.',
    completedAt: '2026-10-31T13:10:00Z',
    paymentStatus: 'Approved',
  },
];

let rewardTransactions: RewardTransaction[] = [
  {
    id: 'TXN-902148',
    complaintId: 'BLR-2026-1042',
    citizenId: 'user-citizen-1',
    citizenName: 'Darshan Gowda',
    citizenUpi: 'darshankr2604@okhdfcbank',
    amount: 200,
    method: 'PhonePe',
    status: 'Paid',
    utr: 'UPI/2026/094821849182',
    date: '2026-10-29T16:00:00Z',
    approvedBy: 'Dr. K. Manjunath, IAS',
    notes: 'Citizen verified cleanup incentive',
  },
];

let announcements = [
  {
    id: 'ann-1',
    title: 'Namma Bengaluru Swachh Utsav 2026: Earn 2X Rewards',
    titleKn: 'ನಮ್ಮ ಬೆಂಗಳೂರು ಸ್ವಚ್ಛ ಉತ್ಸವ 2026: 2X ದ್ವಿಗುಣ ಬಹುಮಾನ ಗಳಿಸಿ',
    content: 'Special civic campaign across all 198 wards. Report commercial garbage blackspots and earn verified rewards up to ₹500 directly via UPI.',
    contentKn: 'ಎಲ್ಲಾ 198 ವಾರ್ಡ್‌ಗಳಲ್ಲಿ ವಿಶೇಷ ಸ್ವಚ್ಛತಾ ಆಂದೋಲನ. ಕಸದ ಸ್ಥಳಗಳನ್ನು ವರದಿ ಮಾಡಿ ₹500 ವರೆಗೆ ನೇರ ಯುಪಿಐ ಬಹುಮಾನ ಪಡೆಯಿರಿ.',
    date: '2026-10-30',
    tag: 'CAMPAIGN',
    important: true,
  },
  {
    id: 'ann-2',
    title: 'BBMP Quick Response Jetting Squads Deployed',
    titleKn: 'ಬಿಬಿಎಂಪಿ ತ್ವರಿತ ಸ್ವಚ್ಛತಾ ಕಾರ್ಯಪಡೆ ನಿಯೋಜನೆ',
    content: 'Over 85 specialized quick response vehicles have been assigned to clear stormwater drains and illegal debris in high density corridors.',
    contentKn: 'ಮಳೆಗಾಲದ ಮುನ್ನೆಚ್ಚರಿಕೆಯಾಗಿ ಚರಂಡಿ ಹಾಗೂ ಕಸ ತೆರವುಗೊಳಿಸಲು 85 ತ್ವರಿತ ವಾಹನಗಳನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ.',
    date: '2026-10-28',
    tag: 'FIELD SQUAD',
    important: false,
  },
  {
    id: 'ann-3',
    title: 'Citizen Cleanliness Helpline 1533 24x7 Active',
    titleKn: 'ನಾಗರಿಕರ ಸ್ವಚ್ಛತಾ ಸಹಾಯವಾಣಿ 1533 ದಿನದ 24 ಗಂಟೆಯೂ ಸಕ್ರಿಯ',
    content: 'Call toll-free 1533 or BBMP WhatsApp Control Room 080-22660000 for emergency sanitation issues.',
    contentKn: 'ತುರ್ತು ನೈರ್ಮಲ್ಯ ಸಮಸ್ಯೆಗಳಿಗೆ ಟೋಲ್ ಫ್ರೀ 1533 ಅಥವಾ ವಾಟ್ಸಾಪ್ 080-22660000 ಗೆ ಸಂಪರ್ಕಿಸಿ.',
    date: '2026-10-25',
    tag: 'HELPLINE',
    important: false,
  },
];

let notifications: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-citizen-1',
    title: 'Reward Credited: ₹200 Paid to your UPI!',
    message: 'Your report BLR-2026-1042 was verified and cleaned. ₹200 credited via PhonePe (UTR: UPI/2026/094821849182).',
    type: 'reward',
    read: false,
    timestamp: '2026-10-29T16:05:00Z',
    complaintId: 'BLR-2026-1042',
  },
  {
    id: 'notif-2',
    userId: 'user-staff-1',
    title: 'New Mission Assigned: BLR-2026-1088',
    message: 'Construction debris on 80ft Road, Koramangala assigned to your squad. Priority: Critical.',
    type: 'warning',
    read: false,
    timestamp: '2026-10-30T10:05:00Z',
    complaintId: 'BLR-2026-1088',
  },
];

// Helper: generate token & sanitize user
const createSessionToken = (user: DbUser) => {
  return Buffer.from(JSON.stringify({ id: user.id, role: user.role, email: user.email, time: Date.now() })).toString('base64');
};

const sanitizeUser = (user: DbUser) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, portalRole } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email/Identifier and password are required' });
  }

  const query = email.trim().toLowerCase();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === query ||
      (u.phone && u.phone === query) ||
      (u.staffId && u.staffId.toLowerCase() === query)
  );

  if (!user) {
    return res.status(401).json({ error: 'Account not found. Please check credentials or register.' });
  }

  // Role validation: user must match portal if requested
  if (portalRole && user.role !== portalRole) {
    return res.status(403).json({
      error: `Access denied. This is the ${portalRole.toUpperCase()} portal. You cannot login here with a ${user.role.toUpperCase()} account.`,
    });
  }

  if (user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid password. Please try again.' });
  }

  const token = createSessionToken(user);
  res.json({
    token,
    user: sanitizeUser(user),
  });
});

// 2. Auth: Register Citizen
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, ward, upiId, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newUser: DbUser = {
    id: `user-citizen-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    ward: ward || 'Ward 112 - Domlur / Indiranagar',
    zone: 'East Zone',
    upiId: upiId ? upiId.trim() : '',
    role: 'citizen',
    passwordHash: password,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
  };

  users.push(newUser);

  const token = createSessionToken(newUser);
  res.status(201).json({
    token,
    user: sanitizeUser(newUser),
  });
});

// 3. Auth: Verify / Me
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  try {
    const raw = Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString('utf8');
    const parsed = JSON.parse(raw);
    const user = users.find((u) => u.id === parsed.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }
    return res.json({ user: sanitizeUser(user) });
  } catch {
    return res.status(401).json({ error: 'Invalid session token.' });
  }
});

// 4. Update Profile
app.patch('/api/users/profile', (req: Request, res: Response) => {
  const { userId, phone, upiId, ward } = req.body;
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (phone !== undefined) user.phone = phone;
  if (upiId !== undefined) user.upiId = upiId;
  if (ward !== undefined) user.ward = ward;

  res.json({ user: sanitizeUser(user) });
});

// 5. Get Complaints (Filtered by role / user)
app.get('/api/complaints', (req: Request, res: Response) => {
  const { role, userId } = req.query;

  if (role === 'citizen' && userId) {
    const userComplaints = complaints.filter((c) => c.citizenId === userId);
    return res.json(userComplaints);
  }

  if (role === 'staff' && userId) {
    const staffUser = users.find((u) => u.id === userId);
    const staffId = staffUser?.staffId || '';
    // Staff sees tasks assigned to them or unassigned in their ward
    const staffComplaints = complaints.filter(
      (c) => c.staffId === staffId || (c.status === 'Approved' && c.ward === staffUser?.ward)
    );
    return res.json(staffComplaints);
  }

  // Admin sees all
  res.json(complaints);
});

// 6. Submit New Complaint (Citizen)
app.post('/api/complaints', (req: Request, res: Response) => {
  const {
    citizenId,
    citizenName,
    citizenPhone,
    citizenUpi,
    photoUrl,
    latitude,
    longitude,
    address,
    landmark,
    ward,
    category,
    description,
    severity,
  } = req.body;

  if (!photoUrl) {
    return res.status(400).json({ error: 'Garbage photograph is mandatory.' });
  }

  const complaintId = `BLR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newComplaint: Complaint = {
    id: complaintId,
    citizenId: citizenId || 'user-citizen-1',
    citizenName: citizenName || 'Darshan Gowda',
    citizenPhone: citizenPhone || '9845012345',
    citizenUpi: citizenUpi || 'darshankr2604@okhdfcbank',
    photoUrl,
    latitude: Number(latitude) || 12.9716,
    longitude: Number(longitude) || 77.5946,
    address: address || 'Bengaluru Municipal Ward',
    landmark: landmark || '',
    ward: ward || 'Ward 112 - Domlur / Indiranagar',
    zone: 'East Zone',
    category: category || 'illegal_dumping',
    description: description || 'Public waste spot reported.',
    severity: severity || 'Medium',
    status: 'Submitted',
    submittedAt: new Date().toISOString(),
    rewardAmount: 0,
  };

  complaints.unshift(newComplaint);

  // Push notification to Admin
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: 'all',
    role: 'admin',
    title: `New Report ${complaintId}`,
    message: `New cleanliness complaint submitted in ${newComplaint.ward}.`,
    type: 'info',
    read: false,
    timestamp: new Date().toISOString(),
    complaintId,
  });

  res.status(201).json(newComplaint);
});

// 7. Admin: Verify & Approve / Reject
app.patch('/api/complaints/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, rewardAmount, adminNotes, rejectionReason } = req.body;

  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  if (action === 'approve') {
    complaint.status = 'Approved';
    complaint.rewardAmount = Number(rewardAmount) || 150;
    complaint.adminNotes = adminNotes || 'Verified as genuine public cleanliness issue.';
    
    // Notify Citizen
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: complaint.citizenId,
      title: `Complaint ${complaint.id} Approved!`,
      message: `Your report has been verified. A reward of ₹${complaint.rewardAmount} will be disbursed upon cleaning completion.`,
      type: 'success',
      read: false,
      timestamp: new Date().toISOString(),
      complaintId: complaint.id,
    });
  } else if (action === 'reject') {
    complaint.status = 'Rejected';
    complaint.rejectionReason = rejectionReason || 'Does not qualify as municipal public waste.';
    
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: complaint.citizenId,
      title: `Complaint ${complaint.id} Rejected`,
      message: `Reason: ${complaint.rejectionReason}`,
      type: 'warning',
      read: false,
      timestamp: new Date().toISOString(),
      complaintId: complaint.id,
    });
  }

  res.json(complaint);
});

// 8. Admin: Assign to Field Staff
app.patch('/api/complaints/:id/assign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { staffId, staffName } = req.body;

  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  complaint.staffId = staffId;
  complaint.staffName = staffName;
  complaint.staffAssignedAt = new Date().toISOString();
  complaint.status = 'Assigned to Field Staff';

  // Increment staff active tasks
  const staff = fieldStaffList.find((s) => s.staffId === staffId);
  if (staff) staff.activeTasks += 1;

  // Notify Staff
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: staff?.id || 'user-staff-1',
    role: 'staff',
    title: `New Mission: ${complaint.id}`,
    message: `You have been assigned to clean ${complaint.address}. Priority: ${complaint.severity}.`,
    type: 'warning',
    read: false,
    timestamp: new Date().toISOString(),
    complaintId: complaint.id,
  });

  res.json(complaint);
});

// 9. Staff: Update Status (Start cleaning or mark completed with before/after photos)
app.patch('/api/complaints/:id/staff-status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, beforeCleaningPhotoUrl, afterCleaningPhotoUrl, staffNotes } = req.body;

  const complaint = complaints.find((c) => c.id === id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  if (status === 'Cleaning in Progress') {
    complaint.status = 'Cleaning in Progress';
    if (beforeCleaningPhotoUrl) complaint.beforeCleaningPhotoUrl = beforeCleaningPhotoUrl;
    if (staffNotes) complaint.staffNotes = staffNotes;
  } else if (status === 'Completed') {
    complaint.status = 'Completed';
    if (beforeCleaningPhotoUrl) complaint.beforeCleaningPhotoUrl = beforeCleaningPhotoUrl;
    if (afterCleaningPhotoUrl) complaint.afterCleaningPhotoUrl = afterCleaningPhotoUrl;
    complaint.staffNotes = staffNotes || 'Cleaning completed and area disinfected.';
    complaint.completedAt = new Date().toISOString();
    complaint.paymentStatus = 'Approved'; // Ready for admin payout

    // Update staff counters
    const staff = fieldStaffList.find((s) => s.staffId === complaint.staffId);
    if (staff) {
      staff.activeTasks = Math.max(0, staff.activeTasks - 1);
      staff.completedTasks += 1;
    }

    // Notify Admin & Citizen
    notifications.unshift({
      id: `notif-${Date.now()}-admin`,
      userId: 'all',
      role: 'admin',
      title: `Task Finished: ${complaint.id}`,
      message: `Staff ${complaint.staffName} completed cleanup at ${complaint.address}. Reward payout pending approval.`,
      type: 'info',
      read: false,
      timestamp: new Date().toISOString(),
      complaintId: complaint.id,
    });

    notifications.unshift({
      id: `notif-${Date.now()}-cit`,
      userId: complaint.citizenId,
      title: `Spot Cleaned: ${complaint.id}!`,
      message: `BBMP staff has cleared the spot you reported. Admin reward payment of ₹${complaint.rewardAmount} is being processed.`,
      type: 'success',
      read: false,
      timestamp: new Date().toISOString(),
      complaintId: complaint.id,
    });
  }

  res.json(complaint);
});

// 10. Admin: Process Reward Payout (PhonePe / Google Pay / BHIM UPI)
app.post('/api/payouts/process', (req: Request, res: Response) => {
  const { complaintId, paymentMethod, manualUtr, customAmount } = req.body;

  const complaint = complaints.find((c) => c.id === complaintId);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  const amount = customAmount ? Number(customAmount) : complaint.rewardAmount || 150;
  const utr =
    manualUtr && manualUtr.trim().length > 4
      ? manualUtr.trim()
      : `UPI/2026/${Math.floor(100000000000 + Math.random() * 900000000000)}`;

  complaint.status = 'Reward Paid';
  complaint.paymentStatus = 'Paid';
  complaint.paymentMethod = paymentMethod || 'PhonePe';
  complaint.paymentUtr = utr;
  complaint.paidAt = new Date().toISOString();

  const newTxn: RewardTransaction = {
    id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    complaintId: complaint.id,
    citizenId: complaint.citizenId,
    citizenName: complaint.citizenName,
    citizenUpi: complaint.citizenUpi || 'citizen@upi',
    amount,
    method: (paymentMethod || 'PhonePe') as any,
    status: 'Paid',
    utr,
    date: new Date().toISOString(),
    approvedBy: 'Dr. K. Manjunath, IAS',
    notes: 'Civic clean city incentive successfully credited',
  };

  rewardTransactions.unshift(newTxn);

  // Notify Citizen with full UTR details
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: complaint.citizenId,
    title: `₹${amount} Credited to your UPI!`,
    message: `Payment successful via ${paymentMethod || 'UPI'}. Reference UTR: ${utr}. Thank you for keeping Bengaluru clean!`,
    type: 'reward',
    read: false,
    timestamp: new Date().toISOString(),
    complaintId: complaint.id,
  });

  res.json({
    success: true,
    transaction: newTxn,
    complaint,
  });
});

// 11. Stats Endpoint
app.get('/api/stats', (req: Request, res: Response) => {
  const totalCitizens = users.filter((u) => u.role === 'citizen').length + 1845; // Simulated scaled count
  const totalFieldStaff = fieldStaffList.length;
  const totalComplaints = complaints.length + 342;
  const pendingComplaints = complaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const approvedComplaints = complaints.filter((c) => c.status === 'Approved' || c.status === 'Assigned to Field Staff').length;
  const completedCleaningTasks = complaints.filter((c) => c.status === 'Completed' || c.status === 'Reward Paid').length + 310;
  
  const totalRewardsDistributed = rewardTransactions.reduce((acc, t) => acc + t.amount, 0) + 78500;
  const pendingRewardPayments = complaints
    .filter((c) => c.status === 'Completed' && c.paymentStatus !== 'Paid')
    .reduce((acc, c) => acc + (c.rewardAmount || 150), 0);

  res.json({
    totalCitizens,
    totalFieldStaff,
    totalComplaints,
    pendingComplaints,
    approvedComplaints,
    completedCleaningTasks,
    totalRewardsDistributed,
    pendingRewardPayments,
  });
});

// 12. Payouts List
app.get('/api/payouts', (req: Request, res: Response) => {
  const { citizenId } = req.query;
  if (citizenId) {
    const citizenTxns = rewardTransactions.filter((t) => t.citizenId === citizenId);
    return res.json(citizenTxns);
  }
  res.json(rewardTransactions);
});

// 13. Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const { userId, role } = req.query;
  const userNotifs = notifications.filter(
    (n) => n.userId === 'all' || n.userId === userId || (role && n.role === role)
  );
  res.json(userNotifs);
});

app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
  const { id } = req.body;
  const notif = notifications.find((n) => n.id === id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// 14. Staff List
app.get('/api/staff-list', (req: Request, res: Response) => {
  res.json(fieldStaffList);
});

// 15. Announcements
app.get('/api/announcements', (req: Request, res: Response) => {
  res.json(announcements);
});

// ----------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION BUILD
// ----------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Namma Bengaluru Server] Running on http://0.0.0.0:${PORT}`);
  });
}

start();
