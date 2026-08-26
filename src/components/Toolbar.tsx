import { HardDrive } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ThemeToggle"
import type { Theme } from "@/lib/theme"

type Props = {
  host: string
  onHostChange: (host: string) => void
  connected: boolean | null
  theme: Theme
  onToggleTheme: () => void
}

export function Toolbar({ host, onHostChange, connected, theme, onToggleTheme }: Props) {
  return (
    <header className="bg-background/85 hairline sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <HardDrive className="text-primary size-4 shrink-0" strokeWidth={2.25} />
          <h1 className="text-[13px] font-semibold tracking-tight whitespace-nowrap">
            Local GCS Viewer
          </h1>
          <span className="text-muted-foreground/60 hidden text-[11px] whitespace-nowrap sm:inline">
            read-only
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className={
                "size-1.5 shrink-0 rounded-full transition-colors " +
                (connected === null
                  ? "bg-muted-foreground/40"
                  : connected
                    ? "bg-primary"
                    : "bg-destructive")
              }
            />
            <span className="sr-only">
              {connected === null ? "Connecting" : connected ? "Connected" : "Not connected"}
            </span>
            <Input
              value={host}
              onChange={(e) => onHostChange(e.target.value)}
              spellCheck={false}
              aria-label="Emulator host"
              className="h-8 w-[15rem] font-mono text-[11px]"
            />
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
