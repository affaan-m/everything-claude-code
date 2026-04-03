---
description: Scaffold a Supabase Edge Function with Deno, validation, error handling, and CORS
---

# Create Supabase Edge Function

Generate a production-ready Supabase Edge Function.

## Gather Context

1. What does this function do? (webhook handler, cron job, custom API, background task)
2. HTTP methods it should handle (GET, POST, PUT, DELETE)
3. Does it need auth? (verify JWT from `Authorization` header)
4. External APIs it calls?
5. Does it write to the database?

## Code Standards

- Runtime: Deno (TypeScript)
- Always handle CORS preflight (`OPTIONS` request)
- Validate request body with explicit type checks — no `any`
- Return proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Wrap everything in try/catch — edge functions must never crash without a response
- Use `createClient` from `@supabase/supabase-js` for DB access inside the function
- Use the service role key (`SUPABASE_SERVICE_ROLE_KEY`) only when bypassing RLS is required

## Template

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check (if needed)
    // const authHeader = req.headers.get("Authorization")!;
    // const supabase = createClient(
    //   Deno.env.get("SUPABASE_URL")!,
    //   Deno.env.get("SUPABASE_ANON_KEY")!,
    //   { global: { headers: { Authorization: authHeader } } }
    // );

    // Function logic here

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
```

## Output

1. The edge function file at `supabase/functions/<function-name>/index.ts`
2. CLI deploy command: `supabase functions deploy <function-name>`
3. Example `curl` call to test it
4. If it needs secrets, list them: `supabase secrets set KEY=value`
