import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();

  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url);
      const users = searchParams.get("users");

      console.log(users);

      const query = supabase
        .from("subscription")
        .select("*, user:user!inner(*)");

      // if (users) query.in("userId", JSON.parse(users));

      const { data, error } = await query;

      console.log(data);

      if (error) throw error;

      return NextResponse.json(
        {
          data,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(error);
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
    return NextResponse.json({ error: "Method not allowed" });
  }
}

export const dynamic = "force-dynamic";
