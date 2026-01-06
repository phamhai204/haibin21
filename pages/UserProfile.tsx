
import React, { useState, useEffect } from 'react';
import { backend } from '../services/backend';
import { UserProfile, RiskLevel, OrderStatus } from '../types';
import { formatVND, RISK_COLORS } from '../constants';
import SpendingCapacity from '../components/SpendingCapacity';
import { ScoreHistoryChart } from '../components/RiskCharts';

const UserProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(backend.getUser());
  const [history, setHistory] = useState(backend.getScoreHistory());
  const [orders, setOrders] = useState(backend.getOrders());

  const totalMonthlyInstallments = orders
    .filter(o => o.status === OrderStatus.LOANING || o.status === OrderStatus.OVERDUE)
    .reduce((acc, curr) => acc + curr.installmentAmount, 0);

  const handleUpdate = (field: keyof UserProfile, value: string | number) => {
    const newProfile = backend.updateProfile({ [field]: value });
    setProfile({ ...newProfile });
    setHistory([...backend.getScoreHistory()]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-500';
    if (score >= 45) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 45) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="mb-10">
        <h2 className="text-4xl font-black mb-2 text-white tracking-tight">Hồ sơ tài chính</h2>
        <p className="text-slate-400 max-w-2xl">Hệ thống chấm điểm tín dụng Fintech dựa trên dữ liệu thu nhập, chi tiêu và lịch sử giao dịch thực tế của bạn.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-sm">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-indigo-400">
              <i className="fas fa-id-card"></i>
              Thông tin định danh & Tài chính
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-400 transition-colors">Họ và tên khách hàng</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => handleUpdate('name', e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-100 font-bold"
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-400 transition-colors">Thu nhập hằng tháng (VND)</label>
                <input 
                  type="number" 
                  value={profile.income}
                  onChange={(e) => handleUpdate('income', Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-100 font-bold"
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-400 transition-colors">Chi phí sinh hoạt (VND)</label>
                <input 
                  type="number" 
                  value={profile.expense}
                  onChange={(e) => handleUpdate('expense', Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-100 font-bold"
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-400 transition-colors">Khoản vay hiện hữu</label>
                <input 
                  type="number" 
                  value={profile.activeLoans}
                  onChange={(e) => handleUpdate('activeLoans', Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-100 font-bold"
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-400 transition-colors">Số kỳ quá hạn lịch sử</label>
                <input 
                  type="number" 
                  value={profile.pastDueCount}
                  onChange={(e) => handleUpdate('pastDueCount', Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-100 font-bold"
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-400 transition-colors">Giao dịch qua thẻ / tháng</label>
                <input 
                  type="number" 
                  value={profile.transactionFrequency}
                  onChange={(e) => handleUpdate('transactionFrequency', Number(e.target.value))}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-slate-100 font-bold"
                />
              </div>
            </div>

            <div className="mt-10 p-6 bg-slate-800/30 rounded-3xl border border-slate-700/30 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                     <i className="fas fa-microchip text-2xl"></i>
                  </div>
                  <div>
                     <p className="text-xs font-black text-slate-200 uppercase tracking-wider">Scoring Engine</p>
                     <p className="text-[10px] text-slate-500">Mô hình AI sẽ đánh giá lại rủi ro sau mỗi lần thay đổi dữ liệu.</p>
                  </div>
               </div>
               <button 
                  onClick={() => alert('Đã tối ưu hóa thuật toán tín dụng!')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-3 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 text-xs tracking-widest"
                >
                  CẬP NHẬT TÀI KHOẢN
                </button>
            </div>
          </div>

          <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black mb-8 text-slate-200">Biến động điểm tín dụng</h3>
            <div className="h-64">
              <ScoreHistoryChart data={history} />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 blur-[100px] opacity-20 ${getScoreBg(profile.creditScore)}`}></div>
            
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10">Tín nhiệm người dùng</h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              <svg className="w-full h-full -rotate-90 scale-110">
                <circle cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="14" className="text-slate-800/50" />
                <circle 
                  cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="14" 
                  strokeDasharray={502} 
                  strokeDashoffset={502 - (502 * profile.creditScore) / 100}
                  className={`${getScoreColor(profile.creditScore)} transition-all duration-1500 ease-in-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-white">{profile.creditScore}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Point</span>
              </div>
            </div>
            
            <div className="space-y-1 mb-10">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Phân loại rủi ro</p>
              <p className={`text-3xl font-black ${RISK_COLORS[profile.riskLevel]} drop-shadow-sm`}>
                {profile.riskLevel}
              </p>
            </div>

            <div className="w-full bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 group hover:border-indigo-500/30 transition-all">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Hạn mức BNPL tối đa</p>
              <p className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">
                {profile.riskLevel === RiskLevel.HIGH 
                  ? 'KHÔNG ĐỦ ĐIỀU KIỆN' 
                  : formatVND(profile.bnplLimit)}
              </p>
              <p className="text-[9px] text-slate-500 mt-2 italic">*Hạn mức được điều chỉnh tự động</p>
            </div>
          </div>

          <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
            <SpendingCapacity 
              income={profile.income} 
              expense={profile.expense} 
              installments={totalMonthlyInstallments} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
