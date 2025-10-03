import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ChartType = 'line' | 'bar' | 'pie' | 'histogram' | 'area' | 'donut' | 'scatter';

export type ChartKey = {
  key: string;
  label: string;
  color?: string;
};

interface ChartRendererProps {
  type: ChartType;
  data: Record<string, any>[];
  xKey: string;
  yKeys: ChartKey[];
  errorMessage?: string;
}

const DEFAULT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
];

const tooltipStyle = {
  backgroundColor: 'var(--bg-elevated)',
  borderColor: 'var(--border)',
  color: 'var(--text-primary)',
};

const tickStyle = { fill: 'var(--text-secondary)' };

const gridColor = 'rgba(148, 163, 184, 0.15)';

function formatTemporalLabel(label: unknown) {
  if (label instanceof Date && !Number.isNaN(label.getTime())) {
    return label.toLocaleDateString();
  }

  if (typeof label === 'string') {
    if (/^\d{4}-\d{2}$/.test(label)) {
      const [year, month] = label.split('-');
      const date = new Date(Number(year), Number(month) - 1);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });
      }
    }

    const parsed = new Date(label);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString();
    }

    return label;
  }

  if (typeof label === 'number' && Number.isFinite(label)) {
    return label.toLocaleString();
  }

  return String(label ?? '');
}

function extractTemporalValue(label: unknown, fallbackIndex: number) {
  if (label instanceof Date && !Number.isNaN(label.getTime())) {
    return { value: label.getTime(), formatted: formatTemporalLabel(label) };
  }

  if (typeof label === 'string') {
    if (/^\d{4}-\d{2}$/.test(label)) {
      const [year, month] = label.split('-');
      const date = new Date(Number(year), Number(month) - 1);
      if (!Number.isNaN(date.getTime())) {
        return { value: date.getTime(), formatted: formatTemporalLabel(date) };
      }
    }

    const parsed = new Date(label);
    if (!Number.isNaN(parsed.getTime())) {
      return { value: parsed.getTime(), formatted: formatTemporalLabel(parsed) };
    }
  }

  return {
    value: fallbackIndex,
    formatted: formatTemporalLabel(label),
  };
}

function buildHistogram(data: Record<string, any>[], key: string) {
  const values = data
    .map((item) => Number(item[key]))
    .filter((value) => Number.isFinite(value));

  if (!values.length) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return [
      {
        range: formatTemporalLabel(min),
        count: values.length,
      },
    ];
  }

  const binCount = Math.min(10, Math.max(4, Math.round(Math.sqrt(values.length))));
  const binSize = (max - min) / binCount;

  const bins = Array.from({ length: binCount }, (_, index) => {
    const start = min + binSize * index;
    const end = index === binCount - 1 ? max : start + binSize;
    return {
      range: `${Math.round(start).toLocaleString()} - ${Math.round(end).toLocaleString()}`,
      count: 0,
    };
  });

  values.forEach((value) => {
    const index = Math.min(
      bins.length - 1,
      Math.floor((value - min) / binSize)
    );
    bins[index].count += 1;
  });

  return bins;
}

export default function ChartRenderer({
  type,
  data,
  xKey,
  yKeys,
  errorMessage,
}: ChartRendererProps) {
  const resolvedKeys = yKeys.filter(Boolean);
  const resolvedData = Array.isArray(data) ? data : [];

  if (errorMessage) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg bg-white/5 text-sm text-red-500 dark:bg-gray-900/30 dark:text-red-300">
        {errorMessage}
      </div>
    );
  }

  if (!resolvedData.length || !resolvedKeys.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg bg-white/5 text-sm text-gray-600 dark:bg-gray-900/30 dark:text-gray-300">
        No data available for the current filters
      </div>
    );
  }

  const palette = resolvedKeys.map(
    (item, index) => item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  );

  if (type === 'pie' || type === 'donut') {
    const seriesKey = resolvedKeys[0];
    const pieData = resolvedData.map((item, index) => ({
      name: formatTemporalLabel(item[xKey]),
      value: Number(item[seriesKey.key]) || 0,
      color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));

    return (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={type === 'donut' ? '60%' : 0}
              outerRadius="90%"
              paddingAngle={2}
            >
              {pieData.map((entry, index) => (
                <Cell key={entry.name ?? index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              contentStyle={tooltipStyle}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'histogram') {
    const histogramData = buildHistogram(resolvedData, resolvedKeys[0].key);
    if (!histogramData.length) {
      return (
        <div className="flex h-72 items-center justify-center rounded-lg bg-white/5 text-sm text-gray-600 dark:bg-gray-900/30 dark:text-gray-300">
          No data available for the current filters
        </div>
      );
    }

    return (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogramData}>
            <CartesianGrid stroke={gridColor} />
            <XAxis dataKey="range" tick={tickStyle} />
            <YAxis tick={tickStyle} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="count" name={resolvedKeys[0].label} fill={palette[0]} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'scatter') {
    const xAxisLabels = new Map<number, string>();
    const scatterSeries = resolvedKeys.map((series) =>
      resolvedData.map((item, index) => {
        const { value, formatted } = extractTemporalValue(item[xKey], index);
        xAxisLabels.set(value, formatted);
        return {
          x: value,
          y: Number(item[series.key]) || 0,
          label: formatted,
        };
      })
    );

    const domainValues = Array.from(xAxisLabels.keys());
    const minDomain = Math.min(...domainValues);
    const maxDomain = Math.max(...domainValues);

    return (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid stroke={gridColor} />
            <XAxis
              type="number"
              dataKey="x"
              domain={[minDomain, maxDomain]}
              tickFormatter={(value) => xAxisLabels.get(value as number) ?? formatTemporalLabel(value)}
              tick={tickStyle}
            />
            <YAxis tick={tickStyle} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={tooltipStyle}
              labelFormatter={(label, payload) => {
                const derivedLabel = payload?.[0]?.payload?.label;
                if (typeof derivedLabel === 'string') {
                  return derivedLabel;
                }
                return formatTemporalLabel(label);
              }}
            />
            <Legend />
            {scatterSeries.map((seriesData, index) => (
              <Scatter
                key={resolvedKeys[index].key}
                name={resolvedKeys[index].label}
                data={seriesData}
                fill={palette[index]}
                line
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const sharedProps = (
    <>
      <CartesianGrid stroke={gridColor} />
      <XAxis dataKey={xKey} tick={tickStyle} tickFormatter={(value) => formatTemporalLabel(value)} />
      <YAxis tick={tickStyle} />
      <Tooltip
        contentStyle={tooltipStyle}
        labelFormatter={(label) => formatTemporalLabel(label)}
        formatter={(value: number, name: string) => [value, name]}
      />
      <Legend />
    </>
  );

  if (type === 'bar') {
    return (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={resolvedData}>
            {sharedProps}
            {resolvedKeys.map((series, index) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                name={series.label}
                fill={palette[index]}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'area') {
    return (
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={resolvedData}>
            {sharedProps}
            {resolvedKeys.map((series, index) => (
              <Area
                key={series.key}
                dataKey={series.key}
                name={series.label}
                type="monotone"
                stroke={palette[index]}
                fill={palette[index]}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={resolvedData}>
          {sharedProps}
          {resolvedKeys.map((series, index) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.label}
              stroke={palette[index]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

