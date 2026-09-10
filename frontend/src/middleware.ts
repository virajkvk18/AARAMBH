import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export async function middleware(request: NextRequest) {
  const deny = () => {
    const to = new URL("/login", request.url);
    to.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(to);
  };

  if (!url || !key) return NextResponse.next();
  let response = NextResponse.next({ request });
  const s = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await s.auth.getUser();
  return user ? response : deny();
}
export const config = { matcher: ["/dashboard/:path*", "/apply/:path*"] };
