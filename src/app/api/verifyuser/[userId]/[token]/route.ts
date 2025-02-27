import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string; token: string } }
) {
  const { userId, token } = params;
  if (req.method === "POST") {
    try {
      const {data} = await supabase.auth.admin.getUserById(userId);

      if (data.user) {
        const userData = data?.user
        const userToken = userData?.user_metadata?.verification_token;

        if (userToken === token) {

          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { email_verified: true },
          });

        }
      }

      // success - Looks Good
      return NextResponse.json(
        { msg: "Success" },
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
