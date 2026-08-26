import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  buckets: string[] | null
  counts: Record<string, number | null>
  selected: string | null
  onSelect: (bucket: string) => void
  onRefresh: () => void
  busy: boolean
}

export function BucketList({ buckets, counts, selected, onSelect, onRefresh, busy }: Props) {
  return (
    <aside className="hairline bg-card/40 overflow-hidden rounded-lg border">
      <div className="hairline flex h-10 items-center justify-between border-b px-3">
        <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.12em] uppercase">
          Buckets
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={busy}
          aria-label="Refresh"
          title="Refresh"
          className="text-muted-foreground hover:text-foreground size-6"
        >
          <RefreshCw className={"size-3.5 " + (busy ? "animate-spin" : "")} />
        </Button>
      </div>

      <div className="p-1.5">
        {buckets === null ? (
          <div className="space-y-1.5 p-1">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : buckets.length === 0 ? (
          <p className="text-muted-foreground px-2 py-3 text-xs">No buckets.</p>
        ) : (
          buckets.map((b, i) => {
            const n = counts[b]
            const active = b === selected
            return (
              <button
                key={b}
                onClick={() => onSelect(b)}
                aria-current={active}
                style={{ animationDelay: `${i * 28}ms` }}
                className={
                  "rise group relative flex w-full items-center gap-2 rounded-md py-2 pr-2 pl-3 text-left transition-colors " +
                  (active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50")
                }
              >
                <span
                  aria-hidden
                  className={
                    "absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full transition-colors " +
                    (active ? "bg-primary" : "bg-transparent group-hover:bg-border")
                  }
                />
                <span className="min-w-0 flex-1 truncate font-mono text-[11px]" title={b}>
                  {b}
                </span>
                <span
                  className={
                    "tabular shrink-0 text-[11px] " +
                    (n ? "text-primary font-semibold" : "text-muted-foreground/50")
                  }
                >
                  {n === null ? "—" : n}
                </span>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
