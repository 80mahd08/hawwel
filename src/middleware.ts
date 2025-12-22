import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// const isPublicRoute = createRouteMatcher([...]); // Removed as it was unused following the skip logic update

export default clerkMiddleware(async (_auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip intlMiddleware for API routes (root level or localized)
  if (pathname.startsWith('/api') || /^\/(en|fr|ar)\/api/.test(pathname)) {
    return;
  }
  
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|ico|jpe?g|webp|png|gif|svg|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
