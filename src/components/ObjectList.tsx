import { FileText, Folder } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBytes, formatWhen, groupByPrefix, type GcsObject } from "@/lib/gcs"

type Props = {
  bucket: string | null
  objects: GcsObject[] | null
  selectedName: string | null
  onSelect: (name: string) => void
}

export function ObjectList({ bucket, objects, selectedName, onSelect }: Props) {
  const total = (objects ?? []).reduce((sum, o) => sum + Number(o.size ?? 0), 0)
  const groups = objects ? groupByPrefix(objects) : null

  return (
    <section className="hairline bg-card/40 overflow-hidden rounded-lg border">
      <div className="hairline flex h-10 items-center justify-between gap-3 border-b px-3">
        <span className="min-w-0 truncate font-mono text-[11px] font-medium" title={bucket ?? ""}>
          {bucket ?? "No bucket selected"}
        </span>
        {objects?.length ? (
          <span className="tabular text-muted-foreground shrink-0 text-[11px]">
            {objects.length} object{objects.length === 1 ? "" : "s"}
            <span className="text-border mx-1.5">/</span>
            {formatBytes(String(total))}
          </span>
        ) : null}
      </div>

      {objects === null ? (
        <div className="space-y-1.5 p-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : objects.length === 0 ? (
        <p className="text-muted-foreground px-3 py-10 text-center text-xs">
          This bucket is empty.
        </p>
      ) : (
        <div>
          {/* Column labels, so the numbers on the right are not unexplained. */}
          <div className="text-muted-foreground/70 hairline grid grid-cols-[1fr_5.5rem_10rem] gap-3 border-b px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase">
            <span>Object</span>
            <span className="text-right">Size</span>
            <span className="text-right">Updated</span>
          </div>

          {[...groups!.entries()].map(([dir, items]) => (
            <div key={dir}>
              <div className="bg-muted/40 hairline flex items-center gap-1.5 border-b px-3 py-1.5">
                <Folder className="text-muted-foreground/60 size-3 shrink-0" />
                <span className="text-muted-foreground truncate font-mono text-[10px]" title={dir}>
                  {dir}/
                </span>
              </div>

              {items.map((o) => {
                const active = o.name === selectedName
                return (
                  <button
                    key={o.name}
                    onClick={() => onSelect(o.name)}
                    aria-current={active}
                    className={
                      "group hairline relative grid w-full grid-cols-[1fr_5.5rem_10rem] items-center gap-3 border-b px-3 py-2 text-left transition-colors last:border-b-0 " +
                      (active ? "bg-accent" : "hover:bg-accent/40")
                    }
                  >
                    <span
                      aria-hidden
                      className={
                        "absolute top-0 bottom-0 left-0 w-[2px] transition-colors " +
                        (active ? "bg-primary" : "bg-transparent")
                      }
                    />
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText
                        className={
                          "size-3.5 shrink-0 transition-colors " +
                          (active ? "text-primary" : "text-muted-foreground/50")
                        }
                      />
                      <span className="truncate font-mono text-[11px]" title={o.file}>
                        {o.file}
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-right font-mono text-[11px] font-medium">
                      {formatBytes(o.size)}
                    </span>
                    <time className="text-muted-foreground shrink-0 text-right font-mono text-[11px]">
                      {formatWhen(o.updated ?? o.timeCreated)}
                    </time>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
