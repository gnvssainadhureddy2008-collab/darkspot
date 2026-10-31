import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addSources, analyzeSource, collectSource, synthesize } from "@/lib/analysis-api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SourceComposer from "@/components/new/SourceComposer";

export default function AddSourcesDialog({ open, onOpenChange, investigationId }) {
  const router = useRouter();
  const add = useServerFn(addSources);
  const collect = useServerFn(collectSource);
  const analyze = useServerFn(analyzeSource);
  const runSynthesis = useServerFn(synthesize);

  const [sources, setSources] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const submit = async () => {
    if (!sources.length) return;
    setBusy(true);
    setStatus("Registering sources…");
    try {
      const added = await add({
        data: {
          investigationId,
          sources: sources.map((source) => ({
            title: source.title,
            source_type: source.source_type,
            url: source.url || "",
            file_url: source.file_url || "",
            file_name: source.file_name || "",
            content: source.content || "",
            note: source.note || "",
          })),
        },
      });

      const list = added.sources || [];
      let analyzed = 0;
      for (let index = 0; index < list.length; index += 1) {
        setStatus(`Analysing source ${index + 1} of ${list.length}…`);
        const collected = await collect({ data: { id: list[index].id } });
        if (!collected.ok) continue;
        const result = await analyze({ data: { id: list[index].id } });
        if (result.ok) analyzed += 1;
      }

      if (!analyzed) throw new Error("None of the new sources could be analysed.");

      setStatus("Updating the dossier…");
      await runSynthesis({ data: { id: investigationId } });
      await router.invalidate();
      toast.success("Evidence added and the dossier was re-analysed.");
      setSources([]);
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.message || "The sources could not be added.");
    } finally {
      setBusy(false);
      setStatus("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!busy ? onOpenChange(next) : null)}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-white/10 bg-[hsl(230_42%_7%)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">Add evidence</DialogTitle>
          <DialogDescription className="text-xs">
            New sources are analysed individually, then the whole dossier is re-synthesised.
          </DialogDescription>
        </DialogHeader>

        <SourceComposer sources={sources} setSources={setSources} disabled={busy} />

        <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
          <p className="text-[11px] text-muted-foreground">
            {busy ? status : `${sources.length} source${sources.length === 1 ? "" : "s"} queued`}
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !sources.length}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy ? "Analysing" : "Add & analyse"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}