// src/app/(auth)/login/page.tsx
"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react"; // Use client-side signIn
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Validation Schema
const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormData = z.infer<typeof LoginSchema>;

// Create a client component that uses hooks
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"; // Redirect to dashboard or original page
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null); // Clear previous errors
    startTransition(async () => {
      try {
        // Use signIn from next-auth/react
        // It handles the communication with the NextAuth backend route
        const result = await signIn("credentials", {
          redirect: false, // Prevent NextAuth from automatically redirecting
          email: data.email,
          password: data.password,
          // callbackUrl // Optional: Let NextAuth handle redirect based on callbackUrl if successful
        });

        if (result?.error) {
          // Handle errors returned by the authorize function or NextAuth itself
          console.error("SignIn Error:", result.error);
          // Map common errors to user-friendly messages
          if (result.error === "CredentialsSignin") {
            setError("Invalid email or password. Please try again.");
            toast.error("Invalid email or password.");
          } else {
            setError(`Login failed: ${result.error}`);
            toast.error(`Login failed: ${result.error}`);
          }
        } else if (result?.ok && result?.url) {
          // Login successful, manually redirect using the router
          toast.success("Login successful!");
          router.push(callbackUrl); // Redirect to dashboard or intended page
          router.refresh(); // Optional: Force refresh to update layout/session state if needed
        } else if (result?.ok && !result?.url) {
          // Should not happen with redirect: false unless there's an issue
          toast.success("Login successful! Redirecting...");
          router.push(callbackUrl);
          router.refresh();
        } else {
          // Handle unexpected response
          setError("An unexpected error occurred during login.");
          toast.error("An unexpected error occurred.");
        }
      } catch (err) {
        // Catch errors from the signIn call itself (network issues, etc.)
        console.error("Login Page Error:", err);
        setError("An unexpected error occurred. Please try again later.");
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm"
                role="alert"
              >
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="m@example.com"
                      type="email"
                      autoComplete="email"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="******"
                      type="password"
                      autoComplete="current-password"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add Forgot Password link if needed */}
            {/* <div className="text-right text-sm">
                <Link href="/forgot-password" className="underline hover:text-primary">
                    Forgot password?
                </Link>
            </div> */}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="underline hover:text-primary">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// Main page component with Suspense
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>Loading login form...</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </CardContent>
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
