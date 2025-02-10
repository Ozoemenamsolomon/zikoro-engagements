import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
/**
  
   */

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient();

  if (req.method === "GET") {
    const { userId } = params;
    try {
      const { data, error } = await supabase
        .from("forms")
        .select(
          `
    *,
    organization (
      *,
      organizationTeamMembers_Engagement (
        *
      )
    )
  `
        )
        .not("organization", "is", null)
        .not("organization.organizationTeamMembers_Engagement", "is", null)
        .eq("organization.organizationTeamMembers_Engagement.userId", userId);

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
