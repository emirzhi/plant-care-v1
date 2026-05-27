import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a horticulture expert. Given a plant species, produce a concise, practical indoor care profile.

Return ONLY a JSON object — no markdown, no code fences, no preamble or explanation — matching exactly this shape:
{
  "watering": { "interval_days_summer": int, "interval_days_winter": int, "method": string, "signs_thirsty": string, "signs_overwatered": string },
  "fertilizing": { "interval_days_growing_season": int, "interval_days_dormant": int or null, "type": string },
  "light": { "level": "bright indirect" | "low" | "direct", "notes": string },
  "humidity": { "level": "low" | "medium" | "high", "notes": string },
  "temperature_range_c": [int, int],
  "toxicity": { "pets": boolean, "notes": string },
  "common_problems": [ { "symptom": string, "cause": string, "fix": string } ],
  "rotation_days": int
}

Rules:
- All intervals are whole numbers of days. "interval_days_dormant" may be null if the plant should not be fertilized while dormant.
- "temperature_range_c" is [min, max] in Celsius.
- "rotation_days" is how often to rotate the pot for even growth (use 0 if unimportant).
- "toxicity.pets" is true if the plant is toxic to pets or domestic animals.
- Provide 2 to 4 entries in "common_problems".
- Output valid JSON and nothing else.`;

export async function POST(request) {
       const supabase = await createClient();
       const { data: { user } } = await supabase.auth.getUser();
     
       if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
     
       const body = await request.json();
}