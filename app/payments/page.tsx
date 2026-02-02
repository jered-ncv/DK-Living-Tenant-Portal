import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function PaymentsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's unit
  const { data: unit } = await supabase
    .from('units')
    .select(`
      *,
      properties (
        name,
        address
      )
    `)
    .eq('tenant_id', user.id)
    .single()

  // Fetch recent payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', user.id)
    .order('payment_date', { ascending: false })

  // TODO: Fetch real balance from QBO API
  // For now, use monthly rent from unit
  const currentBalance = unit?.monthly_rent || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <Link href="/dashboard">
              <Button variant="ghost">← Back</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Balance & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle>Current Balance</CardTitle>
                <CardDescription>
                  {unit ? `${unit.properties?.name} - Unit ${unit.unit_number}` : 'Loading...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${currentBalance.toFixed(2)}
                  </span>
                  {currentBalance > 0 && (
                    <Badge variant="destructive">Due Now</Badge>
                  )}
                  {currentBalance === 0 && (
                    <Badge variant="default" className="bg-green-600">Paid</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Next due date: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </CardContent>
              <CardFooter>
                {currentBalance > 0 ? (
                  <Link href="/payments/pay" className="w-full">
                    <Button className="w-full" size="lg">
                      Pay ${currentBalance.toFixed(2)}
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full" size="lg" disabled>
                    No Balance Due
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/payments/pay">
                  <Button variant="outline" className="w-full">
                    Make a Payment
                  </Button>
                </Link>
                <Link href="/payments/autopay">
                  <Button variant="outline" className="w-full">
                    Set Up Autopay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Methods */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Saved payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  No payment methods saved yet.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Add a card or bank account when making your first payment.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/payments/pay" className="w-full">
                  <Button variant="outline" className="w-full">
                    Add Payment Method
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Payment History */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your past rent payments</CardDescription>
            </CardHeader>
            <CardContent>
              {payments && payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between py-3 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          ${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.payment_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {payment.payment_method && (
                          <p className="text-xs text-gray-400">
                            {payment.payment_method}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            payment.status === 'completed'
                              ? 'default'
                              : payment.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className={
                            payment.status === 'completed'
                              ? 'bg-green-600'
                              : ''
                          }
                        >
                          {payment.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Receipt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No payment history yet</p>
                  <p className="text-sm text-gray-400">
                    Your payments will appear here after your first transaction
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
