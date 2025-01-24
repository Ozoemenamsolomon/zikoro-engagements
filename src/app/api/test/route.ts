import { createClient } from "@/utils/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const supabase = createClient();

    if (req.method === "GET") {
        try {
            const { data, error } = await supabase
                .from("organization")
                .select("*")
                .order("created_at", { ascending: true }); // Order by created_at in descending order


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
