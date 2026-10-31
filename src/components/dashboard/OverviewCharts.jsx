import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, PanelTitle } from "@/components/common/Panels";

const tooltipStyle = {
  background: "hsl(230 42% 8%)",
  border: "1px solid hsl(0 0% 100% / 0.12)",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(235 38% 94%)",
  boxShadow: "0 20px 50px -20px rgba(0,0,0,0.9)",
};

const reliabilityColors = {
  supported: "hsl(173 70% 52%)",
  partial: "hsl(215 100% 61%)",
  unsupported: "hsl(0 72% 58%)",
  unclear: "hsl(228 12% 42%)",
};

const severityColors = {
  critical: "hsl(0 72% 58%)",
  high: "hsl(36 92% 62%)",
  medium: "hsl(215 100% 61%)",
  low: "hsl(228 16% 46%)",
};

function ChartEmpty({ children }) {
  return (
    <div className="flex h-[196px] items-center justify-center rounded-xl border border-dashed border-white/10 px-6 text-center">
      <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

export function CompletenessPanel({ data }) {
  const hasData = data.length > 0;
  return (
    <Panel>
      <PanelTitle title="Completeness by investigation" hint="How fully the evidence answers the question" />
      {hasData ? (
        <ResponsiveContainer width="100%" height={Math.max(196, data.length * 44)}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={104}
              tick={{ fill: "hsl(228 16% 64%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} formatter={(v) => [`${v}%`, "Completeness"]} />
            <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={10} fill="hsl(250 100% 70%)">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.value >= 70 ? "hsl(250 100% 70%)" : entry.value >= 40 ? "hsl(215 100% 61%)" : "hsl(36 92% 62%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ChartEmpty>Completeness appears here once an investigation finishes its analysis.</ChartEmpty>
      )}
    </Panel>
  );
}

export function ReliabilityPanel({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <Panel>
      <PanelTitle title="Evidence reliability" hint="Every extracted claim, scored" />
      {total > 0 ? (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <div className="relative h-[168px] w-[168px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={reliabilityColors[entry.key]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-2xl font-semibold leading-none">{total}</span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">claims</span>
            </div>
          </div>
          <ul className="w-full space-y-2.5">
            {data.map((entry) => (
              <li key={entry.key} className="flex items-center gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: reliabilityColors[entry.key] }} />
                <span className="flex-1 text-muted-foreground">{entry.name}</span>
                <span className="font-mono text-[11px] text-foreground">{entry.value}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ChartEmpty>Claim scoring appears after your sources are analysed.</ChartEmpty>
      )}
    </Panel>
  );
}

export function GapSeverityPanel({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <Panel>
      <PanelTitle title="Gap severity distribution" hint="Where the evidence base breaks down" />
      {total > 0 ? (
        <ResponsiveContainer width="100%" height={196}>
          <BarChart data={data} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(228 16% 64%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: "hsl(228 16% 52%)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} formatter={(v) => [v, "Gaps"]} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={34}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={severityColors[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ChartEmpty>No information gaps recorded yet — run an analysis to surface them.</ChartEmpty>
      )}
    </Panel>
  );
}