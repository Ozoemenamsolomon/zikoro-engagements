import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createClient()
  if (req.method === "POST") {
    try {
      const params = await req.json();

      const { error } = await supabase.from("quizLobby").insert(params);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          {
            status: 400,
          }
        );
      }

 

      return NextResponse.json(
        { msg: "Live Participant created successfully" },
        {
          status: 201,
        }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        {
          error: error,
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