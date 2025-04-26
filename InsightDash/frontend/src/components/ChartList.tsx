import React from 'react';
import { Dataset } from '../types/types'; // Adjusted the path to match the correct location
import LineChart from './LineChart';

type Props = {
  dataset: Dataset;
};

export default function ChartList({ dataset }: Props) {
  return (
    <div className="chart-container">
      <h2>{dataset.name}</h2>
      <div className="charts-grid">
        <LineChart data={dataset.data} />
      </div>
    </div>
  );
}