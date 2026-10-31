import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { loadBundle } from "@/lib/bundle.server";
import { asArray } from "@/lib/shape";
import { answerQuestion } from "@/lib/analysis.server";

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      investigationId: z.string(),
      question: z.string().trim().min(3).max(1000),
    }),
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const bundle = await loadBundle(base44, data.investigationId);
    const history = asArray(
      await base44.entities.AssistantMessage.filter(
        { investigation_id: data.investigationId },
        { sort: "created_date", limit: 30 },
      ),
    );

    await base44.entities.AssistantMessage.create({
      investigation_id: data.investigationId,
      role: "user",
      content: data.question,
    });

    const answer = await answerQuestion(base44, { ...bundle, history, question: data.question });

    const message = await base44.entities.AssistantMessage.create({
      investigation_id: data.investigationId,
      role: "assistant",
      content: answer,
    });

    return { answer, message };
  });

export const clearAssistant = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ investigationId: z.string() }))
  .handler(async ({ data, context }) => {
    await context.getBase44().entities.AssistantMessage.deleteMany({
      investigation_id: data.investigationId,
    });
    return { ok: true };
  });