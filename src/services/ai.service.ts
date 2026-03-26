import OpenAI from 'openai';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { aiAnalysisSchema, AIAnalysis } from '../validators/ai.schema';

const openai = new OpenAI({
  apiKey: env.AI_API_KEY,
});

export class AIService {
  public static async analyzeTicket(
    title: string,
    description: string,
  ): Promise<AIAnalysis> {
    try {
      const systemPrompt = `
You are an expert customer support triage agent for NexusDesk.
Your task is to analyze the ticket and return a JSON object.

ALLOWED CATEGORIES: TECHNICAL, BILLING, ACCOUNT, GENERAL
ALLOWED PRIORITIES: LOW, MEDIUM, HIGH, CRITICAL

Rules:
- Critical: Use for server outages, total data loss, or security breaches.
- High: Use for broken features with no workaround.
- Medium: Use for general bugs or billing issues.
- Low: Use for questions or feedback.

Output must be strictly JSON in this format:
{
  "category": "TECHNICAL",
  "priority": "HIGH",
  "reasoning": "Brief explanation of why this priority was chosen"
}
      `;

      const userPrompt = `Ticket Title: ${title}\nTicket Description: ${description}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new AppError('AI failed to generate a response', 502);
      }

      const rawJson = JSON.parse(content);

      const validatedData = aiAnalysisSchema.safeParse(rawJson);

      if (!validatedData.success) {
        console.error(
          'AI Hallucination detected:',
          validatedData.error.format(),
        );
        throw new AppError('AI returned invalid ticket metadata', 502);
      }

      return validatedData.data;
    } catch (error) {
      if (error instanceof AppError) throw error;

      console.error('LLM Service Error:', error);
      throw new AppError('Error processing ticket with AI', 500);
    }
  }
}
