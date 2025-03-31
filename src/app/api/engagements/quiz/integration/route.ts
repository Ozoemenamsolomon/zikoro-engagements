      import { createClient } from "@/utils/supabase/server";
      import { NextRequest, NextResponse } from "next/server";
      
      export async function POST(req: NextRequest) {
        const supabase = createClient()
        if (req.method === "POST") {
          try {
            const params = await req.json();
      
             //> fetch the integration
        const { error, data } = await supabase
        .from("credentialsIntegration")
        .select("*")
        .eq("integrationAlias", params?.integrationAlias)
        .single();

          // integrationType integrationSettings
      
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
      