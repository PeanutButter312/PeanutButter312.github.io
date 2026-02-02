import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { useAuthStore } from '@/stores/authStore'
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { setOnboarded } = useAuthStore()
  
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [personality, setPersonality] = useState({
    formalCasual: 50,
    shortDetailed: 50,
    politeDir: 50,
    emotionalLogical: 50
  })
  const [trainingSample, setTrainingSample] = useState('')

  const handleComplete = () => {
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    setOnboarded(name, {
      ...personality,
      trainingSamples: trainingSample ? [trainingSample] : [],
      learningProgress: trainingSample ? 15 : 0
    })
    
    toast.success('Your Doppel is ready!')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <span className="font-bold text-2xl">Doppel</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            {step === 1 && "Let's get to know you"}
            {step === 2 && "Define your communication style"}
            {step === 3 && "Train your AI twin"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {step === 1 && "This helps your Doppel sound like you"}
            {step === 2 && "Adjust sliders to match your personality"}
            {step === 3 && "Paste writing samples to improve accuracy"}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 lg:p-12">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base mb-2 block">
                  What should we call you?
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-lg"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Personality Sliders */}
          {step === 2 && (
            <div className="space-y-8">
              <PersonalitySlider
                label="Communication tone"
                leftLabel="Formal"
                rightLabel="Casual"
                value={personality.formalCasual}
                onChange={(val) => setPersonality({ ...personality, formalCasual: val })}
              />
              <PersonalitySlider
                label="Response length"
                leftLabel="Short & concise"
                rightLabel="Detailed & thorough"
                value={personality.shortDetailed}
                onChange={(val) => setPersonality({ ...personality, shortDetailed: val })}
              />
              <PersonalitySlider
                label="Directness"
                leftLabel="Polite & diplomatic"
                rightLabel="Direct & straightforward"
                value={personality.politeDir}
                onChange={(val) => setPersonality({ ...personality, politeDir: val })}
              />
              <PersonalitySlider
                label="Decision style"
                leftLabel="Emotional & empathetic"
                rightLabel="Logical & analytical"
                value={personality.emotionalLogical}
                onChange={(val) => setPersonality({ ...personality, emotionalLogical: val })}
              />
            </div>
          )}

          {/* Step 3: Training */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="sample" className="text-base mb-2 block">
                  Paste a writing sample (optional)
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Email, message, or any text that represents your writing style
                </p>
                <Textarea
                  id="sample"
                  placeholder="Example: Hey team, wanted to share some quick thoughts on the project..."
                  value={trainingSample}
                  onChange={(e) => setTrainingSample(e.target.value)}
                  className="min-h-[200px] text-base"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                size="lg"
                onClick={() => setStep(step + 1)}
                className="flex-1"
                disabled={step === 1 && !name.trim()}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleComplete}
                className="flex-1 gradient-primary"
              >
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PersonalitySlider({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange
}: {
  label: string
  leftLabel: string
  rightLabel: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <Label className="text-base mb-4 block">{label}</Label>
      <div className="space-y-3">
        <Slider
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  )
}
