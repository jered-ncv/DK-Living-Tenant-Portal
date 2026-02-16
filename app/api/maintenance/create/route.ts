import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Asana API configuration
const ASANA_API_URL = 'https://app.asana.com/api/1.0'
const ASANA_PAT = process.env.ASANA_ACCESS_TOKEN || ''
const ASANA_WORKSPACE_ID = process.env.ASANA_WORKSPACE_ID || ''
const ASANA_PROJECT_ID = process.env.ASANA_PROJECT_ID || ''

interface MaintenanceRequestBody {
  userId: string
  unitId: string
  category: string
  title: string
  description: string
  urgency: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MaintenanceRequestBody
    const { userId, unitId, category, title, description, urgency } = body

    // Validate required fields
    if (!userId || !unitId || !category || !title || !description || !urgency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create maintenance request in database
    const { data: maintenanceRequest, error: dbError } = await supabase
      .from('maintenance_requests')
      .insert({
        tenant_id: userId,
        unit_id: unitId,
        category,
        title,
        description,
        urgency,
        status: 'submitted',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create maintenance request' },
        { status: 500 }
      )
    }

    // Create Asana task if credentials are configured
    let asanaTaskId = null
    let asanaTaskUrl = null

    if (ASANA_PAT && ASANA_WORKSPACE_ID && ASANA_PROJECT_ID) {
      try {
        // Get unit and property info for task context (active properties only)
        const { data: unit } = await supabase
          .from('units')
          .select(`
            unit_number,
            properties!inner (
              name,
              address,
              is_active
            )
          `)
          .eq('id', unitId)
          .eq('properties.is_active', true)
          .single()

        // Get tenant info
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', userId)
          .single()

        // Build task description with context
        const property = unit?.properties as any
        const taskDescription = `
**Property:** ${property?.name || 'Unknown'}
**Address:** ${property?.address || 'Unknown'}
**Unit:** ${unit?.unit_number || 'Unknown'}
**Tenant:** ${profile?.full_name || 'Unknown'}
**Email:** ${profile?.email || 'Unknown'}
**Phone:** ${profile?.phone || 'N/A'}

**Category:** ${category}
**Urgency:** ${urgency.toUpperCase()}

**Issue Description:**
${description}

**Portal Request ID:** ${maintenanceRequest.id}
        `.trim()

        // Map urgency to Asana priority (if using custom fields)
        // Note: This might need adjustment based on your Asana setup
        
        const asanaResponse = await fetch(`${ASANA_API_URL}/tasks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ASANA_PAT}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              name: `[${urgency.toUpperCase()}] ${title}`,
              notes: taskDescription,
              projects: [ASANA_PROJECT_ID],
              workspace: ASANA_WORKSPACE_ID,
            }
          }),
        })

        if (asanaResponse.ok) {
          const asanaData = await asanaResponse.json()
          asanaTaskId = asanaData.data.gid
          asanaTaskUrl = `https://app.asana.com/0/${ASANA_PROJECT_ID}/${asanaTaskId}`

          // Update request with Asana task info
          await supabase
            .from('maintenance_requests')
            .update({
              asana_task_id: asanaTaskId,
              asana_task_url: asanaTaskUrl,
            })
            .eq('id', maintenanceRequest.id)
        } else {
          const errorText = await asanaResponse.text()
          console.error('Asana API error:', errorText)
        }
      } catch (asanaError) {
        console.error('Failed to create Asana task:', asanaError)
        // Don't fail the request if Asana integration fails
      }
    }

    return NextResponse.json({
      success: true,
      requestId: maintenanceRequest.id,
      asanaTaskId,
      asanaTaskUrl,
    })
  } catch (error) {
    console.error('Error creating maintenance request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
