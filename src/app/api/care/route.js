import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a horticulture expert. Given a plant species, produce a concise, practical care profile.

RETURN ONLY A JSON OBJECT — NO MARKDOWN, NO CODE FENCES, NO PREAMBLE OR EXPLANATION — MATCHING EXACTLY THIS SHAPE:
{
  "watering": { "interval_days_summer": int, "interval_days_winter": int, "method": string, "signs_thirsty": string, "signs_overwatered": string },
  "fertilizing": { "interval_days_growing_season": int, "interval_days_dormant": int or null, "type": string },
  "mist": { "interval_days": int or null, "method": string or null, "notes": string },
  "light": { "level": "bright indirect" | "low" | "direct", "notes": string },
  "humidity": { "level": "low" | "medium" | "high", "notes": string },
  "temperature_range_c": [int, int],
  "toxicity": { "pets": boolean, "notes": string },
  "common_problems": [ { "symptom": string, "cause": string, "fix": string } ],
  "rotation_days": int
}

Rules:
- All intervals are whole numbers of days. "interval_days_dormant" may be null if the plant should not be fertilized while dormant.
- mist is optional; if the plant doesn't benefit from misting, set "interval_days" to null.
- "temperature_range_c" is [min, max] in Celsius.
- "rotation_days" is how often to rotate the pot for even growth (use 0 if unimportant).
- "toxicity.pets" is true if the plant is toxic to pets or domestic animals.
- Provide 2 to 4 entries in "common_problems".
- Output valid JSON and nothing else.`;

export async function POST(request) {
  const supabase = await createClient();
  const admin = await getSupabaseAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await request.json();

  if (!body.plantName) return NextResponse.json({ error: "Missing plant name." }, { status: 400 });

  const { plantName, species } = body;

  // Check if we already have a care profile for this species in the database before calling the API
  const { data: existing, error: existingError } = await admin
    .from("care_profiles")
    .select("species_scientific, species_common, profile_json")
    .ilike("species_scientific", species)
    .maybeSingle();

  if (existing?.profile_json) return NextResponse.json(existing.profile_json);

  const mainSchema = z.object({
    watering: z.object({
      interval_days_summer: z.number().int(),
      interval_days_winter: z.number().int().nullable(),
      method: z.string(),
      signs_thirsty: z.string(),
      signs_overwatered: z.string(),
    }),
    fertilizing: z.object({
      interval_days_growing_season: z.number().int(),
      interval_days_dormant: z.number().int().nullable(),
      type: z.string(),
    }),
    mist: z.object({
      interval_days: z.number().int().nullable(),
      method: z.string().nullable(),
      notes: z.string(),
    }),
    light: z.object({
      level: z.string(),
      notes: z.string(),
    }),
    humidity: z.object({
      level: z.string(),
      notes: z.string(),
    }),
    temperature_range_c: z.tuple([z.number().int(), z.number().int()]),
    toxicity: z.object({
      pets: z.boolean(),
      notes: z.string(),
    }),
    common_problems: z.array(z.object({
      symptom: z.string(),
      cause: z.string(),
      fix: z.string(),
    })),
    rotation_days: z.number().int(),
  });

  try {
    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_AI_MODEL,
      max_tokens: 2048,
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
              type: "text",
              text: `Plant name: ${plantName}\nSpecies: ${species} \n\nProvide a care profile for this plant in the specified JSON format.`,
            }
          ]
        }
      ]
    })

    const raw = response.content.find((part) => part.type === "text")?.text;

    const result = mainSchema.safeParse(JSON.parse(raw));

    if (!result.success) return NextResponse.json({ error: "Model returned invalid response.", details: result.error.errors }, { status: 502 });

    // Save the generated care profile to the database for future use
    const { data: careData, error: careError } = await admin
      .from("care_profiles")
      .upsert({
        species_scientific: species,
        species_common: plantName || null,
        profile_json: result.data,
        source: "ai",
      })

    return NextResponse.json(result.data);
  } catch (error) {
    if (error instanceof Anthropic.APIError) return NextResponse.json({ error: `Anthropic API error: ${error.message}` }, { status: 502 });
    if (error instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "Anthropic API rate limit exceeded." }, { status: 503 });
    if (error instanceof Anthropic.BadRequestError) return NextResponse.json({ error: `Anthropic API bad request: ${error.message}` }, { status: 400 });
    if (error instanceof Anthropic.InternalServerError) return NextResponse.json({ error: "Anthropic API internal server error." }, { status: 502 });

    return NextResponse.json({ error: "Failed to create care routine for plant." }, { status: 500 });
  }
}