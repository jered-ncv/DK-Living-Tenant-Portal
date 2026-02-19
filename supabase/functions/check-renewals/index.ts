// ============================================================
// supabase/functions/check-renewals/index.ts
// 
// Daily cron job — checks all active leases and auto-logs
// renewal_review at 90 days and flags overdue offer_sent at 60 days.
// Deploy: supabase functions deploy check-renewals
// Schedule: supabase functions schedule check-renewals --cron "0 9 * * *"
// (Runs daily at 9 AM UTC / 4 AM EST)
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async () => {
  const today = new Date().toISOString().split('T')[0];
  const results = { reviewed: 0, offer_flagged: 0, critical: 0, errors: [] as string[] };

  // Get all active fixed-term leases
  const { data: leases, error } = await supabase
    .from('leases')
    .select('id, tenant_name, lease_end, monthly_rent, renewal_status, unit_id')
    .eq('status', 'active')
    .eq('lease_type', 'fixed')
    .not('lease_end', 'is', null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  for (const lease of leases || []) {
    const leaseEnd = new Date(lease.lease_end);
    const daysRemaining = Math.floor(
      (leaseEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    // 90-day mark: log internal review if not already done
    if (daysRemaining <= 90 && daysRemaining > 60 && lease.renewal_status === 'pending') {
      // Check if review was already logged
      const { data: existing } = await supabase
        .from('lease_actions')
        .select('id')
        .eq('lease_id', lease.id)
        .eq('action_type', 'renewal_review')
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.rpc('log_lease_action', {
          p_lease_id: lease.id,
          p_action_type: 'renewal_review',
          p_description: `Auto-flagged: ${daysRemaining} days remaining. Review tenant history and pull comps.`,
          p_performed_by_name: 'System',
        });
        results.reviewed++;
      }
    }

    // 60-day mark: flag if no offer sent yet
    if (daysRemaining <= 60 && daysRemaining > 30 && lease.renewal_status === 'pending') {
      await supabase.rpc('log_lease_action', {
        p_lease_id: lease.id,
        p_action_type: 'note',
        p_description: `OVERDUE: ${daysRemaining} days remaining, no renewal offer sent. Send offer immediately.`,
        p_performed_by_name: 'System',
      });
      results.offer_flagged++;
    }

    // 30-day mark: critical alert if still no decision
    if (daysRemaining <= 30 && ['pending', 'offer_sent'].includes(lease.renewal_status)) {
      await supabase.rpc('log_lease_action', {
        p_lease_id: lease.id,
        p_action_type: 'note',
        p_description: `CRITICAL: ${daysRemaining} days remaining. Renewal status: ${lease.renewal_status}. Decision needed NOW or unit enters pipeline.`,
        p_performed_by_name: 'System',
      });
      results.critical++;
    }
  }

  return new Response(JSON.stringify({
    success: true,
    date: today,
    leases_checked: leases?.length || 0,
    ...results,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
