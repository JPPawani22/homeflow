"use client"

interface TodoFiltersProps {
  currentFilter: "all" | "pending" | "completed" | "high" | "medium" | "low"
  onFilterChange: (filter: "all" | "pending" | "completed" | "high" | "medium" | "low") => void
  stats: {
    total: number
    completed: number
    pending: number
    highPriority: number
  }
}

export default function TodoFilters({ currentFilter, onFilterChange, stats }: TodoFiltersProps) {
  const filters = [
    { key: "all", label: "All Todos", count: stats.total, icon: "bi-list-ul", color: "primary" },
    { key: "pending", label: "Pending", count: stats.pending, icon: "bi-clock", color: "warning" },
    { key: "completed", label: "Completed", count: stats.completed, icon: "bi-check-circle", color: "success" },
    {
      key: "high",
      label: "High Priority",
      count: stats.highPriority,
      icon: "bi-exclamation-triangle",
      color: "danger",
    },
  ] as const

  return (
    <div className="mb-4">
      <div className="row">
        <div className="col-md-8">
          <div className="btn-group" role="group" aria-label="Todo filters">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`btn ${
                  currentFilter === filter.key ? `btn-${filter.color}` : `btn-outline-${filter.color}`
                }`}
                onClick={() => onFilterChange(filter.key)}
              >
                <i className={`${filter.icon} me-2`}></i>
                {filter.label}
                <span className="badge bg-light text-dark ms-2">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="col-md-4">
          <div className="btn-group w-100" role="group" aria-label="Priority filters">
            <button
              type="button"
              className={`btn ${currentFilter === "high" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => onFilterChange("high")}
            >
              High
            </button>
            <button
              type="button"
              className={`btn ${currentFilter === "medium" ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => onFilterChange("medium")}
            >
              Medium
            </button>
            <button
              type="button"
              className={`btn ${currentFilter === "low" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => onFilterChange("low")}
            >
              Low
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
