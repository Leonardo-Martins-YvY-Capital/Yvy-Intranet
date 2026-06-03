import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { useFundsQuery } from '../hooks/useFundsQuery';
import { PageHeader } from '../components/ui/PageHeader';
import { KPIRow } from '../components/ui/KPIRow';
import { ChartContainer } from '../components/ui/ChartContainer';
import { ApiErrorBanner } from '../components/ui/ApiErrorBanner';

// Static chart data — replace with API queries when dashboard endpoints are available
const AUM_TREND = [
  { month: 'Jun', aum: 820 },
  { month: 'Jul', aum: 932 },
  { month: 'Ago', aum: 901 },
  { month: 'Set', aum: 1050 },
  { month: 'Out', aum: 1120 },
  { month: 'Nov', aum: 1180 },
  { month: 'Dez', aum: 1095 },
  { month: 'Jan', aum: 1210 },
  { month: 'Fev', aum: 1350 },
  { month: 'Mar', aum: 1290 },
  { month: 'Abr', aum: 1420 },
  { month: 'Mai', aum: 1510 },
];

const MONTHLY_SUBSCRIPTIONS = [
  { month: 'Jan', value: 42 },
  { month: 'Fev', value: 68 },
  { month: 'Mar', value: 55 },
  { month: 'Abr', value: 91 },
  { month: 'Mai', value: 78 },
  { month: 'Jun', value: 103 },
];

const FUND_TYPE_BREAKDOWN = [
  { name: 'FII', value: 38 },
  { name: 'FIM', value: 27 },
  { name: 'FIA', value: 22 },
  { name: 'FIC', value: 13 },
];

const DONUT_COLORS = ['#122C4F', '#3E5FAA', '#5B7EC4', '#8FA5D4'];

const AXIS_STYLE = { fontSize: 11, fontFamily: 'Barlow', fill: '#122C4F99' };
const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#122C4F',
    border: 'none',
    borderRadius: 0,
    padding: '6px 12px',
    fontFamily: 'Barlow',
    fontSize: 12,
    color: '#fff',
  },
  itemStyle: { color: '#fff' },
  cursor: { fill: '#122C4F0D' },
};

export default function Home() {
  const { data: funds, isLoading: fundsLoading, error: fundsError } = useFundsQuery();

  const activeCount = funds?.filter((f) => f.status === 'Active').length ?? 0;
  const totalCount = funds?.length ?? 0;

  const kpiItems = [
    {
      label: 'AUM Total',
      value: 'R$ 1,51B',
      delta: { value: '+8,4%', direction: 'up' as const },
      caption: 'vs. mai/25',
      loading: false,
    },
    {
      label: 'Fundos Ativos',
      value: fundsLoading ? '—' : String(activeCount),
      caption: `${totalCount} total`,
      loading: fundsLoading,
    },
    {
      label: 'Investidores',
      value: '—',
      caption: 'Em breve',
      loading: false,
    },
    {
      label: 'Retorno 12M',
      value: '+14,2%',
      delta: { value: '+2,1pp', direction: 'up' as const },
      caption: 'vs. CDI',
      loading: false,
    },
  ];

  return (
    <div className="p-6 max-w-[1366px] mx-auto space-y-6">
      <PageHeader title="Dashboard" subtitle="Visão consolidada — Jun/2026" />

      <ApiErrorBanner error={fundsError} />

      <KPIRow items={kpiItems} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AUM trend — spans 2 cols */}
        <div className="lg:col-span-2">
          <ChartContainer
            title="AUM Total"
            caption="Jun/25 – Mai/26 (R$ M)"
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={AUM_TREND} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3E5FAA" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3E5FAA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#12274F15" />
                <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis
                  tick={AXIS_STYLE}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}`}
                />
                <RechartsTooltip
                  {...TOOLTIP_STYLE}
                  formatter={(v) => [`R$ ${v as number}M`, 'AUM']}
                />
                <Area
                  type="monotone"
                  dataKey="aum"
                  stroke="#3E5FAA"
                  strokeWidth={2}
                  fill="url(#aumGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#3E5FAA' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Fund type donut */}
        <ChartContainer title="Composição" caption="Por tipo de fundo (%)">
          <div className="relative flex items-center justify-center" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={FUND_TYPE_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {FUND_TYPE_BREAKDOWN.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  {...TOOLTIP_STYLE}
                  formatter={(v) => [`${v as number}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-barlowcn uppercase tracking-widest text-yvy-navy/45">
                Fundos
              </span>
              <span className="text-2xl font-barlowcn font-semibold text-yvy-navy">
                {totalCount || 4}
              </span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
            {FUND_TYPE_BREAKDOWN.map((d, i) => (
              <div key={d.name} className="flex items-center gap-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                />
                <span className="text-xs font-barlowcn text-yvy-navy/60">
                  {d.name} {d.value}%
                </span>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>

      {/* Monthly subscriptions bar */}
      <ChartContainer
        title="Captações Mensais"
        caption="Jan – Jun/26 (R$ M)"
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={MONTHLY_SUBSCRIPTIONS}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            barSize={28}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#12274F15" vertical={false} />
            <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis
              tick={AXIS_STYLE}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}`}
            />
            <RechartsTooltip
              {...TOOLTIP_STYLE}
              formatter={(v) => [`R$ ${v as number}M`, 'Captação']}
            />
            <Bar dataKey="value" fill="#3E5FAA" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
