import { z } from 'zod';
import { Priority, Category } from '@prisma/client';

export const aiAnalysisSchema = z.object({
  category: z.enum(Category, {
    error: () => ({ message: "Invalid category assigned by AI" }),
  }),
  priority: z.enum(Priority, {
    error: () => ({ message: "Invalid priority assigned by AI" }),
  }),
  reasoning: z.string().min(1, "AI must provide a brief reasoning for triage"),
});

export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;