// src/lib/actions/auth.actions.ts
"use server"; // Mark this module as containing Server Actions

import { z } from "zod";

import { signIn as nextAuthSignIn } from "next-auth/react"; // Use client-side signIn for redirect handling
// For direct server-side credential validation without automatic redirect,
// you might call your DB logic directly or use a server-side signIn variant if available/suitable.
// Let's stick to the client-side signIn called from the form for now, as it handles redirects well.

import bcrypt from "bcrypt";
import { connectToDatabase } from "../mongoose";
import UserModel from "@/database/models/User.model";
import mongoose from "mongoose";
import { UserRole } from "@/types";

// --- Validation Schemas ---
const SignUpSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  // Add password complexity requirements if needed
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password cannot be empty" }), // Basic check
});

// --- Types for Action Results ---
interface ActionResult {
  success: boolean;
  message: string;
  error?: string | null; // Optional detailed error
  fieldErrors?: Record<string, string[]>; // For Zod validation errors
}

// --- Register User Action ---
export async function registerUser(
  formData: unknown // Accept raw form data
): Promise<ActionResult> {
  // 1. Validate input using Zod
  const validationResult = SignUpSchema.safeParse(formData);

  if (!validationResult.success) {
    console.log(
      "Registration Validation Failed:",
      validationResult.error.flatten().fieldErrors
    );
    return {
      success: false,
      message: "Invalid input data.",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validationResult.data;

  try {
    await connectToDatabase();

    // 2. Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists.",
      };
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // 4. Create the new user
    await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.STUDENT, // Default role for new signups
    });

    console.log(`User registered successfully: ${email}`);
    return {
      success: true,
      message: "Registration successful! Please log in.",
    };
  } catch (error) {
    console.error("Registration Error:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      // Handle Mongoose validation errors more specifically if needed
      return {
        success: false,
        message: "Database validation error during registration.",
        error: error.message,
      };
    }
    return {
      success: false,
      message: "An unexpected error occurred during registration.",
      error: (error as Error).message,
    };
  }
}

// --- Login User Action ---
// This action primarily validates server-side, but relies on client-side `signIn` for the actual NextAuth flow & redirect.
// Alternatively, you could implement the full logic here and return data for client-side signIn.
export async function loginUser(
  formData: unknown
): Promise<ActionResult & { redirectTo?: string }> {
  // Add redirectTo for potential use
  const validationResult = LoginSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Invalid login data.",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validationResult.data;

  // IMPORTANT: We *don't* call nextAuthSignIn from 'next-auth' directly here
  // in a server action if we want the standard redirect flow handled by the
  // client-side `signIn` function (from 'next-auth/react') called from the form component.
  // The `authorize` function in `lib/auth.ts` will handle the actual credential check
  // when the client-side `signIn` triggers the NextAuth flow.

  // This server action now mostly serves as a validation layer before
  // telling the client to proceed with the actual signIn call.
  // You *could* perform the DB check here again as an extra layer, but
  // `authorize` already does it.

  console.log(
    `Server Action: Validation passed for login attempt: ${email}. Client should now call signIn.`
  );

  // Return success to indicate validation passed. The client form will then call signIn.
  return {
    success: true,
    message: "Validation successful. Attempting login...",
    // Optionally suggest redirect target, though client signIn usually handles this based on callbackUrl
    // redirectTo: '/dashboard'
  };

  /*
    // --- Alternative: Attempting signIn directly from Server Action ---
    // This is more complex to handle redirects and errors correctly compared to client-side signIn.
    try {
        console.log(`Attempting server-side signIn for ${email}`);
        // This might not behave as expected regarding redirects/error handling compared to client-side call
        await serverSideSignIn("credentials", { // Assuming a hypothetical serverSideSignIn exists or using the API endpoint
            email,
            password,
            redirect: false, // Important: handle redirect manually or return status
        });
        console.log(`Server-side signIn successful for ${email}`);
        return { success: true, message: "Login successful!", redirectTo: '/dashboard' };
    } catch (error) {
        if (error instanceof AuthError) {
            console.error("NextAuth Authentication Error:", error.type, error.message);
            switch (error.type) {
                case 'CredentialsSignin':
                    return { success: false, message: 'Invalid email or password.' };
                default:
                    return { success: false, message: 'An authentication error occurred.' };
            }
        }
        // Handle other errors (DB connection, etc.)
        console.error("Login Action Error:", error);
        return { success: false, message: 'An unexpected error occurred during login.' };
    }
    */
}
