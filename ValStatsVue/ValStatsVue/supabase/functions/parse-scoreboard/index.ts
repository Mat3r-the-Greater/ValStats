// supabase/functions/parse-scoreboard/index.ts
//
// Supabase Edge Function — runs on Deno, server-side only.
// The Anthropic API key never leaves the server.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',   // tighten to your domain in production
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { imageData, mediaType } = await req.json()

        if (!imageData || !mediaType) {
            return new Response(
                JSON.stringify({ error: 'imageData and mediaType are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Call Anthropic API using Haiku — fast, cheap, accurate for structured images
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: mediaType,
                                    data: imageData,
                                },
                            },
                            {
                                type: 'text',
                                text: `Parse this Valorant match scoreboard screenshot and return ONLY a JSON object with NO markdown, NO explanation, NO code fences.

The winning team rows are colored green/teal (and one yellow for the top player). The losing team rows are red/crimson.
The score is shown at the top: the teal/cyan number = our team's rounds won, the red number = opponent's rounds won. "VICTORY" or "DEFEAT" is shown in white text.

Strip any clan tags from player names (e.g. "Hill | solus" → "solus", "Hill|Tri" → "Tri").

Return this exact JSON structure:
{
  "result": "Victory",
  "ourScore": 13,
  "theirScore": 7,
  "map": "Pearl",
  "ourTeam": [
    { "name": "Frebby5Bear", "acs": 416, "kills": 32, "deaths": 10, "assists": 10, "econRating": 113, "firstBloods": 2, "plants": 0, "defuses": 0 }
  ],
  "theirTeam": [
    { "name": "solus", "acs": 345, "kills": 25, "deaths": 17, "assists": 4, "econRating": 81, "firstBloods": 2, "plants": 1, "defuses": 1 }
  ]
}

Rules:
- result must be exactly "Victory" or "Defeat"
- ourTeam = teal/green/yellow rows (winning team)
- theirTeam = red/crimson rows (losing team)
- All numeric fields must be integers
- map field can be empty string if not visible`,
                            },
                        ],
                    },
                ],
            }),
        })

        if (!anthropicResponse.ok) {
            const errBody = await anthropicResponse.json()
            throw new Error(errBody.error?.message ?? `Anthropic API error ${anthropicResponse.status}`)
        }

        const anthropicData = await anthropicResponse.json()
        const rawText = anthropicData.content?.[0]?.text ?? ''

        // Strip any accidental markdown fences before parsing
        const cleaned = rawText.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)

        return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (err) {
        console.error('parse-scoreboard error:', err)
        return new Response(
            JSON.stringify({ error: err.message ?? 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})