/** Minimal client for the fake-gcs-server JSON API. */

export type GcsObject = {
  name: string
  size?: string
  updated?: string
  timeCreated?: string
  contentType?: string
}

export const DEFAULT_HOST = "http://localhost:4443"

/** Lets you point at another emulator with ?host=http://localhost:PORT */
export function hostFromQuery(): string {
  return new URLSearchParams(window.location.search).get("host") || DEFAULT_HOST
}

async function getJson<T>(host: string, path: string): Promise<T> {
  const res = await fetch(host + path)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`)
  return (await res.json()) as T
}

export async function listBuckets(host: string): Promise<string[]> {
  const data = await getJson<{ items?: { name: string }[] }>(host, "/storage/v1/b")
  return (data.items ?? []).map((b) => b.name).sort()
}

export async function listObjects(host: string, bucket: string): Promise<GcsObject[]> {
  const data = await getJson<{ items?: GcsObject[] }>(
    host,
    `/storage/v1/b/${encodeURIComponent(bucket)}/o`,
  )
  return (data.items ?? []).sort((a, b) => a.name.localeCompare(b.name))
}

export function objectUrl(host: string, bucket: string, name: string): string {
  return `${host}/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(name)}?alt=media`
}

export async function fetchObjectText(host: string, bucket: string, name: string): Promise<string> {
  const res = await fetch(objectUrl(host, bucket, name))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

export function formatBytes(size?: string): string {
  const n = Number(size)
  if (!Number.isFinite(n)) return "?"
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}

export function formatWhen(iso?: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toISOString().replace("T", " ").slice(0, 19)
}

/** "reports/2026-08-26T12/file.csv" -> ["reports/2026-08-26T12", "file.csv"] */
export function splitName(name: string): [string, string] {
  const i = name.lastIndexOf("/")
  return i < 0 ? ["(root)", name] : [name.slice(0, i), name.slice(i + 1)]
}

/** Enough CSV for an export: quoted fields, escaped quotes, commas inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else if (c !== "\r") field += c
  }
  if (field !== "" || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.length > 1 || r[0] !== "")
}

export function groupByPrefix(objects: GcsObject[]): Map<string, (GcsObject & { file: string })[]> {
  const groups = new Map<string, (GcsObject & { file: string })[]>()
  for (const o of objects) {
    const [dir, file] = splitName(o.name)
    const list = groups.get(dir) ?? []
    list.push({ ...o, file })
    groups.set(dir, list)
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)))
}
