
import React from 'react';
import { formatVND } from '../constants';

interface Props {
  income: number;
  expense: number;
  installments: number;
}

const SpendingCapacity: React.FC<Props> = ({ income, expense, installments }) => {
  const totalOut = expense + installments;
  const remaining = Math.max(0, income - totalOut);
  const percentage = Math.min(100, (remaining / income) * 100);

  let colorClass = 'bg-green-500';
  let label = 'An toàn';
  if (percentage < 20) {
    colorClass = 'bg-red-500';
    label = 'Nguy hiểm';
  } else if (percentage < 50) {
    colorClass = 'bg-yellow-500';
    label = 'Cảnh báo';
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Khả năng chi trả (Hàng tháng)</h4>
          <p className="text-xl font-bold">{formatVND(remaining)} / {formatVND(income)}</p>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colorClass} text-white`}>
          {label}
        </span>
      </div>
      
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <span>Tổng chi: {formatVND(totalOut)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
          <span>Còn dư: {Math.round(percentage)}%</span>
        </div>
      </div>
    </div>
  );
};

export default SpendingCapacity;
