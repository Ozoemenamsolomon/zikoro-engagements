// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.0";

// initialize supabase
//@ts-ignore
const supabaseUrl = Deno.env.get("_SUPABASE_URL") as string;
// @ts-ignore
const supabaseKey = Deno.env.get("_SUPABASE_SECRET_KEY") as string;
// @ts-ignore
const zeptoApiKey = Deno.env.get("_ZEPTOMAIL_API_TOKEN") as string;
// @ts-ignore
const senderEmail = Deno.env.get("_SENDER_EMAIL") as string;

const supabase = createClient(supabaseUrl, supabaseKey);


// @ts-ignore
Deno.serve(async (req) => {
 
  try {

       //> fetch certificate scheduled to be issued today
       const { error, data } = await supabase
       .from("credentialsIntegration")
       .select("*")
       .eq("scheduleDate", "")

       
     

  }
  catch(error){
     // @ts-ignore
     return new Response(`Error: ${error.message}`, { status: 500 });
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-scheduled-credential' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
