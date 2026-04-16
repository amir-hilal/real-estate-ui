import './BarChart.css';

interface BarChartItem {
  label: string;
  value: number;
  displayValue?: string;
}

interface BarChartProps {
  items: BarChartItem[];
  color?: string;
  maxValue?: number;
}

export function BarChart({ items, color = '#2563eb', maxValue }: BarChartProps) {
  const max = maxValue ?? Math.max(...items.map(i => i.value));

  return (
    <div className="bar-chart">
      {items.map(item => (
        <div className="bar-chart__row" key={item.label}>
          <span className="bar-chart__label">{item.label}</span>
          <div className="bar-chart__track">
            <div
              className="bar-chart__fill"
              style={{
                width: `${max > 0 ? (item.value / max) * 100 : 0}%`,
                backgroundColor: color,
              }}
            />
          </div>
          {item.displayValue && (
            <span className="bar-chart__value">{item.displayValue}</span>
          )}
        </div>
      ))}
    </div>
  );
}
