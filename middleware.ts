import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Define the paths that should be protected
const includedPaths = [
 
  "/home",
  
];
//  "/event/:eventId/reception",
const dynamicPaths  = [
 
  "/e/:workspaceAlias/qa/o/:qaId",
  "/e/:workspaceAlias/quiz/o/:quizId",
  "/e/:workspaceAlias/form/o/:formId",
  "/e/:workspaceAlias/poll/o/:quizId",

]



export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  console.log("middleware path", path);


  // check if the requested path is included in protected paths
  const isDynamicPathIncluded = dynamicPaths.some((included) => 
    new RegExp(`^${included.replace(/:\w+/g, '\\w+')}`).test(path)
  )
  console.log("outside the condition", isDynamicPathIncluded)
  // if (isDynamicPathIncluded && !session) {
  //   console.log("it works")
  //   // If user is not authenticated and path is included, redirect to the login page
  //   if (path.startsWith("/api")) {
  //     return NextResponse.json(
  //       { error: "Authorization failed" },
  //       { status: 403 }
  //     );
  //   } else {
  //     const redirectUrl = new URL("/login", req.url);
  //     redirectUrl.searchParams.set("redirectedFrom", path);
  //     return NextResponse.redirect(redirectUrl);
  //   }
  // }
 // Check if the request path is included in the protected paths
  const isIncludedPath = includedPaths.some((includedPath) =>
    path.startsWith(includedPath)
  );

  // if (isIncludedPath && !session) {
    
  //   // If user is not authenticated and path is included, redirect to the login page
  //   if (path.startsWith("/api")) {
  //     return NextResponse.json(
  //       { error: "Authorization failed" },
  //       { status: 403 }
  //     );
  //   } else {
  //     const redirectUrl = new URL("/login", req.url);
  //     redirectUrl.searchParams.set("redirectedFrom", path);
  //     return NextResponse.redirect(redirectUrl);
  //   }
  // }

  // Allow the request to proceed if the user is authenticated or the path is not included
  return res;
}

export const config = {
  matcher: [
    "/e/:path*",
    "/home/:path*",
    "/referrals/:path*",
    "/engagements/:path*",
  ],
};


