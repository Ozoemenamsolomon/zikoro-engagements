import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  if (req.method === "POST") {
    try {
      const params = await req.json();

      const { error } = await supabase.from("forms").upsert(params);

      if (error) {
        return NextResponse.json(
          { error: error?.message },
          {
            status: 400,
          }
        );
      }
      if (error) throw error;

      console.log(params.formSettings)

      if (
        typeof params.formSettings.engagementId === "string" &&
        params?.formSettings.engagementId.length > 0 &&
        params.formSettings.engagementType === "quiz"
      ) {
        const { error: engagementFetchError, data } = await supabase
          .from("quiz")
          .select("*")
          .eq("quizAlias", params.formSettings.engagementId)
          .single();

        if (engagementFetchError) {
          return NextResponse.json(
            {
              error: engagementFetchError.message,
            },
            {
              status: 400,
            }
          );
        }

        if (engagementFetchError) throw error;

        if (data && !data?.formAlias) {
          const payload = {
            ...data,
            formAlias: params?.formAlias,
          };
          const { error: upateError } = await supabase
            .from("quiz")
            .upsert(payload);

          if (upateError) {
            return NextResponse.json(
              {
                error: upateError.message,
              },
              {
                status: 400,
              }
            );
          }

          if (upateError) throw error;
        }
      }

      if (
        typeof params.formSettings.engagementId === "string" &&
        params?.formSettings.engagementId.length > 0 &&
        params.formSettings.engagementType === "Q & A"
      ) {
        const { error: engagementFetchError, data } = await supabase
          .from("QandA")
          .select("*")
          .eq("QandAAlias", params.formSettings.engagementId)
          .single();

        if (engagementFetchError) {
          return NextResponse.json(
            {
              error: engagementFetchError.message,
            },
            {
              status: 400,
            }
          );
        }

        if (engagementFetchError) throw error;

        if (data && !data?.formAlias) {
          const payload = {
            ...data,
            formAlias: params?.formAlias,
          };
          const { error: upateError } = await supabase
            .from("QandA")
            .upsert(payload);

          if (upateError) {
            return NextResponse.json(
              {
                error: upateError.message,
              },
              {
                status: 400,
              }
            );
          }

          if (upateError) throw error;
        }
      }

      return NextResponse.json(
        { msg: "Form Created Successfully" },
        {
          status: 200,
        }
      );
    } catch (error) {
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

export async function GET(req: NextRequest) {
  const supabase = createClient();

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("* organization(*)");

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
