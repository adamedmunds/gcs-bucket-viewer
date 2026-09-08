import { useEffect, useState } from "react"
import { ExternalLink, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchObjectText, objectUrl, parseCsv, splitName } from "@/lib/gcs"

const MAX_ROWS = 5000

type Props = {
  host: string
  bucket: string
  name: string
  onClose: () => void
}

export function ObjectPreview({ host, bucket, name, onClose }: Props) {
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    setText(null)
    setError(null)
    fetchObjectText(host, bucket, name)
      .then((t) => live && setText(t))
      .catch((e: Error) => live && setError(e.message))
    return () => {
      live = false
    }
  }, [host, bucket, name])

  const [, file] = splitName(name)
  const isCsv = name.toLowerCase().endsWith(".csv")
  const rows = text !== null && isCsv ? parseCsv(text) : null
  const head = rows?.[0] ?? []
  const shown = rows?.slice(1, MAX_ROWS + 1) ?? []

  return (
    <section className="hairline bg-card/40 rise overflow-hidden rounded-lg border">
      <div className="hairline flex h-10 items-center justify-between gap-3 border-b px-3">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="truncate font-mono text-[11px] font-medium" title={file}>
            {file}
          </span>
          {rows ? (
            <span className="tabular text-muted-foreground shrink-0 text-[11px] whitespace-nowrap">
              {rows.length - 1} rows
              <span className="text-border mx-1.5">/</span>
              {head.length} cols
              {rows.length - 1 > shown.length ? (
                <span className="text-muted-foreground/60"> · first {shown.length}</span>
              ) : null}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            aria-label="Open raw file"
            title="Open raw file"
            className="text-muted-foreground hover:text-foreground size-6"
            render={<a href={objectUrl(host, bucket, name)} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close preview"
            title="Close preview"
            className="text-muted-foreground hover:text-foreground size-6"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-3">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : text === null ? (
        <div className="space-y-1.5 p-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      ) : rows ? (
        <ScrollArea className="h-[52vh] w-full">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="bg-card hairline text-muted-foreground border-r border-b px-2.5 py-1.5 text-right font-semibold tracking-[0.06em] whitespace-nowrap uppercase">
                  #
                </th>
                {head.map((c, i) => (
                  <th
                    key={i}
                    className="bg-card hairline text-muted-foreground border-r border-b px-2.5 py-1.5 text-left font-semibold tracking-[0.06em] whitespace-nowrap uppercase last:border-r-0"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, ri) => (
                <tr key={ri} className="hover:bg-accent/40 transition-colors">
                  {/* The file's own line number, so a row can be found in the raw CSV. */}
                  <td className="hairline text-muted-foreground border-r border-b px-2.5 py-1.5 text-right font-mono tabular-nums whitespace-nowrap">
                    {ri + 2}
                  </td>
                  {head.map((_, ci) => (
                    <td
                      key={ci}
                      className="hairline border-r border-b px-2.5 py-1.5 font-mono whitespace-nowrap last:border-r-0"
                    >
                      {r[ci] || <span className="text-muted-foreground/30">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      ) : (
        <ScrollArea className="h-[52vh] w-full">
          <pre className="p-3 font-mono text-[11px] leading-relaxed">{text.slice(0, 20000)}</pre>
        </ScrollArea>
      )}
    </section>
  )
}
