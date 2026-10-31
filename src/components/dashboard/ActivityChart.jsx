import {
  Area,
  AreaChart,
  CartesianGrid,
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
};

export default function ActivityChart({ data }) {
  return (
    <Panel className="h-full">
      <PanelTitle title="Analysis activity" hint="Investigations and sources added over the last 14 days" />
      <ResponsiveContainer width="100%" height={224}>
        <AreaChart data={data} margin={{ left: -22, right: 8, top: 6, bottom: 0 }}>
          <defs>
            <linearGradient id="fillInvestigations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(250 100% 70%)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="hsl(250 100% 70%)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillSources" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(215 100% 61%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(215 100% 61%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(228 16% 56%)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis tick={{ fill: "hsl(228 16% 52%)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
          <Area
            type="monotone"
            dataKey="sources"
            name="Sources"
            stroke="hsl(215 100% 61%)"
            strokeWidth={1.6}
            fill="url(#fillSources)"
          />
          <Area
            type="monotone"
            dataKey="investigations"
            name="Investigations"
            stroke="hsl(250 100% 70%)"
            strokeWidth={1.8}
            fill="url(#fillInvestigations)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center gap-5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full bg-primary" /> Investigations
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full bg-chart-2" /> Sources
        </span>
      </div>
    </Panel>
  );
}