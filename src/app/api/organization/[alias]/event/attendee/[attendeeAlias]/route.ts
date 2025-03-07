import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { attendeeAlias: string } }
) {
  const { attendeeAlias } = params;
  const supabase = createClient();

  if (req.method === "GET") {
    try {
      const query = supabase
        .from("attendees")
        .select("*")

        .eq("attendeeAlias", attendeeAlias)
        .single();

      const { data, error, status } = await query;

      if (error) throw error;

      return NextResponse.json(
        {
          data: data[0],
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
