import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useAuthStore } from '@/stores/authStore'
import { Crown, MessageSquare, Sparkles, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default function ConversationReplyPage() {
  const { isPremium } = useSubscriptionStore()
  const { personality } = useAuthStore()

  const [conversation, setConversation] = useState('')
  const [generatedReply, setGeneratedReply] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerateReply = async () => {
    if (!conversation.trim()) {
      toast.error('Please paste a conversation first')
      return
    }

    if (!isPremium()) {
      toast.error('This feature is only available for Premium users')
      return
    }

    setIsGenerating(true)
    try {
      // Initialize Gemini AI (you'll need to add your API key to .env)
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

      // Build personality-aware prompt
      const toneLevel = personality.formalCasual
      const tone = toneLevel > 70 ? 'very casual and friendly' :
                   toneLevel > 40 ? 'balanced and conversational' :
                   'formal and professional'

      const lengthLevel = personality.shortDetailed
      const length = lengthLevel > 70 ? 'detailed and comprehensive' :
                     lengthLevel > 40 ? 'moderate length' :
                     'short and concise'

      const prompt = `You are helping someone reply to a conversation. Based on the conversation below, generate an appropriate reply that matches this personality:

Tone: ${tone}
Length preference: ${length}
Directness: ${personality.politeDir > 50 ? 'direct and straightforward' : 'polite and diplomatic'}

Conversation:
${conversation}

Generate only the reply text, nothing else. Match the writing style and tone that would naturally fit this conversation.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      setGeneratedReply(text)
      toast.success('Reply generated successfully!')
    } catch (error) {
      console.error('Error generating reply:', error)
      toast.error('Failed to generate reply. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyReply = () => {
    navigator.clipboard.writeText(generatedReply)
    setCopied(true)
    toast.success('Reply copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isPremium()) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <Crown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
            <p className="text-muted-foreground mb-6">
              The Conversation Reply feature is only available for Premium subscribers
            </p>
            <Button onClick={() => window.location.href = '/settings'}>
              Upgrade to Premium
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-bold">Conversation Reply</h1>
              <Badge className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground">
              Paste any conversation and get AI-generated replies in your style
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold">Conversation</Label>
            </div>
            <Textarea
              placeholder="Paste the conversation here...&#10;&#10;Example:&#10;Person A: Hey, how's the project going?&#10;Person B: It's going well, almost done!&#10;Person A: Great! When can you send it over?"
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              className="min-h-[400px] mb-4"
            />
            <Button
              onClick={handleGenerateReply}
              disabled={isGenerating || !conversation.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Generating Reply...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Reply
                </>
              )}
            </Button>
          </Card>

          {/* Output Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <Label className="text-lg font-semibold">Generated Reply</Label>
              </div>
              {generatedReply && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyReply}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="min-h-[400px] p-4 bg-muted rounded-lg mb-4">
              {generatedReply ? (
                <p className="whitespace-pre-wrap">{generatedReply}</p>
              ) : (
                <p className="text-muted-foreground text-center py-20">
                  Your AI-generated reply will appear here
                </p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>✨ Generated using your personalized writing style</p>
            </div>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="p-6 bg-primary/5">
          <h3 className="font-semibold mb-3">💡 Tips for better results</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Include the full conversation context for more accurate replies</li>
            <li>• The AI will match your personality settings from the Settings page</li>
            <li>• You can regenerate replies if you're not satisfied with the first result</li>
            <li>• Edit the generated reply to add your personal touch before sending</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  )
}
