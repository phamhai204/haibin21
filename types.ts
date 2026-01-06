
export enum RiskLevel {
  LOW = 'Thấp',
  MEDIUM = 'Trung bình',
  HIGH = 'Cao'
}

export enum OrderStatus {
  APPROVED = 'Đã duyệt',
  LOANING = 'Đang vay',
  COMPLETED = 'Hoàn tất',
  OVERDUE = 'Quá hạn'
}

export enum RepaymentStatus {
  PAID = 'Đã trả',
  UPCOMING = 'Sắp tới',
  OVERDUE = 'Quá hạn'
}

export interface UserProfile {
  id: string;
  name: string;
  income: number;
  expense: number;
  activeLoans: number;
  pastDueCount: number;
  transactionFrequency: number;
  creditScore: number;
  riskLevel: RiskLevel;
  bnplLimit: number;
}

export interface CreditScoreHistory {
  score: number;
  date: string;
}

export interface RepaymentPeriod {
  period: number;
  dueDate: string;
  amount: number;
  status: RepaymentStatus;
}

export interface BNPLOrder {
  id: string;
  productName: string;
  amount: number; // Base price
  totalPayable: number; // Price + 15% interest
  tenor: 3 | 6;
  installmentAmount: number;
  status: OrderStatus;
  riskLevel: RiskLevel;
  fraudFlag: boolean;
  fraudDetails: string[];
  repaymentSchedule: RepaymentPeriod[];
  overduePeriods: number;
  createdAt: string;
}
