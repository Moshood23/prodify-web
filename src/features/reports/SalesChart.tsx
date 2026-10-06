import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useSalesChart } from './hooks'
import { ErrorAlert } from '../../components/ui/Alert'
import { formatNaira } from '../../lib/format'
import { getErrorMessage } from '../../services/api/apiError'
import type { SalesDay, SalesRange } from '../../types/report'

const ranges: { value: SalesRange; label: string }[] = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

const PLOT_HEIGHT = 180
const AXIS_WIDTH = 52
const AXIS_HEIGHT = 22
const MAX_BAR = 24
const RADIUS = 4
const TOOLTIP_WIDTH = 150

const compactNaira = new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 })
const longDay = new Intl.DateTimeFormat('en-NG', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const shortDay = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', timeZone: 'UTC' })

// "2026-10-05" is a calendar day, so it's read as UTC and shown without shifting.
const toDate = (day: string) => new Date(`${day}T00:00:00Z`)
const nairaShort = (n: number) => '\u20A6' + compactNaira.format(n)

// A round top for the y-axis: 1, 2 or 5 times a power of ten, so ticks are clean numbers.
function niceMax(value: number): number {
  if (value <= 0) return 1000
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((m) => m * power >= value)!
  return step * power
}

// A column with a 4px rounded top and a square foot on the baseline.
function columnPath(x: number, y: number, width: number, height: number) {
  const r = Math.min(RADIUS, width / 2, height)
  const bottom = y + height
  return `M${x},${bottom} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${bottom} Z`
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, width }
}

