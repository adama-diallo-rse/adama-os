import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

// Next.js 16 : la convention "middleware" est renommée "proxy" (runtime nodejs).
// La logique de session/protection reste dans lib/supabase/middleware.ts.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Tout sauf les assets statiques et les images.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
