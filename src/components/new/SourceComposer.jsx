import { useRef, useState } from "react";
import { FileText, Globe, Loader2, NotebookPen, Paperclip, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const TABS = [
  { key: "website", label: "Website", icon: Globe },
  { key: "document", label: "Document", icon: Paperclip },
  { key: "note", label: "Note", icon: NotebookPen },
];

const typeIcon = { website: Globe, document: FileText, note: NotebookPen };

export default function SourceComposer({ sources, setSources, disabled = false }) {
  const [tab, setTab] = useState("website");
  const [url, setUrl] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const push = (draft) => setSources((prev) => [...prev, { ...draft, key: crypto.randomUUID() }]);

  const addWebsite = () => {
    if (!url.trim()) return;
    try {
      const parsed = new URL(url.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
      push({ source_type: "website", title: parsed.hostname.replace(/^www\./, ""), url: parsed.href });
      setUrl("");
    } catch {
      toast.error("Enter a full URL, including https://");
    }
  };

  const addNote = () => {
    if (!noteBody.trim()) {
      toast.error("Write the note content first.");
      return;
    }
    push({
      source_type: "note",
      title: noteTitle.trim() || "Research note",
      content: noteBody.trim().slice(0, 18000),
      note: "",
    });
    setNoteTitle("");
    setNoteBody("");
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const isText = /\.(txt|md|markdown|csv|json)$/i.test(file.name);
      const isPdf = /\.pdf$/i.test(file.name);
      try {
        if (isText) {
          const text = (await file.text()).slice(0, 18000);
          if (text.trim().length < 20) {
            toast.error(`${file.name} is too short to analyse.`);
            continue;
          }
          push({ source_type: "document", title: file.name, content: text, file_name: file.name });
        } else if (isPdf) {
          const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
          push({ source_type: "document", title: file.name, file_url, file_name: file.name });
        } else {
          toast.error(`${file.name} is not supported. Use PDF, TXT, MD, CSV or JSON.`);
        }
      } catch (error) {
        toast.error(error?.message || `Could not add ${file.name}.`);
      }
    }
    setUploading(false);
  };

  const remove = (key) => setSources((prev) => prev.filter((item) => item.key !== key));

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            disabled={disabled}
            onClick={() => setTab(item.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs transition-colors ${
              tab === item.key
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === "website" && (
        <div className="space-y-2">
          <Label htmlFor="source-url" className="text-xs text-muted-foreground">
            Source URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="source-url"
              value={url}
              disabled={disabled}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addWebsite();
                }
              }}
              placeholder="https://example.com/report"
              className="border-white/10 bg-white/[0.03]"
            />
            <button
              type="button"
              onClick={addWebsite}
              disabled={disabled}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-foreground transition-colors hover:bg-white/[0.08] disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            DARKSPOT fetches the page text and records its provenance. Paywalled or JavaScript-only
            pages may return little content.
          </p>
        </div>
      )}

      {tab === "document" && (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md,.markdown,.csv,.json"
            onChange={handleFiles}
            className="hidden"
          />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center transition-colors hover:border-primary/30 hover:bg-primary/[0.04] disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Upload className="h-5 w-5 text-primary/80" />
            )}
            <span className="text-xs text-foreground">
              {uploading ? "Uploading…" : "Choose PDF or text files"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              PDF, TXT, MD, CSV, JSON — up to 8 per investigation
            </span>
          </button>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Files are stored publicly — anyone with the link can open them.
          </p>
        </div>
      )}

      {tab === "note" && (
        <div className="space-y-2">
          <Input
            value={noteTitle}
            disabled={disabled}
            onChange={(event) => setNoteTitle(event.target.value)}
            placeholder="Note title (optional)"
            className="border-white/10 bg-white/[0.03]"
          />
          <Textarea
            value={noteBody}
            disabled={disabled}
            onChange={(event) => setNoteBody(event.target.value)}
            placeholder="Paste interview notes, a passage, or an excerpt to analyse…"
            className="min-h-[120px] border-white/10 bg-white/[0.03] text-sm"
          />
          <button
            type="button"
            onClick={addNote}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-foreground transition-colors hover:bg-white/[0.08]"
          >
            <Plus className="h-3.5 w-3.5" /> Add note
          </button>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Evidence queue</p>
          <span className="font-mono text-[11px] text-muted-foreground">{sources.length} / 8</span>
        </div>
        {sources.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-[11px] leading-relaxed text-muted-foreground">
            No sources yet. Add at least one to run an analysis.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {sources.map((source) => {
              const Icon = typeIcon[source.source_type] || FileText;
              return (
                <li
                  key={source.key}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary/80" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-foreground">{source.title}</p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {source.source_type === "website"
                        ? source.url
                        : `${source.source_type}${source.file_name ? ` · ${source.file_name}` : ""}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(source.key)}
                    disabled={disabled}
                    className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove ${source.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}