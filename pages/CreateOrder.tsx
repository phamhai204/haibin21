
import React, { useState } from 'react';
import { backend } from '../services/backend';
import { formatVND } from '../constants';
import SpendingCapacity from '../components/SpendingCapacity';

const CreateOrderPage: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [tenor, setTenor] = useState<3 | 6>(3);
  const [result, setResult] = useState<{ success: boolean; message: string; order?: any } | null>(null);

  const profile = backend.getUser();
  const orders = backend.getOrders();
  const currentInstallments = orders
    .filter(o => o.status === 'Đang vay' || o.status === 'Quá hạn')
    .reduce((sum, o) => sum + o.installmentAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || amount <= 0) return;
    const res = backend.createOrder(productName, amount, tenor);
    setResult(res);
  };

  const totalPayable = Math.round(amount * 1.15);
  const installmentAmount = Math.round(totalPayable / tenor);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold mb-2 text-white">Tạo đơn hàng BNPL</h2>
        <p className="text-slate-400">Mô phỏng trải nghiệm mua hàng trả góp tại điểm bán.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Tên sản phẩm / dịch vụ</label>
              <input 
                type="text" 
                placeholder="VD: iPhone 15 Pro Max"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Giá sản phẩm (VND)</label>
              <input 
                type="number" 
                placeholder="Nhập số tiền..."
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Kỳ hạn trả góp</label>
              <div className="grid grid-cols-2 gap-4">
                {[3, 6].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTenor(t as 3 | 6)}
                    className={`py-3 rounded-xl border font-bold transition-all ${
                      tenor === t 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {t} Tháng
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Lãi suất BNPL (Cố định 15%)</span>
                <span className="text-indigo-400 font-semibold">{formatVND(totalPayable - amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Tổng tiền phải trả</span>
                <span className="text-white">{formatVND(totalPayable)}</span>
              </div>
              <div className="pt-3 border-t border-indigo-500/10 flex justify-between items-end">
                <span className="text-slate-400 text-sm">Trả mỗi kỳ:</span>
                <span className="text-2xl font-black text-indigo-400">{formatVND(installmentAmount)}</span>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-xl active:scale-95"
            >
              Gửi yêu cầu xét duyệt
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-xl">
             <SpendingCapacity 
              income={profile.income} 
              expense={profile.expense} 
              installments={currentInstallments} 
            />
          </div>

          {result && (
            <div className={`p-8 rounded-3xl border shadow-xl animate-scaleIn ${
              result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                  result.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  <i className={`fas ${result.success ? 'fa-check' : 'fa-times'}`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{result.success ? 'Đã duyệt thành công' : 'Yêu cầu bị từ chối'}</h3>
                  <p className="text-sm opacity-70">{result.order?.id || 'Hệ thống Decision Engine'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{result.message}</p>
                
                {result.order?.fraudFlag && (
                   <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
                      <h4 className="text-yellow-500 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle"></i> Cảnh báo gian lận (Fraud Detection)
                      </h4>
                      <ul className="text-xs text-yellow-500/80 space-y-1 list-disc pl-4">
                        {result.order.fraudDetails.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                   </div>
                )}

                {result.success && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-bold">Mức rủi ro</p>
                      <p className="font-bold text-white">{result.order.riskLevel}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-500 font-bold">Ngày bắt đầu</p>
                      <p className="font-bold text-white">{new Date(result.order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
