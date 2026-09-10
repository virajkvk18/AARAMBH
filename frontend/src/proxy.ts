import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";
import { isSupabaseConfigured } from "@/utils/supabase/env";

export async function proxy(request: NextRequest) {
  const deny = () => {
    const to = new URL("/login", request.url);
    to.searchParams.set(
      "redirect",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(to);
  };

  if (!isSupabaseConfigured) return NextResponse.next();

  const { supabase, response } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? response : deny();
}

export const config = {
  matcher: ["/dashboard/:path*", "/apply/:path*"],
};