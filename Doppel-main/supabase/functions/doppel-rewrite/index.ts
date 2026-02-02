import { corsHeaders } from '../_shared/cors.ts'

interface PersonalitySettings {
  formalCasual: number // 0-100
  shortDetailed: number
  politeDir: number
  emotionalLogical: number
}

interface RewriteRequest {
  input: string
  type: 'email' | 'text' | 'dm' | 'reply'
  personality: PersonalitySettings
  trainingSamples?: string[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { input, type, personality, trainingSamples = [] }: RewriteRequest = await req.json()

    if (!input?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Input text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build personality-aware system prompt
    const systemPrompt = buildSystemPrompt(personality, trainingSamples, type)

    // Call OnSpace AI
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY')
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL')

    if (!apiKey || !baseUrl) {
      throw new Error('OnSpace AI not configured')
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OnSpace AI error:', errorText)
      throw new Error(`OnSpace AI: ${errorText}`)
    }

    const data = await response.json()
    const rewrittenText = data.choices?.[0]?.message?.content ?? ''

    // Calculate confidence score
    const confidence = calculateConfidence(personality, trainingSamples.length)

    return new Response(
      JSON.stringify({
        rewrittenText,
        confidence,
        personality: describePersonality(personality)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Rewrite error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to rewrite text' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function buildSystemPrompt(
  personality: PersonalitySettings, 
  trainingSamples: string[],
  type: string
): string {
  // Map 0-100 sliders to descriptive terms
  const formalityLevel = personality.formalCasual > 70 ? 'very casual' :
                         personality.formalCasual > 50 ? 'casual' :
                         personality.formalCasual > 30 ? 'balanced' :
                         'formal'

  const verbosityLevel = personality.shortDetailed > 70 ? 'detailed and thorough' :
                        personality.shortDetailed > 50 ? 'moderately detailed' :
                        personality.shortDetailed > 30 ? 'concise' :
                        'very brief and to-the-point'

  const directnessLevel = personality.politeDir > 70 ? 'direct and straightforward' :
                         personality.politeDir > 50 ? 'balanced directness' :
                         personality.politeDir > 30 ? 'diplomatic' :
                         'very polite and diplomatic'

  const emotionLevel = personality.emotionalLogical > 70 ? 'logical and analytical' :
                      personality.emotionalLogical > 50 ? 'balanced tone' :
                      personality.emotionalLogical > 30 ? 'empathetic' :
                      'warm and emotional'

  const typeGuidance = {
    email: 'This is an email. Include appropriate greeting and closing.',
    text: 'This is a text message. Keep it conversational and natural.',
    dm: 'This is a direct message. Be casual and friendly.',
    reply: 'This is a reply. Be contextual and responsive.'
  }[type] || 'This is a message.'

  let prompt = `You are a Digital Doppelgänger — an AI that rewrites rough thoughts into polished responses exactly in the user's voice.

CRITICAL RULES:
- Write as the user, not about the user
- Never explain your thinking
- Never sound like an AI
- Never add extra information unless implied
- Keep the same meaning — never change intent
- Be natural, human, and confident
- No filler, no robotic phrasing
- Never mention being an AI or say "As an AI"
- Never over-polish or sound corporate

PERSONALITY SETTINGS:
- Formality: ${formalityLevel}
- Length: ${verbosityLevel}
- Directness: ${directnessLevel}
- Emotional tone: ${emotionLevel}

MESSAGE TYPE:
${typeGuidance}

`

  if (trainingSamples.length > 0) {
    prompt += `\nWRITING STYLE EXAMPLES:\nThe user has provided these writing samples. Study their tone, vocabulary, and phrasing:\n\n`
    trainingSamples.slice(0, 3).forEach((sample, i) => {
      prompt += `Example ${i + 1}:\n${sample.slice(0, 500)}\n\n`
    })
  }

  prompt += `\nTASK:
Take the user's rough input and rewrite it as they would naturally say it.
Output ONLY the rewritten message — nothing else.`

  return prompt
}

function calculateConfidence(personality: PersonalitySettings, sampleCount: number): number {
  // Base confidence from training samples
  let confidence = 70 + Math.min(sampleCount * 5, 20)

  // Adjust based on personality clarity (extreme values = more confident)
  const personalityClarity = [
    Math.abs(personality.formalCasual - 50),
    Math.abs(personality.shortDetailed - 50),
    Math.abs(personality.politeDir - 50),
    Math.abs(personality.emotionalLogical - 50)
  ].reduce((sum, val) => sum + val, 0) / 4

  confidence += personalityClarity / 5

  return Math.min(Math.round(confidence), 95)
}

function describePersonality(personality: PersonalitySettings): string {
  const traits = []
  
  if (personality.formalCasual > 50) traits.push('casual')
  else if (personality.formalCasual < 50) traits.push('formal')
  
  if (personality.shortDetailed > 50) traits.push('detailed')
  else if (personality.shortDetailed < 50) traits.push('concise')
  
  if (personality.politeDir > 50) traits.push('direct')
  else if (personality.politeDir < 50) traits.push('polite')
  
  if (personality.emotionalLogical > 50) traits.push('logical')
  else if (personality.emotionalLogical < 50) traits.push('empathetic')

  return traits.join(', ') || 'balanced'
}
