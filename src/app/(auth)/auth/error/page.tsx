// src/app/auth/error/page.tsx
"use client"; // Needs to access searchParams

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Create a client component that uses useSearchParams
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  let errorMessage = "An unknown authentication error occurred.";
  let errorDetails = "";

  // Provide more specific messages based on common error codes
  switch (error) {
    case "CredentialsSignin":
      errorMessage = "Invalid email or password.";
      errorDetails = "Please check your credentials and try again.";
      break;
    case "Callback":
    case "OAuthCallback":
      errorMessage = "There was an issue during the authentication callback.";
      errorDetails =
        "This might be a temporary server issue. Please try again later.";
      break;
    case "AccessDenied":
      errorMessage = "Access Denied.";
      errorDetails =
        "You do not have permission to sign in or access this resource.";
      break;
    case "Verification":
      errorMessage = "Verification Error.";
      errorDetails =
        "The sign-in link is no longer valid. It may have expired or already been used.";
      break;
    // Add cases for other specific errors you anticipate
    default:
      if (error) {
        errorMessage = `Authentication Error: ${error}`;
        errorDetails =
          "Please check the server logs or contact support if the issue persists.";
      }
      break;
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center bg-destructive text-destructive-foreground p-4 rounded-t-lg">
        <CardTitle className="text-2xl font-bold">
          Authentication Failed
        </CardTitle>
        <CardDescription className="text-destructive-foreground/90">
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {errorDetails && (
          <p className="text-center text-muted-foreground">{errorDetails}</p>
        )}
        <p className="text-center text-sm text-muted-foreground">
          Error Code:{" "}
          <code className="bg-muted px-1 rounded">{error || "N/A"}</code>
        </p>
        <div className="flex justify-center">
          <Link href="/login">
            <Button variant="outline">Return to Login</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Main page component with Suspense
export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-1 text-center bg-destructive text-destructive-foreground p-4 rounded-t-lg">
              <CardTitle className="text-2xl font-bold">
                Authentication Failed
              </CardTitle>
              <CardDescription className="text-destructive-foreground/90">
                Loading error details...
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </CardContent>
          </Card>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
