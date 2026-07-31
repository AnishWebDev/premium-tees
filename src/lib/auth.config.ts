import type { NextAuthConfig } from "next-auth";

function isStaffRole(role?: string | null) {
  return role === "ADMIN" || role === "SUPERADMIN";
}

/**
 * Edge-compatible Auth.js config for middleware.
 * Do not import Prisma, bcrypt, or Node-only modules here.
 */
export const authConfig = {
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "dev-only-secret-not-for-production"),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/profile",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      const isAdminRoute = pathname.startsWith("/admin");
      const isAccountRoute =
        pathname.startsWith("/profile") || pathname.startsWith("/orders");

      if ((isAdminRoute || isAccountRoute) && !isLoggedIn) {
        return false;
      }

      if (isAdminRoute && !isStaffRole(auth?.user?.role)) {
        return Response.redirect(new URL("/", request.nextUrl.origin));
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }

      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN" | "SUPERADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
