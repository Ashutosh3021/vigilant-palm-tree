"use client"

import type { DailyScore } from "@/lib/types"

interface ScoreTrendChartProps {
  scores: DailyScore[]
}

export function ScoreTrendChart({ scores }: ScoreTrendChartProps) {
  if (!scores || scores.length === 0) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">No data available yet</div>
  }

  const isSinglePoint = scores.length === 1

  // Prepare data for the chart
  const maxScore = 100
  const chartHeight = 180
  const chartWidth = 600
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const dataWidth = chartWidth - padding.left - padding.right
  const dataHeight = chartHeight - padding.top - padding.bottom

  // Calculate points - handle single point case
  const points = scores.map((score, index) => {
    const x = isSinglePoint ? padding.left + dataWidth / 2 : padding.left + (index / (scores.length - 1)) * dataWidth
    const y = padding.top + ((maxScore - score.score) / maxScore) * dataHeight
    return { x, y, score }
  })

  // Create path
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  // Create area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} className="w-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = padding.top + ((maxScore - value) / maxScore) * dataHeight
          return (
            <g key={value}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeDasharray="2,2"
              />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.5">
                {value}%
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaD} fill="hsl(var(--primary))" fillOpacity="0.1" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="hsl(var(--primary))"
            className="hover:r-6 transition-all cursor-pointer"
          >
            <title>{`Day ${index + 1}: ${point.score.score}%`}</title>
          </circle>
        ))}

        {/* X-axis labels */}
        {scores.map((score, index) => {
          if (scores.length > 7 && index % 2 !== 0) return null // Skip some labels if too many
          const x = isSinglePoint
            ? padding.left + dataWidth / 2
            : padding.left + (index / (scores.length - 1)) * dataWidth
          const date = new Date(score.date)
          return (
            <text
              key={index}
              x={x}
              y={chartHeight - padding.bottom + 20}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              opacity="0.5"
            >
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
