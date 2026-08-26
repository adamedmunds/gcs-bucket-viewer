import { useCallback, useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BucketList } from "@/components/BucketList"
import { ObjectList } from "@/components/ObjectList"
import { ObjectPreview } from "@/components/ObjectPreview"
import { Toolbar } from "@/components/Toolbar"
import { hostFromQuery, listBuckets, listObjects, type GcsObject } from "@/lib/gcs"
import { useTheme } from "@/lib/theme"

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const [host, setHost] = useState(hostFromQuery)
  const [buckets, setBuckets] = useState<string[] | null>(null)
  const [counts, setCounts] = useState<Record<string, number | null>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [objects, setObjects] = useState<GcsObject[] | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)

  // Every refresh changes this, so the effects below always re-run. Without it, re-selecting
  // the bucket that is already selected is a no-op to React and the object list never reloads.
  const [reload, setReload] = useState(0)
  const refresh = useCallback(() => setReload((n) => n + 1), [])

  useEffect(() => {
    let live = true
    setBusy(true)
    setError(null)
    setBuckets(null)
    setPreview(null)

    listBuckets(host)
      .then(async (names) => {
        if (!live) return
        setConnected(true)
        setBuckets(names)
        const pairs = await Promise.all(
          names.map(async (n): Promise<[string, number | null]> => {
            try {
              return [n, (await listObjects(host, n)).length]
            } catch {
              return [n, null]
            }
          }),
        )
        if (!live) return
        setCounts(Object.fromEntries(pairs))
        setSelected((current) => {
          if (current && names.includes(current)) return current
          const firstFull = pairs.find(([, c]) => (c ?? 0) > 0)
          return firstFull ? firstFull[0] : (names[0] ?? null)
        })
      })
      .catch((e: Error) => {
        if (!live) return
        setConnected(false)
        setBuckets([])
        setError(`${e.message} — is a storage emulator running on ${host}?`)
      })
      .finally(() => live && setBusy(false))

    return () => {
      live = false
    }
  }, [host, reload])

  useEffect(() => {
    if (!selected) return
    let live = true
    setObjects(null)
    setPreview(null)
    listObjects(host, selected)
      .then((items) => live && setObjects(items))
      .catch((e: Error) => live && setError(e.message))
    return () => {
      live = false
    }
  }, [host, selected, reload])

  return (
    <div className="min-h-dvh">
      <Toolbar
        host={host}
        onHostChange={setHost}
        connected={connected}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {error ? (
          <Alert variant="destructive" className="mb-5">
            <AlertTitle>Could not reach the emulator</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[260px_1fr]">
          <BucketList
            buckets={buckets}
            counts={counts}
            selected={selected}
            onSelect={setSelected}
            onRefresh={refresh}
            busy={busy}
          />

          <div className="min-w-0 space-y-5">
            <ObjectList
              bucket={selected}
              objects={objects}
              selectedName={preview}
              onSelect={setPreview}
            />
            {preview && selected ? (
              <ObjectPreview
                host={host}
                bucket={selected}
                name={preview}
                onClose={() => setPreview(null)}
              />
            ) : null}
          </div>
        </div>

        <p className="text-muted-foreground/50 mt-8 font-mono text-[10px]">
          fake-gcs-server · objects live in the container only and are lost on restart
        </p>
      </main>
    </div>
  )
}
