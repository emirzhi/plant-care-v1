import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a botanist specializing in plant identification. You are shown a single photo of a plant and must identify the most likely species.

Return ONLY a JSON object — no markdown, no code fences, no preamble or explanation — matching exactly this shape:
{
  "primary": { "common_name": string, "scientific_name": string, "confidence": number, "type": "houseplant" | "succulent" | "cacti" | "flowering" | "tree" | "shrub" | "herb" | "edible" | "fern" | "palm" | "other" },
  "alternatives": [ { "common_name": string, "scientific_name": string, "confidence": number, "type": "houseplant" | "succulent" | "cacti" | "flowering" | "tree" | "shrub" | "herb" | "edible" | "fern" | "palm" | "other" } ],
  "visible_health_issues": [ string ],
  "note": string (optional)
}

Rules:
- "confidence" is a decimal between 0 and 1.
- "primary" is your single best guess. "alternatives" holds up to 2 other plausible species, most likely first.
- "type" is the broadest applicable category from the listed enum. Use "houseplant" for foliage plants typically grown indoors; "succulent" for non-cactus succulents (e.g. Aloe, Jade, Echeveria); "cacti" for cacti; "flowering" when blooms are the main feature; "tree" or "shrub" for woody outdoor specimens; "herb" for culinary/medicinal herbs (basil, mint, lavender); "edible" for fruit/vegetable crops; "fern" for ferns; "palm" for palms; "other" only when none fit.
- "visible_health_issues" lists visible problems (e.g. "yellowing lower leaves", "brown leaf tips", "signs of pests"). Use an empty array if none are visible.
- If the image contains no identifiable plant, set primary.confidence to 0, use primary.common_name "Unknown" with scientific_name "" and type "other", leave alternatives empty, and explain in "note".
- Prefer widely-kept houseplant species.
- Output valid JSON and nothing else.`;

export async function POST(request) {
  const guessSchema = z.object({
    common_name: z.string(),
    scientific_name: z.string(),
    confidence: z.number().min(0).max(1),
    type: z.enum(["houseplant", "succulent", "cacti", "flowering", "tree", "shrub", "herb", "edible", "fern", "palm", "other"]),
  });

  const mainSchema = z.object({
    primary: guessSchema,
    alternatives: z.array(guessSchema).default([]),
    visible_health_issues: z.array(z.string()).default([]),
    note: z.string().optional(),
  })

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await request.json();
  if (!body.img) return NextResponse.json({ error: "Missing image file." }, { status: 400 });

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_AI_MODEL,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        }
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: body.img },
            },
            {
              type: "text",
              text: "Identify this plant. Return ONLY the JSON object.",
            },
          ],
        },
      ]
    })
    
    const raw = response.content.find((part) => part.type === "text")?.text || "";

    const result = mainSchema.safeParse(JSON.parse(raw));

    if (!result.success) return NextResponse.json({ error: "Model returned invalid response.", details: result.error.errors }, { status: 502 });

    return NextResponse.json(result.data);

  } catch (error) {
    if (error instanceof Anthropic.APIError) return NextResponse.json({ error: `Anthropic API error: ${error.message}` }, { status: 502 });
    if (error instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "Anthropic API rate limit exceeded." }, { status: 503 });
    if (error instanceof Anthropic.BadRequestError) return NextResponse.json({ error: `Anthropic API bad request: ${error.message}` }, { status: 400 });
    if (error instanceof Anthropic.InternalServerError) return NextResponse.json({ error: "Anthropic API internal server error." }, { status: 502 });

    return NextResponse.json({ error: "Failed to identify plant." }, { status: 500 });
  }
}