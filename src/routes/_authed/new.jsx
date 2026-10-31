import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { addSources, analyzeSource, collectSource, synthesize } from "@/lib/analysis-api";
import { createInvestigation, updateInvestigation } from "@/lib/investigations-api";
import { Panel } from "@/components/common/Panels";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SourceComposer from "@/components/new/SourceComposer";
import RunStages from "@/components/new/RunStages";

export const Route = createFileRoute("/_authed/new")({
  head: () => ({ meta: [{ title: "New investigation — DARKSPOT" }] }),
  component: NewInvestigationPage,
});

const ANALYSIS_OPTIONS = [
  { key: "gaps", label: "Information gaps" },
  { key: "contradictions", label: "Contradictions" },
  { key: "outdated", label: "Outdated facts" },
  { key: "evidence", label: "Unsupported claims" },
];

function NewInvestigationPage() {
  const navigate = useNavigate();
  const create = useServerFn(createInvestigation);
  const updateInv = useServerFn(updateInvestigation);
  const add = useServerFn(addSources);
  const collect = useServerFn(collectSource);
  const analyze = useServerFn(analyzeSource);
  const runSynthesis = useServerFn(synthesize);

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [analyses, setAnalyses] = useState(ANALYSIS_OPTIONS.map((item) => item.key));
  const [sources, setSources] = useState([]);

  const [running, setRunning] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [percent, setPercent] = useState(0);
  const [sourceStates, setSourceStates] = useState({});
  const [createdSources, setCreatedSources] = useState([]);
  const [error, setError] = useState("");
  const investigationIdRef = useRef(null);

  const toggleAnalysis = (key) =>
    setAnalyses((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));

  const begin = async () => {
    if (!title.trim()) {
      toast.error("Give the investigation a title.");
      return;
    }
    if (question.trim().length < 12) {
      toast.error("Write the research question you need answered.");
      return;
    }
    if (!sources.length) {
      toast.error("Add at least one source to analyse.");
      return;
    }

    setError("");
    setRunning(true);
    setStageIndex(0);
    setPercent(4);
    setSourceStates({});
    setCreatedSources([]);

    try {
      const investigation = await create({
        data: {
          title: title.trim(),
          research_question: question.trim(),
          description: description.trim(),
          analyses,
        },
      });
      investigationIdRef.current = investigation.id;
      setPercent(8);
      setStageIndex(1);

      const added = await add({
        data: {
          investigationId: investigation.id,
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
      setCreatedSources(list);
      if (!list.length) throw new Error("The sources could not be registered. Try again.");

      let analyzedCount = 0;
      const failures = [];

      for (let index = 0; index < list.length; index += 1) {
        const source = list[index];
        setSourceStates((prev) => ({ ...prev, [source.id]: "collecting" }));
        const collected = await collect({ data: { id: source.id } });
        if (!collected.ok) {
          failures.push(`${source.title}: ${collected.error}`);
          setSourceStates((prev) => ({ ...prev, [source.id]: "failed" }));
          setPercent(10 + Math.round(((index + 1) / list.length) * 22));
          continue;
        }

        setStageIndex(2);
        setSourceStates((prev) => ({ ...prev, [source.id]: "analyzing" }));
        const result = await analyze({ data: { id: source.id } });
        if (result.ok) {
          analyzedCount += 1;
          setSourceStates((prev) => ({ ...prev, [source.id]: "analyzed" }));
        } else {
          failures.push(`${source.title}: ${result.error}`);
          setSourceStates((prev) => ({ ...prev, [source.id]: "failed" }));
        }
        setPercent(32 + Math.round(((index + 1) / list.length) * 38));
      }

      if (!analyzedCount) {
        throw new Error(failures[0] || "No source could be analysed. Check the URLs and files.");
      }

      setStageIndex(3);
      setPercent(78);
      await runSynthesis({ data: { id: investigation.id } });
      setStageIndex(4);
      setPercent(100);

      if (failures.length) {
        toast.warning(`${failures.length} source(s) could not be analysed and were skipped.`);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate({ to: "/investigations/$investigationId", params: { investigationId: investigation.id } });
    } catch (pipelineError) {
      const message = pipelineError?.message || "The analysis could not be completed.";
      setError(message);
      setRunning(false);
      if (investigationIdRef.current) {
        await updateInv({
          data: {
            id: investigationIdRef.current,
            status: "failed",
            stage: "failed",
            error_message: message.slice(0, 500),
          },
        }).catch(() => {});
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">New investigation</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
          Build a dossier your conclusions can stand on.
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          State the question, add the sources you already trust, and DARKSPOT will extract their
          claims before mapping what the evidence base leaves open.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3.5">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="text-xs leading-relaxed text-foreground/90">
            <p className="font-medium">Analysis stopped</p>
            <p className="mt-1 text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {running ? (
        <Panel className="mx-auto max-w-2xl py-8">
          <RunStages
            stageIndex={stageIndex}
            percent={percent}
            sources={createdSources}
            sourceStates={sourceStates}
          />
        </Panel>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <Panel className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs text-muted-foreground">
                Investigation title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Southeast Asia EV battery supply risk"
                className="border-white/10 bg-white/[0.03]"
                maxLength={160}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question" className="text-xs text-muted-foreground">
                Research question
              </Label>
              <Textarea
                id="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="What exactly do the sources need to establish? Be specific — the analysis is measured against this."
                className="min-h-[96px] border-white/10 bg-white/[0.03] text-sm"
                maxLength={1200}
              />
              <p className="text-[11px] text-muted-foreground">{question.length} / 1200</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope" className="text-xs text-muted-foreground">
                Scope & constraints <span className="text-muted-foreground/60">(optional)</span>
              </Label>
              <Textarea
                id="scope"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Timeframe, geography, assumptions, or what you deliberately exclude."
                className="min-h-[72px] border-white/10 bg-white/[0.03] text-sm"
                maxLength={2000}
              />
            </div>

            <div className="space-y-2.5">
              <p className="text-xs text-muted-foreground">Analysis to run</p>
              <div className="flex flex-wrap gap-2">
                {ANALYSIS_OPTIONS.map((option) => {
                  const active = analyses.includes(option.key);
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleAnalysis(option.key)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                        active
                          ? "border-primary/35 bg-primary/12 text-foreground"
                          : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Each source is analysed separately, then compared.
              </p>
              <button
                type="button"
                onClick={begin}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_16px_50px_-20px_hsl(250_100%_70%)] transition-transform hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4" />
                Run analysis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </Panel>

          <Panel>
            <div className="mb-4">
              <h2 className="font-heading text-sm font-medium tracking-tight">Evidence to analyse</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Websites, PDFs, text files, or your own notes.
              </p>
            </div>
            <SourceComposer sources={sources} setSources={setSources} disabled={running} />
          </Panel>
        </div>
      )}

      {running && (
        <p className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Keep this page open — the dossier opens automatically when the analysis finishes.
        </p>
      )}
    </div>
  );
}