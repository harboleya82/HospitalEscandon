import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, prefer',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { id, respuestas, tabla, nombre_entrevistado, especialidad, perfil, action } = await req.json()

    if (!id) {
      return new Response(JSON.stringify({ error: 'Falta campo: id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const nombreTabla = tabla || 'entrevistas_cirujanos'

    // ---- ELIMINAR ----
    if (action === 'delete') {
      const { error } = await supabaseAdmin
        .from(nombreTabla)
        .delete()
        .eq('id', id)

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ ok: true, deleted: id }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ---- ACTUALIZAR ----
    const updateObj: Record<string, unknown> = {}
    if (respuestas          !== undefined) updateObj.respuestas          = respuestas
    if (nombre_entrevistado !== undefined) updateObj.nombre_entrevistado = nombre_entrevistado
    if (especialidad        !== undefined) updateObj.especialidad        = especialidad
    if (perfil              !== undefined) updateObj.perfil              = perfil

    const { data, error } = await supabaseAdmin
      .from(nombreTabla)
      .update(updateObj)
      .eq('id', id)
      .select()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
