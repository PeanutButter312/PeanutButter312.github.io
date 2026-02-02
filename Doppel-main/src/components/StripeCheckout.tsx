import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

interface CheckoutFormProps {
  onSuccess: () => void
}

function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success`,
        },
      })

      if (submitError) {
        setError(submitError.message || 'An error occurred')
      } else {
        onSuccess()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Subscribe to Premium'
        )}
      </Button>
    </form>
  )
}

interface StripeCheckoutProps {
  clientSecret: string
  onSuccess: () => void
}

export function StripeCheckout({ clientSecret, onSuccess }: StripeCheckoutProps) {
  const options = {
    clientSecret,
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Subscribe to Echo Premium</CardTitle>
          <CardDescription>
            Get unlimited messages and exclusive features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckoutForm onSuccess={onSuccess} />
        </CardContent>
      </Card>
    </Elements>
  )
}
