import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

type DataPoint = {
  label: string;
  value: number;
};

type Props = {
  data: DataPoint[];
};

export default function LineChart({ data }: Props) {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [{
      label: 'Metrics',
      data: data.map(item => item.value),
      borderColor: '#3a86ff',
      tension: 0.1
    }]
  };

  return <Line data={chartData} />;
}