import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'kn';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    appName: 'NAMMA BENGALURU',
    appSubtitle: 'Smart City Cleanup & Reward System',
    tagline: 'Our Bengaluru, Our Responsibility',
    govtLabel: 'Government of Karnataka | BBMP Smart City Initiative',
    
    // Auth & Portals
    welcomeTitle: 'Clean City, Green City, Smart City',
    welcomeDesc: 'Join thousands of Bengalureans transforming our city. Report garbage, help municipal staff take action, and earn verified rewards.',
    adminPortal: 'ADMIN PORTAL',
    citizenPortal: 'CITIZEN PORTAL',
    staffPortal: 'FIELD STAFF PORTAL',
    adminLoginDesc: 'Authorized administrators & municipal officers only',
    citizenLoginDesc: 'Report waste, track complaints & earn UPI cash rewards',
    staffLoginDesc: 'BBMP sanitation staff & ward cleanliness warriors',
    login: 'Sign In',
    register: 'Register as Citizen',
    logout: 'Log Out',
    emailOrPhone: 'Email or Mobile Number',
    password: 'Password',
    fullName: 'Full Name',
    phoneNumber: 'Mobile Number (+91)',
    selectWard: 'Select BBMP Ward / Area',
    upiIdLabel: 'UPI ID for Direct Rewards (e.g., name@okaxis)',
    staffIdLabel: 'BBMP Staff Employee ID',
    demoFill: 'Demo Quick Fill',
    noAccount: "Don't have a citizen account? Register here",
    haveAccount: 'Already registered? Sign In',

    // Nav
    navDashboard: 'Dashboard',
    navReport: 'Report Garbage',
    navMap: 'City Map',
    navRewards: 'Rewards & Wallet',
    navStaffTasks: 'Cleaning Tasks',
    navProfile: 'My Profile',
    navAbout: 'About Mission',
    navContact: 'Helpline & Control Room',
    navAnnouncements: 'Announcements',

    // Statuses
    statusSubmitted: 'Submitted',
    statusUnderReview: 'Under Review',
    statusApproved: 'Approved',
    statusAssigned: 'Assigned to Field Staff',
    statusCleaningInProgress: 'Cleaning in Progress',
    statusCompleted: 'Completed',
    statusRewardApproved: 'Reward Approved',
    statusRewardPaid: 'Reward Paid',
    statusRejected: 'Rejected',

    // Citizen Form
    reportGarbageTitle: 'Report Garbage with Live GPS',
    reportGarbageSubtitle: 'Capture or upload clear photos of public waste to alert the BBMP cleaning squad.',
    captureCamera: 'Open Camera',
    uploadGallery: 'Upload from Device',
    gpsLocation: 'GPS Coordinates',
    detectGps: 'Detect Live Location (GPS)',
    gpsDetected: 'GPS Location Detected',
    enterLandmark: 'Nearby Landmark / Street Address',
    selectCategory: 'Garbage Category',
    describeIssue: 'Brief Description of the Dirty Spot',
    severityLabel: 'Severity Level',
    submitReport: 'Submit Cleanliness Complaint',
    submitting: 'Submitting Report...',

    // Categories
    cat_overflowing_bin: 'Overflowing Municipal Bin',
    cat_illegal_dumping: 'Illegal Dumping on Roadside',
    cat_plastic_waste: 'Plastic & Dry Waste Pile',
    cat_construction_debris: 'Construction & Demolition Debris',
    cat_sewage_overflow: 'Sewage & Drain Overflow',
    cat_dead_animal: 'Dead Animal Hazard',
    cat_other: 'Other Dirty Public Spot',

    // Admin Dashboard
    adminStatsTitle: 'Bengaluru Smart City Control Center',
    totalCitizens: 'Registered Citizens',
    totalFieldStaff: 'Field Staff On Duty',
    totalComplaints: 'Total Complaints',
    pendingComplaints: 'Pending Verification',
    approvedComplaints: 'Verified & Approved',
    completedTasks: 'Cleanups Completed',
    rewardsDistributed: 'Total Rewards Disbursed',
    pendingRewards: 'Pending Reward Payouts',
    verifyReport: 'Verify Complaint',
    approveComplaint: 'Approve & Allocate Reward',
    rejectComplaint: 'Reject Complaint',
    assignStaff: 'Assign to Field Staff',
    processPayout: 'Process UPI Payout',

    // Staff Dashboard
    staffTitle: 'BBMP Field Sanitation Squad',
    myAssignedTasks: 'Assigned Cleaning Missions',
    markInProgress: 'Start Cleaning (In Progress)',
    uploadBefore: 'Upload Before-Cleaning Photo',
    uploadAfter: 'Upload After-Cleaning Photo',
    markCompleted: 'Submit Cleaned Proof',
    openDirections: 'Navigate via Google Maps',

    // Rewards
    walletBalance: 'Available Approved Rewards',
    totalEarned: 'Lifetime Cash Earned',
    payoutHistory: 'UPI Payout Ledger',
    payoutMethod: 'Payment Mode',
    transactionRef: 'Bank UTR / Ref No.',

    // Common
    viewDetails: 'View Details',
    close: 'Close',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    helpdesk: 'BBMP Helpline: 1533 / 080-22660000',
  },
  kn: {
    // Brand
    appName: 'ನಮ್ಮ ಬೆಂಗಳೂರು',
    appSubtitle: 'ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ಸ್ವಚ್ಛತೆ ಮತ್ತು ಬಹುಮಾನ ವ್ಯವಸ್ಥೆ',
    tagline: 'ನಮ್ಮ ಬೆಂಗಳೂರು, ನಮ್ಮ ಜವಾಬ್ದಾರಿ',
    govtLabel: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ | ಬಿಬಿಎಂಪಿ ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ಯೋಜನೆ',

    // Auth & Portals
    welcomeTitle: 'ಸ್ವಚ್ಛ ನಗರ, ಸುಂದರ ನಗರ, ಸ್ಮಾರ್ಟ್ ನಗರ',
    welcomeDesc: 'ಬೆಂಗಳೂರಿನ ಸ್ವಚ್ಛತೆಗಾಗಿ ನಾಗರಿಕರು ಕಸದ ಫೋಟೋ ಮತ್ತು ಜಿಪಿಎಸ್ ಸ್ಥಳ ಕಳುಹಿಸಿ ನೇರ ಯುಪಿಐ ಬಹುಮಾನ ಹಣ ಪಡೆಯಿರಿ.',
    adminPortal: 'ಆಡಳಿತ ಮಂಡಳಿ (ADMIN)',
    citizenPortal: 'ನಾಗರಿಕರ ಪೋರ್ಟಲ್ (CITIZEN)',
    staffPortal: 'ಕ್ಷೇತ್ರ ಸಿಬ್ಬಂದಿ (FIELD STAFF)',
    adminLoginDesc: 'ಅಧಿಕೃತ ಬಿಬಿಎಂಪಿ ಅಧಿಕಾರಿಗಳು ಮತ್ತು ವ್ಯವಸ್ಥಾಪಕರಿಗೆ ಮಾತ್ರ',
    citizenLoginDesc: 'ಕಸ ವರದಿ ಮಾಡಿ, ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ಯುಪಿಐ ಹಣ ಗಳಿಸಿ',
    staffLoginDesc: 'ವಾರ್ಡ್ ಪೌರಕಾರ್ಮಿಕರು ಮತ್ತು ಸ್ವಚ್ಛತಾ ಮೇಲ್ವಿಚಾರಕರು',
    login: 'ಪ್ರವೇಶಿಸಿ (Login)',
    register: 'ಹೊಸ ನಾಗರಿಕರ ನೋಂದಣಿ',
    logout: 'ನಿರ್ಗಮಿಸಿ (Logout)',
    emailOrPhone: 'ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    password: 'ಗುಪ್ತಪದ (Password)',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    phoneNumber: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (+91)',
    selectWard: 'ಬಿಬಿಎಂಪಿ ವಾರ್ಡ್ / ಪ್ರದೇಶ ಆಯ್ಕೆಮಾಡಿ',
    upiIdLabel: 'ನೇರ ಬಹುಮಾನಕ್ಕಾಗಿ ಯುಪಿಐ ಐಡಿ (ಉದಾ: name@okhdfcbank)',
    staffIdLabel: 'ಬಿಬಿಎಂಪಿ ಸಿಬ್ಬಂದಿ ಗುರುತಿನ ಸಂಖ್ಯೆ',
    demoFill: 'ಡೆಮೊ ತ್ವರಿತ ಭರ್ತಿ',
    noAccount: 'ಖಾತೆ ಇಲ್ಲವೇ? ಹೊಸದಾಗಿ ನೋಂದಾಯಿಸಿ',
    haveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ? ಲಾಗಿನ್ ಆಗಿ',

    // Nav
    navDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    navReport: 'ಕಸ ವರದಿ ಮಾಡಿ',
    navMap: 'ನಗರ ನಕ್ಷೆ',
    navRewards: 'ಬಹುಮಾನ & ವ್ಯಾಲೆಟ್',
    navStaffTasks: 'ಸ್ವಚ್ಛತಾ ಕಾರ್ಯಗಳು',
    navProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    navAbout: 'ಯೋಜನೆಯ ಬಗ್ಗೆ',
    navContact: 'ಸಹಾಯವಾಣಿ',
    navAnnouncements: 'ಪ್ರಕಟಣೆಗಳು',

    // Statuses
    statusSubmitted: 'ಸಲ್ಲಿಸಲಾಗಿದೆ',
    statusUnderReview: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ',
    statusApproved: 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
    statusAssigned: 'ಸಿಬ್ಬಂದಿಗೆ ನಿಯೋಜಿಸಲಾಗಿದೆ',
    statusCleaningInProgress: 'ಸ್ವಚ್ಛತಾ ಕಾರ್ಯ ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    statusCompleted: 'ಸ್ವಚ್ಛತೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
    statusRewardApproved: 'ಬಹುಮಾನ ಅನುಮೋದಿಸಲಾಗಿದೆ',
    statusRewardPaid: 'ಬಹುಮಾನ ಪಾವತಿಸಲಾಗಿದೆ',
    statusRejected: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',

    // Citizen Form
    reportGarbageTitle: 'ಜಿಪಿಎಸ್ ಸ್ಥಳದೊಂದಿಗೆ ಕಸದ ವರದಿ ನೀಡಿ',
    reportGarbageSubtitle: 'ಸಾರ್ವಜನಿಕ ಸ್ಥಳದಲ್ಲಿ ಬಿದ್ದಿರುವ ಕಸದ ಸ್ಪಷ್ಟ ಛಾಯಾಚಿತ್ರ ತೆಗೆದು ಕಳುಹಿಸಿ.',
    captureCamera: 'ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ',
    uploadGallery: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    gpsLocation: 'ಜಿಪಿಎಸ್ ನಿರ್ದೇಶಾಂಕಗಳು',
    detectGps: 'ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ (GPS)',
    gpsDetected: 'ಜಿಪಿಎಸ್ ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ',
    enterLandmark: 'ಹತ್ತಿರದ ಹೆಗ್ಗುರುತು / ವಿಳಾಸ',
    selectCategory: 'ಕಸದ ವರ್ಗ ಆಯ್ಕೆಮಾಡಿ',
    describeIssue: 'ಸಮಸ್ಯೆಯ ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ',
    severityLabel: 'ತುರ್ತು ಮಟ್ಟ (Severity)',
    submitReport: 'ದೂರು ಸಲ್ಲಿಸಿ',
    submitting: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',

    // Categories
    cat_overflowing_bin: 'ತುಂಬಿ ಹರಿಯುತ್ತಿರುವ ಕಸದ ತೊಟ್ಟಿ',
    cat_illegal_dumping: 'ರಸ್ತೆ ಬದಿಯ ಅಕ್ರಮ ಕಸ',
    cat_plastic_waste: 'ಪ್ಲಾಸ್ಟಿಕ್ ಮತ್ತು ಒಣ ತ್ಯಾಜ್ಯ',
    cat_construction_debris: 'ಕಟ್ಟಡ ಭಗ್ನಾವಶೇಷ ತ್ಯಾಜ್ಯ',
    cat_sewage_overflow: 'ಚರಂಡಿ ನೀರು ಮತ್ತು ತ್ಯಾಜ್ಯ',
    cat_dead_animal: 'ಸತ್ತ ಪ್ರಾಣಿ ತ್ಯಾಜ್ಯ',
    cat_other: 'ಇತರ ಕೊಳಕು ಸಾರ್ವಜನಿಕ ಸ್ಥಳ',

    // Admin Dashboard
    adminStatsTitle: 'ಬೆಂಗಳೂರು ಸ್ಮಾರ್ಟ್ ಸಿಟಿ ಕಂಟ್ರೋಲ್ ಸೆಂಟರ್',
    totalCitizens: 'ನೋಂದಾಯಿತ ನಾಗರಿಕರು',
    totalFieldStaff: 'ಕರ್ತವ್ಯದಲ್ಲಿರುವ ಸಿಬ್ಬಂದಿ',
    totalComplaints: 'ಒಟ್ಟು ದೂರುಗಳು',
    pendingComplaints: 'ಪರಿಶೀಲನೆ ಬಾಕಿ',
    approvedComplaints: 'ಅನುಮೋದಿತ ದೂರುಗಳು',
    completedTasks: 'ಪೂರ್ಣಗೊಂಡ ಸ್ವಚ್ಛತೆ',
    rewardsDistributed: 'ವಿತರಿಸಲಾದ ಒಟ್ಟು ಬಹುಮಾನ',
    pendingRewards: 'ಬಾಕಿ ಬಹುಮಾನ ಪಾವತಿಗಳು',
    verifyReport: 'ವರದಿ ಪರಿಶೀಲಿಸಿ',
    approveComplaint: 'ಅನುಮೋದಿಸಿ & ಬಹುಮಾನ ನಿಗದಿಪಡಿಸಿ',
    rejectComplaint: 'ದೂರು ತಿರಸ್ಕರಿಸಿ',
    assignStaff: 'ಸಿಬ್ಬಂದಿಗೆ ನಿಯೋಜಿಸಿ',
    processPayout: 'ಯುಪಿಐ ಪಾವತಿ ಮಾಡಿ',

    // Staff Dashboard
    staffTitle: 'ಬಿಬಿಎಂಪಿ ಕ್ಷೇತ್ರ ಸ್ವಚ್ಛತಾ ಕಾರ್ಯಪಡೆ',
    myAssignedTasks: 'ನಿಯೋಜಿಸಲಾದ ಸ್ವಚ್ಛತಾ ಕಾರ್ಯಗಳು',
    markInProgress: 'ಸ್ವಚ್ಛತೆ ಪ್ರಾರಂಭಿಸಿ',
    uploadBefore: 'ಸ್ವಚ್ಛತೆಗೆ ಮುಂಚಿನ ಫೋಟೋ',
    uploadAfter: 'ಸ್ವಚ್ಛತೆಯ ನಂತರದ ಫೋಟೋ',
    markCompleted: 'ಸ್ವಚ್ಛತೆ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಸಲ್ಲಿಸಿ',
    openDirections: 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ಮೂಲಕ ಮಾರ್ಗ',

    // Rewards
    walletBalance: 'ಅನುಮೋದಿತ ಬಾಕಿ ಬಹುಮಾನ',
    totalEarned: 'ಒಟ್ಟು ಗಳಿಸಿದ ನಗದು',
    payoutHistory: 'ಯುಪಿಐ ಪಾವತಿ ವಹಿವಾಟುಗಳು',
    payoutMethod: 'ಪಾವತಿ ವಿಧಾನ',
    transactionRef: 'ಬ್ಯಾಂಕ್ ಯುಟಿಆರ್ ಸಂಖ್ಯೆ',

    // Common
    viewDetails: 'ವಿವರಗಳನ್ನು ನೋಡಿ',
    close: 'ಮುಚ್ಚಿ',
    success: 'ಯಶಸ್ವಿಯಾಗಿದೆ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    save: 'ಉಳಿಸಿ',
    helpdesk: 'ಬಿಬಿಎಂಪಿ ಸಹಾಯವಾಣಿ: 1533 / 080-22660000',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('namma_blr_lang') as Language;
    return saved === 'kn' ? 'kn' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('namma_blr_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'kn' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
