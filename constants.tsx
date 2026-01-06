
import React from 'react';

export const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const RISK_COLORS = {
  'Thấp': 'text-green-400',
  'Trung bình': 'text-yellow-400',
  'Cao': 'text-red-400',
};

export const STATUS_COLORS = {
  'Đã duyệt': 'bg-blue-500/20 text-blue-400',
  'Đang vay': 'bg-indigo-500/20 text-indigo-400',
  'Hoàn tất': 'bg-green-500/20 text-green-400',
  'Quá hạn': 'bg-red-500/20 text-red-400 border border-red-500/50',
};
