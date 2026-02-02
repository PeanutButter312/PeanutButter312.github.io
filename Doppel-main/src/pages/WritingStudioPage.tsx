import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/stores/authStore'
import { useActivityStore } from '@/stores/activityStore'
import { Sparkles, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import { FunctionsHttpError } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const WRITING_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text Message' },
  { value: 'dm', label: 'Direct Message' },
  { value: 'reply', label: 'Reply' }
]

export default function WritingStudioPage() {
  const { personality, userName } = useAuthStore()
  const { addActivity } = useActivityStore()
  
  const [type, setType] = useState('text')
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [personalityDesc, setPersonalityDesc] = useState('')

  const generateDraft = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want to write')
      return
    }

    setIsGenerating(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('doppel-rewrite', {
        body: {
          input: prompt,
          type,
          personality: {
            formalCasual: personality.formalCasual,
            shortDetailed: personality.shortDetailed,
            politeDir: personality.politeDir,
            emotionalLogical: personality.emotionalLogical
          },
          trainingSamples: personality.trainingSamples
        }
      })

      if (error) {
        let errorMessage = error.message
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500
            const textContent = await error.context?.text()
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`
          } catch {
            errorMessage = `${error.message || 'Failed to read response'}`
          }
        }
        throw new Error(errorMessage)
      }

      const { rewrittenText, confidence: aiConfidence, personality: personalityTraits } = data

      setDraft(rewrittenText)
      setConfidence(aiConfidence)
      setPersonalityDesc(personalityTraits)
      
      addActivity({
        type: 'draft',
        title: `Generated ${WRITING_TYPES.find(t => t.value === type)?.label}`,
        description: prompt,
        confidence: aiConfidence,
        status: 'completed'
      })
      
      toast.success(`Draft generated with ${aiConfidence}% confidence`)
    } catch (error: any) {
      console.error('Generation error:', error)
      toast.error(error.message || 'Failed to generate draft')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyDraft = () => {
    navigator.clipboard.writeText(draft)
    toast.success('Copied to clipboard')
  }

  const handleFeedback = (positive: boolean) => {
    toast.success(positive ? 'Thanks! Your Doppel is learning.' : 'Got it. Your Doppel will adjust.')
    
    // In real app, this would update the AI model
    console.log('Feedback:', positive ? 'positive' : 'negative', { draft, prompt })
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Writing Studio</h1>
          <p className="text-xl text-muted-foreground">
            Let your Doppel draft messages that sound like you
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">What do you want to write?</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type" className="mb-2 block">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WRITING_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prompt" className="mb-2 block">
                    Describe what you want to say
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Example: Tell Sarah I can't make the meeting tomorrow and suggest next Tuesday instead"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                </div>

                <Button 
                  onClick={generateDraft}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full gradient-primary"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Confidence Meter */}
            {confidence > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Confidence Score</h3>
                  <span className="text-2xl font-bold text-primary">{confidence}%</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {confidence >= 90 ? 'This sounds very much like you!' :
                   confidence >= 75 ? 'This sounds like you with minor adjustments.' :
                   'This might need some editing to match your style.'}
                </p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-primary transition-all duration-500"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Draft</h2>
                {draft && (
                  <Button variant="ghost" size="sm" onClick={copyDraft}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>

              {draft ? (
                <div className="space-y-4">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="min-h-[250px] font-mono text-base"
                    placeholder="Your draft will appear here..."
                  />

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleFeedback(true)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Sounds like me
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleFeedback(false)}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Not quite
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[250px] flex items-center justify-center text-center">
                  <div className="max-w-sm">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Describe what you want to write, and your Doppel will draft it for you
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {draft && (
              <Card className="p-6 border-primary/50 bg-primary/5">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Why this draft?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your Doppel wrote this as: <strong>{personalityDesc || 'balanced'}</strong>.
                  {personality.trainingSamples.length > 0 && ` Enhanced by ${personality.trainingSamples.length} training sample${personality.trainingSamples.length > 1 ? 's' : ''}.`}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
