
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  const { quizId } = params;
  const supabase = createClient()

  if (req.method === "DELETE") {
    try {
      

      const { data, error, status } = await supabase
        .from("quizAnswer")
        .delete()
        .eq("quizId", quizId);

      if (error) {
        return NextResponse.json(
          {
            error: error.message,
          },
          {
            status: 200,
          }
        )
      }

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

export async function GET(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  const supabase = createClient()

  if (req.method === "GET") {
   const {quizId} = params

    try {
      const { data, error, status } = await supabase
        .from("quizAnswer")
        .select("*")
        .eq("quizId", quizId)
        .range(0,100000)

      // 
      if (error) {
        return NextResponse.json(
          {
            error,
          },
          {
            status: 400,
          }
        );
      }

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
