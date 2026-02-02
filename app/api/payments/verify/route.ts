import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const paymentIntentId = searchParams.get('payment_intent')

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing payment_intent' }, { status: 400 })
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      // Update payment record in database
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          payment_method: paymentIntent.payment_method_types[0] || 'card',
        })
        .eq('stripe_payment_intent_id', paymentIntentId)

      if (updateError) {
        console.error('Error updating payment:', updateError)
      }

      // TODO: Post payment to QuickBooks
      // This will be implemented in the QBO integration

      return NextResponse.json({
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        payment_method: paymentIntent.payment_method_types[0],
      })
    }

    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      error: 'Payment not completed',
    }, { status: 400 })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
