// src/components/providers/NextAuthProvider.tsx
"use client"; // VERY IMPORTANT: Mark this as a Client Component

import { SessionProvider } from "next-auth/react";
import React from "react";

type Props = {
  children?: React.ReactNode;
};

export default function NextAuthProvider({ children }: Props) {
  // SessionProvider needs to be inside a client component
  return <SessionProvider>{children}</SessionProvider>;
}
