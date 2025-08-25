// src/lib/auth.ts
import type { NextAuthOptions, Session } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { connectToDatabase, getClientPromise } from "./mongoose";
import UserModel from "@/database/models/User.model";

// DB connection check (keep as is)
connectToDatabase().catch((err) => {
  console.error(
    "FATAL: Initial MongoDB connection failed on server start:",
    err
  );
});

// Log entry point of this module initialization
console.log("[Auth] Initializing authOptions...");

export const authOptions: NextAuthOptions = {
  // --- Adapter Configuration ---
  adapter: MongoDBAdapter(getClientPromise(), {
    databaseName: "kbhsschool",
    // collections: { ... } // Optional
  }),
  // Log right after adapter definition
  // Note: This log runs at build/startup time, not per request
  init: () => {
    console.log("[Auth Init] Adapter configured in options.");
  },

  // --- Providers Configuration ---
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        /* ... as before ... */
      },
      async authorize(credentials, req) {
        console.log(
          "[Authorize] Attempting authorization for:",
          credentials?.email
        );
        // Add specific log before returning success
        if (!credentials?.email || !credentials?.password) return null; // Simplified for brevity

        try {
          await connectToDatabase();
          const user = await UserModel.findOne({ email: credentials.email })
            .select("+password")
            .lean();
          if (!user || !user.password) return null; // Simplified for brevity

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) return null; // Simplified for brevity

          console.log(
            `[Authorize] Success for ${credentials.email}. Returning user object.`
          ); // Log success before return
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("[Authorize] Error during authorization:", error);
          return null;
        }
      },
    }),
    // ... other providers ...
  ],

  // --- Session Configuration ---
  session: {
    strategy: "jwt", // Changed from "database" to "jwt"
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  // Log right after session definition (runs at build/startup)
  // Note: This kind of logging directly in the object might not execute as expected,
  // relies on module evaluation order. The console.log at the top is more reliable for init time.
  // sessionStrategyCheck: console.log("[Auth Init] Session strategy set to 'database'."),

  // --- Pages Configuration ---
  pages: {
    signIn: "/login",
    error: "/auth/error", // Define an error page to see if it redirects here
  },

  // --- Callbacks ---
  callbacks: {
    async jwt({ token, user }) {
      console.log("--- JWT Callback ---");
      if (user) {
        // This runs only on sign in
        console.log("JWT: User sign in, adding custom properties to token");
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("--- Session Callback ---");
      if (token && session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        console.log(
          "Session modified successfully:",
          JSON.stringify(session, null, 2)
        );
      } else {
        console.warn(
          "[Session Callback] invoked without token or session.user object."
        );
      }
      return session;
    },

    // DO NOT include the JWT callback if strategy is "database"
    // async jwt({ token, user }) { ... }
  },

  // --- Debugging ---
  debug: process.env.NODE_ENV === "development",

  // --- Secret ---
  secret: process.env.NEXTAUTH_SECRET,

  // --- Event Logging ---
  // Log specific NextAuth events for deeper insight
  events: {
    async signIn(message) {
      console.log("[Event: signIn]", message);
    },
    async signOut(message) {
      console.log("[Event: signOut]", message);
    },
    async createUser(message) {
      console.log("[Event: createUser]", message);
    },
    async updateUser(message) {
      console.log("[Event: updateUser]", message);
    },
    async linkAccount(message) {
      console.log("[Event: linkAccount]", message);
    },
    async session(message) {
      console.log("[Event: session]", message);
    }, // Log when session event fires
    async error(message) {
      console.error("[Event: error]", message);
    }, // Log errors specifically
  },
};

// Helper function (keep as is)
import { getServerSession as nextAuthGetServerSession } from "next-auth";
export async function getServerSession(): Promise<Session | null> {
  return nextAuthGetServerSession(authOptions);
}
