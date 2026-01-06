
import { 
  UserProfile, 
  RiskLevel, 
  BNPLOrder, 
  OrderStatus, 
  RepaymentStatus, 
  RepaymentPeriod,
  CreditScoreHistory
} from '../types';

class MockBackend {
  private user: UserProfile;
  private orders: BNPLOrder[];
  private scoreHistory: CreditScoreHistory[];

  constructor() {
    const savedUser = localStorage.getItem('bnpl_user');
    const savedOrders = localStorage.getItem('bnpl_orders');
    const savedHistory = localStorage.getItem('bnpl_history');

    this.user = savedUser ? JSON.parse(savedUser) : {
      id: 'user_1',
      name: 'Nguyễn Văn A',
      income: 25000000,
      expense: 12000000,
      activeLoans: 1,
      pastDueCount: 0,
      transactionFrequency: 18,
      creditScore: 82,
      riskLevel: RiskLevel.LOW,
      bnplLimit: 10000000
    };

    this.orders = savedOrders ? JSON.parse(savedOrders) : [
      {
        id: 'BNPL-8821',
        productName: 'Laptop Dell XPS 13',
        amount: 30000000,
        totalPayable: 34500000,
        tenor: 6,
        installmentAmount: 5750000,
        status: OrderStatus.COMPLETED,
        riskLevel: RiskLevel.LOW,
        fraudFlag: false,
        fraudDetails: [],
        repaymentSchedule: [],
        overduePeriods: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()
      }
    ];

    this.scoreHistory = savedHistory ? JSON.parse(savedHistory) : [
      { score: 65, date: '2023-11-10' },
      { score: 72, date: '2023-12-15' },
      { score: 82, date: '2024-01-20' }
    ];
  }

  private persist() {
    localStorage.setItem('bnpl_user', JSON.stringify(this.user));
    localStorage.setItem('bnpl_orders', JSON.stringify(this.orders));
    localStorage.setItem('bnpl_history', JSON.stringify(this.scoreHistory));
  }

  getUser(): UserProfile {
    return this.user;
  }

  getScoreHistory(): CreditScoreHistory[] {
    return this.scoreHistory;
  }

  getOrders(): BNPLOrder[] {
    return this.orders;
  }

  updateProfile(data: Partial<UserProfile>): UserProfile {
    this.user = { ...this.user, ...data };
    this.recalculateCreditScore();
    this.persist();
    return this.user;
  }

  private recalculateCreditScore() {
    let score = 50; 
    const freeCash = this.user.income - this.user.expense;
    const ratio = freeCash / Math.max(1, this.user.income);
    
    score += ratio * 45; 
    score -= this.user.activeLoans * 8;
    score -= this.user.pastDueCount * 20;
    score += Math.min(this.user.transactionFrequency, 30) * 1.2;

    this.user.creditScore = Math.max(0, Math.min(100, Math.round(score)));
    
    if (this.user.creditScore >= 75) {
      this.user.riskLevel = RiskLevel.LOW;
      this.user.bnplLimit = 15000000;
    } else if (this.user.creditScore >= 45) {
      this.user.riskLevel = RiskLevel.MEDIUM;
      this.user.bnplLimit = 8000000;
    } else {
      this.user.riskLevel = RiskLevel.HIGH;
      this.user.bnplLimit = 0;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (this.scoreHistory[this.scoreHistory.length - 1]?.date !== todayStr) {
      this.scoreHistory.push({ score: this.user.creditScore, date: todayStr });
    } else {
      this.scoreHistory[this.scoreHistory.length - 1].score = this.user.creditScore;
    }
  }

  createOrder(productName: string, amount: number, tenor: 3 | 6): { success: boolean; message: string; order?: BNPLOrder } {
    const totalPayable = Math.round(amount * 1.15);
    const installmentAmount = Math.round(totalPayable / tenor);

    // Fraud Detection Rules
    const fraudDetails: string[] = [];
    if (amount > this.user.income * 0.8) {
      fraudDetails.push("Giá trị đơn hàng quá lớn so với thu nhập (vượt 80%).");
    }
    if (this.user.transactionFrequency < 5 && amount > 10000000) {
      fraudDetails.push("Tài khoản mới hoặc ít giao dịch nhưng mua hàng giá trị cao.");
    }
    if (this.user.activeLoans >= 3 && amount > 5000000) {
      fraudDetails.push("Người dùng có quá nhiều khoản vay đang hoạt động đồng thời.");
    }

    const currentTotalInstallments = this.orders
      .filter(o => o.status === OrderStatus.LOANING || o.status === OrderStatus.OVERDUE)
      .reduce((sum, o) => sum + o.installmentAmount, 0);

    const monthlyDisposable = this.user.income - this.user.expense - currentTotalInstallments;

    // Credit Decision
    if (this.user.riskLevel === RiskLevel.HIGH) {
      return { success: false, message: "Từ chối: Điểm tín dụng quá thấp, mức rủi ro CAO." };
    }
    if (amount > this.user.bnplLimit) {
      return { success: false, message: `Từ chối: Vượt hạn mức BNPL tối đa của bạn (${this.user.bnplLimit.toLocaleString()} VND).` };
    }
    if (installmentAmount > monthlyDisposable * 0.7) {
      return { success: false, message: "Từ chối: Khả năng chi trả hàng tháng không đủ cho khoản vay mới này." };
    }

    // Success - Create Order
    const schedule: RepaymentPeriod[] = [];
    const today = new Date();
    for (let i = 1; i <= tenor; i++) {
      const d = new Date(today);
      d.setMonth(today.getMonth() + i);
      schedule.push({
        period: i,
        dueDate: d.toISOString().split('T')[0],
        amount: installmentAmount,
        status: RepaymentStatus.UPCOMING
      });
    }

    const newOrder: BNPLOrder = {
      id: `BNPL-${Math.floor(1000 + Math.random() * 8999)}`,
      productName,
      amount,
      totalPayable,
      tenor,
      installmentAmount,
      status: OrderStatus.LOANING,
      riskLevel: this.user.riskLevel,
      fraudFlag: fraudDetails.length > 0,
      fraudDetails: fraudDetails,
      repaymentSchedule: schedule,
      overduePeriods: 0,
      createdAt: today.toISOString()
    };

    this.orders.unshift(newOrder); // Newest first
    this.persist();
    return { success: true, message: "Tuyệt vời! Đơn hàng của bạn đã được hệ thống phê duyệt ngay lập tức.", order: newOrder };
  }

  payInstallment(orderId: string, periodNumber: number): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    const period = order.repaymentSchedule.find(p => p.period === periodNumber);
    if (!period) return false;

    period.status = RepaymentStatus.PAID;
    
    const allPaid = order.repaymentSchedule.every(p => p.status === RepaymentStatus.PAID);
    if (allPaid) {
      order.status = OrderStatus.COMPLETED;
    } else {
      const hasOverdue = order.repaymentSchedule.some(p => p.status === RepaymentStatus.OVERDUE);
      order.status = hasOverdue ? OrderStatus.OVERDUE : OrderStatus.LOANING;
    }
    this.persist();
    return true;
  }
}

export const backend = new MockBackend();
