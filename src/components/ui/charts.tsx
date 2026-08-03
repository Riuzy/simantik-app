'use client';

import { Box, Text, Tooltip } from '@mantine/core';

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: ChartDatum[];
  height?: number;
  showValues?: boolean;
}

export function BarChart({ data, height = 180, showValues = false }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const width = Math.max(data.length * 44, 240);

  return (
    <Box style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * (height - 40);
          const x = i * 44 + 8;
          const y = height - 24 - barH;
          const color = d.color ?? 'var(--mantine-color-blue-6)';
          return (
            <Tooltip key={i} label={`${d.label}: ${d.value}`} withArrow>
              <g>
                {showValues && d.value > 0 && (
                  <text x={x + 14} y={y - 6} textAnchor="middle" fontSize={11} fill="var(--mantine-color-dimmed)">
                    {d.value}
                  </text>
                )}
                <rect
                  x={x}
                  y={y}
                  width={28}
                  height={barH}
                  rx={4}
                  fill={color}
                  opacity={0.9}
                  style={{ transition: 'height 0.3s ease' }}
                />
              </g>
            </Tooltip>
          );
        })}
      </svg>
      <Box style={{ display: 'flex', width, gap: 16, padding: '0 8px' }}>
        {data.map((d, i) => (
          <Text key={i} size="xs" c="dimmed" ta="center" style={{ width: 44, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.label}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

interface StackedBarProps {
  segments: ChartDatum[];
  height?: number;
}

export function StackedBar({ segments, height = 16 }: StackedBarProps) {
  const total = Math.max(1, segments.reduce((sum, s) => sum + s.value, 0));
  return (
    <Box style={{ display: 'flex', width: '100%', height, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--mantine-color-gray-1)' }}>
      {segments.map((s, i) =>
        s.value > 0 ? (
          <Tooltip key={i} label={`${s.label}: ${s.value}`} withArrow>
            <Box style={{ width: `${(s.value / total) * 100}%`, height: '100%', backgroundColor: s.color ?? 'var(--mantine-color-blue-6)', transition: 'width 0.3s ease' }} />
          </Tooltip>
        ) : null,
      )}
    </Box>
  );
}

export function DonutChart({ data, size = 120, thickness = 14 }: { data: ChartDatum[]; size?: number; thickness?: number }) {
  const total = Math.max(1, data.reduce((sum, s) => sum + s.value, 0));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce<{ color: string; len: number; dashoffset: number }[]>((acc, s) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].dashoffset : 0;
    const len = (s.value / total) * circumference;
    acc.push({ color: s.color ?? 'var(--mantine-color-blue-6)', len, dashoffset: -prev });
    return acc;
  }, []);

  return (
    <Box pos="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--mantine-color-gray-1)" strokeWidth={thickness} />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${s.len} ${circumference - s.len}`}
            strokeDashoffset={s.dashoffset}
          />
        ))}
      </svg>
      <Box pos="absolute" inset={0} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Text fw={700} fz="xl" lh={1}>{total}</Text>
        <Text size="xs" c="dimmed">Total</Text>
      </Box>
    </Box>
  );
}
