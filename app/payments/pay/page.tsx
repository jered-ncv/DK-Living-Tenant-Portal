'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PaymentForm from '@/components/PaymentForm'
import { createClient } from '@/lib/supabase/client'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PayPage() {
  const [clientSecret, setClientSecret] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Fetch user's balance and create payment intent
    const initializePayment = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Get user's unit
        const { data: unit } = await supabase
          .from('units')
          .select('*, properties(*)')
          .eq('tenant_id', user.id)
          .single()

        if (!unit) {
          setError('No unit found for your account')
          setLoading(false)
          return
        }

        // TODO: Fetch real balance from QBO
        const balance = unit.monthly_rent || 0
        setAmount(balance)

        // Create payment intent
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: balance,
            unitId: unit.id,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create payment intent')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
        setLoading(false)
      } catch (err) {
        console.error('Payment initialization error:', err)
        setError('Failed to initialize payment. Please try again.')
        setLoading(false)
      }
    }

    initializePayment()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Preparing payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/payments">
              <Button variant="outline" className="w-full">
                Back to Payments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0E7490',
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Make a Payment</h1>
            <Link href="/payments">
              <Button variant="ghost">← Back</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Amount Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Amount</CardTitle>
              <CardDescription>Your current balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                ${amount.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <PaymentForm amount={amount} />
            </Elements>
          )}
        </div>
      </main>
    </div>
  )
}
