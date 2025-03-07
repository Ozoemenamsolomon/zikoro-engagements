// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.0";

console.log("Hello from Functions!");

// Initialize Supabase
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
Deno.serve(async () => {
  try {
    // Get users who joined within the last 2 hours
    const twoHoursAgo = new Date(
      Date.now() - 0.15 * 60 * 60 * 1000
    ).toISOString();

    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) throw new Error(`Error fetching users: ${error.message}`);

    // Filter unverified users who joined within the last 2 hours

    const unverifiedUsers = users.users.filter(
      // @ts-ignore
      (user) =>
        !user.email_confirmed_at &&
        new Date(user.created_at) >= new Date(twoHoursAgo)
    );

    for (const user of unverifiedUsers) {
      // Generate a magic link

      const userMetaData = user?.user_metadata;

      if (userMetaData?.verification_token) {
        let imageUrl = "";
        let magicLink = "";
        // Extract the magic link from the response
        if (userMetaData?.platform === "Engagement") {
          magicLink = `https://engagements.zikoro.com/onboarding?email=${
            user.email
          }&createdAt=${new Date().toISOString()}&userId=${user?.id}&token=${
            userMetaData?.verification_token
          }`;

          imageUrl = "https://res.cloudinary.com/dkdrbjfdt/image/upload/v1740654461/logo_rogdwe.webp"
        }

        if (userMetaData?.platform === "Event") {
          magicLink = `https://zikoro.com/onboarding?email=${
             user.email
           }&createdAt=${new Date().toISOString()}&userId=${user?.id}&token=${
             userMetaData?.verification_token
           }`;
           imageUrl = "https://res.cloudinary.com/dkdrbjfdt/image/upload/v1741084022/logo_re5khj.png"
        }

        if (userMetaData?.platform === "credentials") {
          magicLink = ` https://credentials.zikoro.com/onboarding?email=${
            user.email
          }&createdAt=${new Date().toISOString()}&userId=${user?.id}&token=${
            userMetaData?.verification_token
          }`;

          imageUrl = "https://res.cloudinary.com/dkdrbjfdt/image/upload/v1741082831/WhatsApp_Image_2025-03-04_at_01.42.56_qjbm0b.jpg"
        }

        // Send email with magic link
        const emailResponse = await fetch(
          "https://api.zeptomail.com/v1.1/email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: zeptoApiKey,
            },
            body: JSON.stringify({
              from: { address: senderEmail, name: "Zikoro" },
              to: [{ email_address: { address: user.email, name: "User" } }],
              subject: "Verify Your Email & Continue Onboarding",
              htmlbody: `
            <div style="background-color: #f4f4f4; padding: 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
      <tr>
        <td align="center">
          <img src=${imageUrl} alt="Company Logo" width="150" style="margin-bottom: 20px;">
        </td>
      </tr>
      <tr>
        <td align="center">
          <div style="background: #fff; padding: 20px; border-radius: 8px; max-width: 600px; text-align: start;">
              <p>Hello,</p>
              <p>Hey there! 👋 It looks like your verification on Zikoro isn’t complete yet. No worries—just click the button below to finish up and get started! 😊</p>
              <p style="margin-top: 20px; margin-bottom: 20px;"><a href="${magicLink}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Now</a></p>
              <p>If the button above doesn't work, copy and paste this link into your browser:</p>
              <p>${magicLink}</p>
  </td>
      </tr>
                </table>
            </div>
          `,
            }),
          }
        );

        if (!emailResponse.ok) {
          throw new Error(
            `Failed to send email: ${await emailResponse.text()}`
          );
        }

        console.log(`Magic link sent to ${user.email}`);
      }
    }

    return new Response(JSON.stringify(unverifiedUsers), { status: 200 });
  } catch (error) {
    // @ts-ignore
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-onboarding-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
