'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState<any>(null)

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent')
    
    if (!paymentIntentId) {
      router.push('/payments')
      return
    }

    // Verify payment status
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payments/verify?payment_intent=${paymentIntentId}`)
        if (response.ok) {
          const data = await response.json()
          setPayment(data)
        }
      } catch (error) {
        console.error('Error verifying payment:', error)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Confirming payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your rent payment has been processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {payment && (
            <>
              <div className="flex items-center justify-between py-3 border-t border-b">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${(payment.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date</span>
                  <span className="text-gray-900">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-900">
                    {payment.payment_method || 'Card'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmation</span>
                  <span className="text-gray-900 font-mono text-xs">
                    {payment.id?.slice(-12) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-600">Completed</Badge>
                </div>
              </div>
            </>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-medium">What's next?</span><br />
              Your payment has been recorded and will be reflected in your account shortly.
              A receipt has been sent to your email.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Link href="/payments" className="w-full">
            <Button variant="outline" className="w-full">
              View Payment History
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
