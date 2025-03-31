// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.0";

// Initialize Supabase
//@ts-ignore
const supabaseUrl = Deno.env.get("_SUPABASE_URL") as string;
// @ts-ignore
const supabaseKey = Deno.env.get("_SUPABASE_SECRET_KEY") as string;

const supabase = createClient(supabaseUrl, supabaseKey);

// @ts-ignore
Deno.serve(async (req) => {
  try {
    const request = await req.json();

    const { email } = request;
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    let page = 0;

    // set to store emails only
    const emailSet = new Set();

    while (true) {
      const { data } = await supabase.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      // no more user
      if (!data.users.length) break;
      // @ts-ignore -- add user to the hash set
      data.users.forEach((user) => emailSet.add(user.email));
      page++;
    }

    // check if email is in the set
    const emailExists = emailSet.has(email);

    return new Response(JSON.stringify({ exists: emailExists }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    // @ts-ignore
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/check-if-user-exist' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
