// src/types/index.ts
// Shared types that can be used in both client and server components

export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
}
