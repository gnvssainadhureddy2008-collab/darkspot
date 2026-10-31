import { cn } from "@/lib/utils";

export function Panel({ className = "", children, ...props }) {
  return (
    <section className={cn("panel p-5 sm:p-6", className)} {...props}>
      {children}
    </section>
  );
}

export function PanelTitle({ title, hint, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-heading text-sm font-medium tracking-tight text-foreground">{title}</h2>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

const severityStyles = {
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
  high: "border-chart-5/30 bg-chart-5/10 text-chart-5",
  medium: "border-chart-2/30 bg-chart-2/10 text-chart-2",
  low: "border-white/10 bg-white/[0.04] text-muted-foreground",
};

export function SeverityBadge({ severity = "medium" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        severityStyles[severity] || severityStyles.low,
      )}
    >
      {severity}
    </span>
  );
}

const statusStyles = {
  supported: "border-chart-4/30 bg-chart-4/10 text-chart-4",
  partial: "border-chart-2/30 bg-chart-2/10 text-chart-2",
  unsupported: "border-destructive/30 bg-destructive/10 text-destructive",
  unclear: "border-white/10 bg-white/[0.04] text-muted-foreground",
  complete: "border-chart-4/30 bg-chart-4/10 text-chart-4",
  analyzing: "border-primary/30 bg-primary/10 text-primary",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
  draft: "border-white/10 bg-white/[0.04] text-muted-foreground",
  analyzed: "border-chart-4/30 bg-chart-4/10 text-chart-4",
  collected: "border-chart-2/30 bg-chart-2/10 text-chart-2",
  pending: "border-white/10 bg-white/[0.04] text-muted-foreground",
  confirmed: "border-chart-5/30 bg-chart-5/10 text-chart-5",
  needs_verification: "border-primary/30 bg-primary/10 text-primary",
};

export function StatusBadge({ status = "draft", label }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
        statusStyles[status] || statusStyles.draft,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {label || String(status).replace(/_/g, " ")}
    </span>
  );
}

export function Metric({ label, value, hint, tone = "text-foreground" }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-heading text-2xl font-semibold tracking-tight", tone)}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action, className = "" }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
          <Icon className="h-5 w-5 text-primary/80" />
        </span>
      )}
      <h3 className="font-heading text-sm font-medium">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ScoreRing({ value = 0, size = 56 }) {
  const score = Math.max(0, Math.min(100, Math.round(value)));
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(0 0% 100% / 0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(250 100% 70%)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute font-heading text-[11px] font-semibold tracking-tight">{score}%</span>
    </div>
  );
}