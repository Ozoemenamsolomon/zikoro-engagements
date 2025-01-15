
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
          .from("quiz")
          .delete()
          .eq("quizAlias", quizId);
  
        if (error) {
          return NextResponse.json(
            { error: error?.message },
            {
              status: 400,
            }
          );
        }
  
        if (error) throw error;
  
        return NextResponse.json(
          { data },
          {
            status: 201,
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