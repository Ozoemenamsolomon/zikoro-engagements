
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createClient()
  if (req.method === "POST") {
    try {
      const params = await req.json();

      const { error } = await supabase.from("quizAnswer").upsert(params);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          {
            status: 400,
          }
        );
      }

      if (error) throw error;

      return NextResponse.json(
        { msg: "Answer created successfully" },
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

export async function PATCH(req: NextRequest) {
    const supabase = createClient()
  if (req.method === "PATCH") {
    try {
      const params = await req.json();

      const { error } = await supabase
        .from("quizAnswer")
        .update([
          {
            ...params,
          },
        ])
        .eq("id", params?.id);

      if (error) {
        return NextResponse.json(
          {
            error: error?.message,
          },
          {
            status: 400,
          }
        );
      }
      if (error) throw error;

      return NextResponse.json(
        { msg: "Answer updated successfully" },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(error, "patch");
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