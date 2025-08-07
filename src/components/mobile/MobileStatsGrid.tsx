"use client"

interface StatItem {
  label: string
  value: string | number
  color: "primary" | "success" | "warning" | "danger" | "info"
  icon?: string
}

interface MobileStatsGridProps {
  stats: StatItem[]
}

export default function MobileStatsGrid({ stats }: MobileStatsGridProps) {
  return (
    <div className="mobile-stats-grid d-mobile-only d-flex gap-1 d-flex-wrap">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card border-${stat.color} flex-grow-1 text-center`}>
          {stat.icon && <i className={`${stat.icon} text-${stat.color} mb-2`} style={{ fontSize: "1.5rem" }}></i>}
          <div className={`stat-value text-${stat.color}`}>{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}