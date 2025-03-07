// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.0";

console.log("Hello from Functions!");

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

function formatDateWithOffset(date: Date) {
  const offset = date.getTimezoneOffset();
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const minutes = String(absOffset % 60).padStart(2, "0");

  return date.toISOString().replace("Z", `${sign}${hours}:${minutes}`);
}
// @ts-ignore
Deno.serve(async (req) => {
  try {
    const twoHoursAgo = new Date(new Date().getTime() - 2 * 60 * 60 * 1000);

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .gte("created_at", formatDateWithOffset(twoHoursAgo))
      .eq("welcome_email_sent", false);

    for (const user of users) {
      // Send email to "user"

      const mailBody = ` <div style="background-color: #f4f4f4; padding: 20px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
      <tr>
        <td align="center">
          <img src="https://res.cloudinary.com/dkdrbjfdt/image/upload/v1740654461/logo_rogdwe.webp" alt="Company Logo" width="150" style="margin-bottom: 20px;">
        </td>
      </tr>
      <tr>
        <td align="center">
          <div style="background: #fff; padding: 20px; border-radius: 8px; max-width: 600px; text-align: start;">
           
            <p style="color: #555;">Hi ${user?.firstName},</p>
            <p style="color: #555; margin-top: 20px; margin-bottom: 20px;">
              We’re thrilled to have you on Zikoro! Here’s how you can get started right away:
            </p>
              <p style="color: #555; margin-top: 10px; margin-bottom: 10px;  text-align: start;">
              <span>✅ Create and sell event/workshop tickets in just 5 minutes.</span> <a style="margin-right: 3px;" href="https://zikoro.com" >Get Started</a>
            </p>
              <p style="color: #555; margin-top: 10px; margin-bottom: 10px;  text-align: start;">
               <span>✅ Issue digital certificates effortlessly and turn your recipients into brand ambassadors.</span> <a style="margin-right: 3px;" href="https://credentials.zikoro.com">Get Started</a>
              
            </p>
              <p style="color: #555; margin-top: 10px; margin-bottom: 10px;  text-align: start;">
              <span>  ✅ Gamify your event experience—engage attendees with fun quizzes, polls, and interactive forms.</span> <a style="margin-right: 3px;" href="https://engagements.zikoro.com">Get Started</a>
            
            </p>
              <p style="color: #555; margin-top: 10px; margin-bottom: 10px; text-align: start;">
               <span>✅ Simplify your appointments—enhance client interactions and run an efficient business.</span> <a style="margin-right: 3px;" href="https://bookings.zikoro.com">Get Started</a>
             

            </p>
            

              <p style="color: #555; margin-top: 20px; margin-bottom: 20px;">
             Start exploring and make the most of your experience with Zikoro!

            </p>

               <p style="color: #555; margin-top: 20px; margin-bottom: 20px;">
             Want to get the most out of Zikoro? Let’s chat! We’ll help you optimize your business with tailored solutions. 📲 WhatsApp us at <a href="https://wa.me/+2347041497076">+2347041497076</a>!

            </p>
          

 <p style="color: #555; margin-top: 5px; margin-bottom: 5px;">
            Best Regards,

            </p>
             <p style="color: #555;">
            The Zikoro Team

            </p>
           

           
          </div>
        </td>
      </tr>
      <tr style="margin-top: 12px; margin-bottom: 12px;">
        <td align="center" style="padding-top: 20px;">
          <p style="color: #777; font-size: 12px; margin-bottom: 15px;">Follow us on</p>
          <p style="margin-top: 12px; margin-bottom: 12px;">
             <a href="https://www.linkedin.com/company/zikoro/?viewAsMember=true" style="margin: 0 10px; border: 1px solid #E4E4E4; border-radius: 6px; padding: 4px;"><img width="20px" height="20px"  src="https://res.cloudinary.com/dkdrbjfdt/image/upload/v1740654856/mingcute--linkedin-fill_badqjp.png" alt="LinkedIn"></a>
      <a href="https://www.instagram.com/zikoro24/" style="margin: 0 10px; border: 1px solid #E4E4E4; border-radius: 6px; padding: 4px;"><img width="20px" height="20px" src="https://res.cloudinary.com/dkdrbjfdt/image/upload/v1740675569/ri--instagram-fill_n1vyop.png" alt="Instagram"></a>

    
         <a href="https://www.facebook.com/profile.php?id=61558280512718" style="margin: 0 10px; border: 1px solid #E4E4E4; border-radius: 6px; padding: 4px;"><img width="20px" height="20px" src="https://res.cloudinary.com/dkdrbjfdt/image/upload/v1740654856/mingcute--facebook-fill_pnkuma.png" alt="Facebook"></a>
          </p>
         
        </td>
      </tr>
    </table>
  </div>`;

      const emailResponse = await fetch(
        "https://api.zeptomail.com/v1.1/email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // @ts-ignore
            Authorization: zeptoApiKey,
          },
          body: JSON.stringify({
            from: {
              // @ts-ignore
              address: senderEmail,
              name: "Zikoro",
            },
            to: [
              {
                email_address: {
                  address: user?.userEmail,
                  name: user?.firstName,
                },
              },
            ],
            subject: "Welcome to Zikoro! Let’s Get Started 🚀",
            htmlbody: mailBody,
          }),
        }
      );

      if (!emailResponse.ok) {
        throw new Error(`Failed to send email: ${await emailResponse.text()}`);
      }

      // Mark the email as sent
      await supabase
        .from("users")
        .update({ welcome_email_sent: true })
        .eq("id", user.id);
    }

    return new Response(JSON.stringify(users), {
      status: 200,
    });
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
