
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { CreditScoreHistory, BNPLOrder, RiskLevel } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const ScoreHistoryChart: React.FC<{ data: CreditScoreHistory[] }> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Điểm tín dụng',
        data: data.map(d => d.score),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { min: 0, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
    }
  };

  return <Line data={chartData} options={options} />;
};

export const RiskHeatmap: React.FC<{ orders: BNPLOrder[] }> = ({ orders }) => {
  const counts = {
    [RiskLevel.LOW]: orders.filter(o => o.riskLevel === RiskLevel.LOW).length,
    [RiskLevel.MEDIUM]: orders.filter(o => o.riskLevel === RiskLevel.MEDIUM).length,
    [RiskLevel.HIGH]: orders.filter(o => o.riskLevel === RiskLevel.HIGH).length,
  };

  const data = {
    labels: ['Thấp', 'Trung bình', 'Cao'],
    datasets: [
      {
        label: 'Số lượng đơn hàng',
        data: [counts[RiskLevel.LOW], counts[RiskLevel.MEDIUM], counts[RiskLevel.HIGH]],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Mật độ rủi ro danh mục', color: '#94a3b8' }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  return <Bar data={data} options={options} />;
};
