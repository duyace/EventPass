export interface EventItem {
  id: string;
  title: string;
  organizer: string;
  organizerAddress: string; // EVM address of the organizer / university department
  category: 'Tech' | 'Academic' | 'Hackathon' | 'Workshop' | 'Conference' | 'Community';
  description: string;
  detailedDescription?: string;
  bannerUrl: string;
  location: string;
  isOnline: boolean;
  startDate: string; // ISO string
  endDate: string;
  maxAttendees: number;
  registeredCount: number;
  checkedInCount: number;
  price: number; // 0 for free
  currency: 'VND' | 'ETH' | 'USDT';
  sbtCertificate: {
    title: string;
    description: string;
    badgeIcon: string;
    bgTheme: 'gold' | 'cyan' | 'purple' | 'emerald';
    criteria: string;
    skillsGranted: string[];
  };
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketCode: string; // e.g. EVT-2026-X89B
  eventId: string;
  eventTitle: string;
  ownerAddress: string;
  ownerName: string;
  ownerEmail: string;
  ownerStudentId?: string;
  tierName: string;
  price: number;
  currency: string;
  purchaseDate: string;
  status: 'active' | 'checked_in' | 'cancelled';
  checkInTime?: string;
  sbtTokenId?: string;
  qrPayload: string;
}

export interface SoulboundToken {
  tokenId: string; // e.g. SBT-009482
  eventId: string;
  eventTitle: string;
  ownerAddress: string;
  recipientName: string;
  recipientStudentId?: string;
  issuerAddress: string;
  issuerName: string;
  issueDate: string;
  blockNumber: number;
  transactionHash: string; // 0x...
  ipfsMetadataUri: string; // ipfs://bafybeih.../metadata.json
  ipfsImageUri: string; // ipfs://bafybeih.../badge.png
  isLocked: boolean; // ERC-5192 standard: always true for Soulbound
  skills: string[];
  certificateType: string;
  verificationSignature: string;
}

export interface DynamicCheckInToken {
  eventId: string;
  nonce: string;
  timestamp: number;
  expiresInSeconds: number;
  secretHash: string;
  qrDataUrl?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  role: 'student' | 'organizer';
  address: string;
  avatar?: string;
  createdAt: string;
}

export interface VerificationResult {
  valid: boolean;
  token?: SoulboundToken;
  event?: EventItem;
  message: string;
  verificationTimestamp: string;
  smartContractAddress: string;
  ercStandard: 'ERC-5192 (Soulbound Token)';
  transferable: false;
}
