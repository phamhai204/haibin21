
import React, { useState, useEffect } from 'react';
import { backend } from '../services/backend';
import { BNPLOrder, RepaymentStatus, OrderStatus } from '../types';
import { formatVND, STATUS_COLORS, RISK_COLORS } from '../constants';
import { RiskHeatmap } from '../components/RiskCharts';

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<BNPLOrder[]>(backend.getOrders());
  const [selectedOrder, setSelectedOrder] = useState<BNPLOrder | null>(null);

  const refreshData = () => {
    setOrders([...backend.getOrders()]);
  };

  const handlePay = (orderId: string, period: number) => {
    const success = backend.payInstallment(orderId, period);
    if (success) {
      refreshData();
      const updatedOrder = backend.getOrders().find(o => o.id === orderId);
      if (updatedOrder) setSelectedOrder({ ...updatedOrder });
    }
  };

  const getStatusIcon = (status: RepaymentStatus) => {
    switch (status) {
      case RepaymentStatus.PAID: return 'fa-check-circle text-green-500';
      case RepaymentStatus.OVERDUE: return 'fa-exclamation-circle text-red-500';
      default: return 'fa-calendar text-slate-600';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">Quản lý khoản vay BNPL</h2>
          <p className="text-slate-400">Danh sách đơn hàng và kế hoạch trả nợ của bạn.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
               <i className="fas fa-hand-holding-dollar text-xl"></i>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tổng dư nợ</p>
              <p className="text-xl font-bold text-white">
                {formatVND(orders.filter(o => o.status !== OrderStatus.COMPLETED).reduce((s, o) => s + o.totalPayable, 0))}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-slate-900/50 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/40 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-5">Đơn hàng</th>
                    <th className="px-6 py-5">Giá trị (Gồm lãi)</th>
                    <th className="px-6 py-5">Kỳ hạn</th>
                    <th className="px-6 py-5 text-center">Trạng thái</th>
                    <th className="px-6 py-5 text-center">Rủi ro</th>
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-500 italic bg-slate-900/20">
                        Bạn chưa có giao dịch BNPL nào.
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-800/20 transition-all group">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200 group-hover:text-white transition-colors">
                              {order.productName}
                            </span>
                            <span className="text-[10px] font-mono text-indigo-400 mt-0.5">{order.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-200">{formatVND(order.totalPayable)}</div>
                          <div className="text-[10px] text-slate-500">Gốc: {formatVND(order.amount)}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-slate-300">{order.tenor} tháng</div>
                          <div className="text-[10px] text-slate-500">{formatVND(order.installmentAmount)} / kỳ</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm ${STATUS_COLORS[order.status]}`}>
                              {order.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-xs font-bold ${RISK_COLORS[order.riskLevel]}`}>
                              {order.riskLevel}
                            </span>
                            {order.fraudFlag && (
                                <span className="bg-yellow-500/10 text-yellow-500 text-[8px] px-1.5 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1 uppercase font-bold">
                                   <i className="fas fa-biohazard"></i> Nghi vấn
                                </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-600/30 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90"
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
            <RiskHeatmap orders={orders} />
          </div>

          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
             <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Hỗ trợ & Thông báo</h4>
             <div className="space-y-4">
                <div className="group p-4 bg-indigo-600/5 rounded-2xl border border-indigo-600/10 hover:border-indigo-600/30 transition-all cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                         <i className="fas fa-bell"></i>
                      </div>
                      <div className="flex-1">
                         <p className="text-xs font-bold text-slate-200">SMS Nhắc nợ</p>
                         <p className="text-[10px] text-slate-500 leading-tight">Hệ thống đã gửi thông báo thanh toán kỳ tiếp theo cho {orders.length} đơn hàng.</p>
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-emerald-600/5 rounded-2xl border border-emerald-600/10">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                         <i className="fas fa-envelope"></i>
                      </div>
                      <div className="flex-1">
                         <p className="text-xs font-bold text-slate-200">Email Marketing</p>
                         <p className="text-[10px] text-slate-500 leading-tight">Gửi ưu đãi 0% lãi suất cho người dùng có điểm tín dụng > 80.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Lịch Trả Nợ Modal (Page 4) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-3xl rounded-[2.5rem] border border-slate-800 shadow-[0_0_100px_rgba(79,70,229,0.15)] overflow-hidden animate-scaleIn">
            <div className="p-10 border-b border-slate-800 flex justify-between items-start">
              <div className="flex gap-6">
                 <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-indigo-500 text-3xl">
                    <i className="fas fa-file-invoice-dollar"></i>
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white">{selectedOrder.productName}</h3>
                    <div className="flex items-center gap-4 mt-1">
                       <span className="text-indigo-400 font-mono text-sm tracking-widest">{selectedOrder.id}</span>
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${STATUS_COLORS[selectedOrder.status]}`}>
                          {selectedOrder.status}
                       </span>
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all text-slate-400 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1 text-center">Mỗi kỳ</p>
                  <p className="text-xl font-bold text-white text-center">{formatVND(selectedOrder.installmentAmount)}</p>
                </div>
                <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1 text-center">Kỳ hạn</p>
                  <p className="text-xl font-bold text-white text-center">{selectedOrder.tenor} Tháng</p>
                </div>
                <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1 text-center">Tổng nợ</p>
                  <p className="text-xl font-bold text-indigo-400 text-center">{formatVND(selectedOrder.totalPayable)}</p>
                </div>
                <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1 text-center">Quá hạn</p>
                  <p className={`text-xl font-bold text-center ${selectedOrder.overduePeriods > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {selectedOrder.overduePeriods} Kỳ
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedOrder.repaymentSchedule.map((p) => (
                  <div 
                    key={p.period}
                    className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                      p.status === RepaymentStatus.PAID 
                        ? 'bg-emerald-500/5 border-emerald-500/10' 
                        : p.status === RepaymentStatus.OVERDUE 
                          ? 'bg-red-500/5 border-red-500/10' 
                          : 'bg-slate-800/20 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                         p.status === RepaymentStatus.PAID ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.period}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">Kỳ thanh toán {p.period}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Hạn thanh toán: {new Date(p.dueDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-black text-slate-100">{formatVND(p.amount)}</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <i className={`fas ${getStatusIcon(p.status)} text-[10px]`}></i>
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${
                            p.status === RepaymentStatus.PAID ? 'text-emerald-500' : p.status === RepaymentStatus.OVERDUE ? 'text-red-500' : 'text-slate-500'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      </div>

                      {p.status !== RepaymentStatus.PAID && (
                        <button 
                          onClick={() => handlePay(selectedOrder.id, p.period)}
                          className="bg-white hover:bg-indigo-500 text-slate-900 hover:text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-md hover:shadow-indigo-500/30 active:scale-95"
                        >
                          THANH TOÁN
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-10 py-8 bg-slate-800/30 border-t border-slate-800">
               <div className="flex items-center gap-3 text-slate-500 italic text-[11px]">
                  <i className="fas fa-info-circle"></i>
                  <span>Lưu ý: Thanh toán trễ hạn sẽ bị tính phí phạt 5% trên số tiền mỗi kỳ và ảnh hưởng trực tiếp đến điểm tín dụng CIC của bạn.</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;