function Columns({ points }: { points: SalesDay[] }) {
  const { ref, width } = useWidth()
  const [active, setActive] = useState<number | null>(null)

  const plotWidth = Math.max(0, width - AXIS_WIDTH)
  const band = points.length > 0 ? plotWidth / points.length : 0
  // Thin columns with at least a 2px gap between neighbours.
  const barWidth = Math.max(1, Math.min(MAX_BAR, band * 0.6, band - 2))
  const top = niceMax(Math.max(...points.map((p) => p.sales)))
  const ticks = [0, top / 2, top]
  const y = (value: number) => PLOT_HEIGHT - (value / top) * PLOT_HEIGHT

  // Dates under the axis: first, middle and last day.
  const labelled = new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const current = active ?? points.length - 1
    setActive(Math.max(0, Math.min(points.length - 1, current + (e.key === 'ArrowRight' ? 1 : -1))))
  }

  const shown = active !== null ? points[active] : null
  // The tooltip sits beside the column, on whichever side has room, so it never covers it.
  const columnCentre = active !== null ? AXIS_WIDTH + band * active + band / 2 : 0
  const onRight = columnCentre + TOOLTIP_WIDTH + 16 <= width
  const tipLeft = onRight ? columnCentre + barWidth / 2 + 8 : columnCentre - barWidth / 2 - 8 - TOOLTIP_WIDTH

  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={PLOT_HEIGHT + AXIS_HEIGHT + 8}
          role="img"
          aria-label="Sales per day. Use the left and right arrow keys to read each day."
          tabIndex={0}
          onKeyDown={onKeyDown}
          onFocus={() => setActive((a) => a ?? points.length - 1)}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
          className="block overflow-visible rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <g transform="translate(0,8)">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={AXIS_WIDTH} x2={width} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
                <text x={AXIS_WIDTH - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
                  {nairaShort(t)}
                </text>
              </g>
            ))}

            {points.map((p, i) => {
              const x = AXIS_WIDTH + band * i + (band - barWidth) / 2
              const h = PLOT_HEIGHT - y(p.sales)
              return (
                <g key={p.date}>
                  {h > 0 && (
                    <path
                      d={columnPath(x, y(p.sales), barWidth, h)}
                      className="fill-chart"
                      opacity={active === null || active === i ? 1 : 0.55}
                    />
                  )}
                  {/* The whole slot is the hover target, not just the painted column. */}
                  <rect
                    x={AXIS_WIDTH + band * i}
                    y={0}
                    width={band}
                    height={PLOT_HEIGHT}
                    fill="transparent"
                    onPointerEnter={() => setActive(i)}
                  />
                  {labelled.has(i) && (
                    <text
                      x={AXIS_WIDTH + band * i + band / 2}
                      y={PLOT_HEIGHT + 16}
                      textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
                      className="fill-muted text-[11px]"
                    >
                      {shortDay.format(toDate(p.date))}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      )}

      {shown && (
        <div
          role="status"
          className="pointer-events-none absolute top-0 z-10 rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md"
          style={{ left: Math.max(0, tipLeft), width: TOOLTIP_WIDTH }}
        >
          <p className="text-sm font-bold">{formatNaira(shown.sales)}</p>
          <p className="text-muted">{longDay.format(toDate(shown.date))}</p>
          <p className="text-muted">
            {shown.orders} {shown.orders === 1 ? 'order' : 'orders'}
          </p>
        </div>
      )}
    </div>
  )
}

function SalesTable({ points }: { points: SalesDay[] }) {
  const days = points.filter((p) => p.sales > 0).reverse()
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs text-muted">
        <tr>
          <th className="py-1 font-medium">Day</th>
          <th className="py-1 text-right font-medium">Orders</th>
          <th className="py-1 text-right font-medium">Sales</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {days.map((p) => (
          <tr key={p.date}>
            <td className="py-1.5">{longDay.format(toDate(p.date))}</td>
            <td className="py-1.5 text-right tabular-nums">{p.orders}</td>
            <td className="py-1.5 text-right tabular-nums">{formatNaira(p.sales)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface SalesChartProps {
  scope: 'seller' | 'shop'
  title: string
}

// Sales per day with a 7 / 30 / 90 day switch, totals above and a table view for every value.
export function SalesChart({ scope, title }: SalesChartProps) {
  const [days, setDays] = useState<SalesRange>(30)
  const [asTable, setAsTable] = useState(false)
  const { data, isLoading, isFetching, error } = useSalesChart(scope, days)

  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold">{title}</h2>
        <div role="group" aria-label="Time range" className="flex rounded-lg border border-border p-0.5 text-sm">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              aria-pressed={days === r.value}
              className={`rounded-md px-3 py-1 font-medium ${days === r.value ? 'bg-primary text-white' : 'text-muted hover:text-ink'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorAlert>{getErrorMessage(error, 'Could not load sales.')}</ErrorAlert>
      ) : isLoading || !data ? (
        <div className="h-56 animate-pulse rounded-lg bg-surface" aria-busy="true" aria-label="Loading sales" />
      ) : (
        <div className={`space-y-4 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          <dl className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <dt className="text-xs text-muted">Sales</dt>
              <dd className="text-2xl font-bold">{formatNaira(data.totalSales)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Orders</dt>
              <dd className="text-2xl font-bold">{data.totalOrders}</dd>
            </div>
            {data.commissionEarned !== null && (
              <div>
                <dt className="text-xs text-muted">Commission earned</dt>
                <dd className="text-2xl font-bold">{formatNaira(data.commissionEarned)}</dd>
              </div>
            )}
          </dl>

          {data.totalSales === 0 ? (
            <p className="rounded-lg bg-surface px-4 py-10 text-center text-sm text-muted">No sales in the last {data.days} days yet.</p>
          ) : asTable ? (
            <SalesTable points={data.points} />
          ) : (
            <Columns points={data.points} />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <p>Paid and pay-on-delivery orders, by the day they were placed. Cancelled items are left out.</p>
            {data.totalSales > 0 && (
              <button onClick={() => setAsTable((t) => !t)} className="font-semibold text-primary hover:underline">
                {asTable ? 'Show as chart' : 'Show as table'}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}