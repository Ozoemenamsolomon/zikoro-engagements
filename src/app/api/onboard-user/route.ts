import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();

  if (req.method === "POST") {
    try {
      // Query users who registered 2 hours ago
      const twoHoursAgo = new Date(
        new Date().getTime() - 2 * 60 * 60 * 1000
      ).toISOString();
      const oneSecondBeforeTwoHoursAgo = new Date(
        new Date().getTime() - 2 * 60 * 60 * 1000 - 1000
      ).toISOString();
      
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .gte("created_at", oneSecondBeforeTwoHoursAgo)
        .lte("created_at", twoHoursAgo);
      // .eq('welcome_email_sent', false); // Assuming you have a column to track if the email was sent

      if (error) {
        throw error;
      }

      // var { SendMailClient } = require("zeptomail");

      // let client = new SendMailClient({
      //   url: process.env.NEXT_PUBLIC_ZEPTO_URL,
      //   token: process.env.NEXT_PUBLIC_ZEPTO_TOKEN,
      // });

      // Send email to each user
      for (const user of users) {
    
        // const resp = await client.sendMail({
        //   from: {
        //     address: process.env.NEXT_PUBLIC_EMAIL,
        //     name: "Zikoro",
        //   },
        //   to: [
        //     {
        //       email_address: {
        //         address: user.email,
        //         name: user.name,
        //       },
        //     },
        //   ],
        //   subject: `Welcome to Zikoro`,
        //   htmlbody: `<div>Welcome to Zikoro</div>`,
        // });

        // // Mark the email as sent
        // await supabase
        //   .from('users')
        //   .update({ welcome_email_sent: true })
        //   .eq('id', user.id);
      }

      // success - Looks Good
      return NextResponse.json(
        { msg: "Messages sent" },
        {
          status: 200,
        }
      );
    } catch (error) {
      // intentionally return 500
      return NextResponse.json(
        {
          error: "An error occurred while making the request.",
        },
        {
          status: 500,
        }
      );
    }
  } else {
    // return error response
    return NextResponse.json({ error: "Method not allowed" });
  }
}

export const dynamic = "force-dynamic";


/**
 const sevenDaysAgo = new Date(
  new Date().getTime() - 7 * 24 * 60 * 60 * 1000
).toISOString();

const { data: unverifiedUsers, error } = await supabase
  .from("auth.users")
  .select("*")
  .is("email_confirmed_at", null) // Email not verified
  .gte("created_at", sevenDaysAgo); // Registered in the last 7 days
 */