// src/app/(auth)/signup/page.tsx
"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// Import server action
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
import { registerUser } from "@/lib/action/auth.actions";

// Validation Schema
const SignUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type SignUpFormData = z.infer<typeof SignUpSchema>;

// Create a client component that uses hooks
function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    setError(null);
    startTransition(async () => {
      const result = await registerUser(data); // Call the server action

      if (result.success) {
        toast.success(result.message);
        // Redirect to login page after successful registration
        router.push("/login");
      } else {
        // Display errors
        setError(result.message);
        toast.error(result.message || "Registration failed.");
        // Set form errors if fieldErrors are available
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(field as keyof SignUpFormData, {
                type: "server",
                message: messages[0], // Show the first message for the field
              });
            }
          });
        }
      }
    });
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
        <CardDescription>Create your account to get started</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error &&
              !form.formState.isValid && ( // Show general error only if form isn't showing field errors
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="m@example.com"
                      type="email"
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
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-primary">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// Main page component with Suspense
export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <CardDescription>Loading signup form...</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </CardContent>
        </Card>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}

// import { Button } from "@/components/ui/button";
// import Link from "next/link";

// import React from "react";

// const page = () => {
//   return (
//     <div className="text-2xl font-bold">
//       You are not allowed to create an account at the moment!!
//       <br />
//       Please contact the admin for more information.
//       <br />
//       <br />
//       <span className="text-sm text-muted-foreground">
//         This is a demo version of the application. You can only login with the
//         provided credentials.
//       </span>
//       <br />
//       <Button className="mt-4 " asChild>
//         <Link href="/login">Go to Login</Link>
//       </Button>
//     </div>
//   );
// };

// export default page;
