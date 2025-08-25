// src/components/marketing/Header.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react"; // Correct import for client component
import { Menu, LogIn, LogOut, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// ... (navLinks and dropdownLinks remain the same) ...
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/admissions-page", label: "Admission Info" }, // Public info page
  { href: "/contact", label: "Contact Us" },
  { href: "/facilities", label: "Facilities" },
  { href: "/news", label: "News & Events" },
];

const dropdownLinks = [
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admission Form" }, // Actual form might be protected
  { href: "/departments", label: "Departments" },
  { href: "/alumni", label: "Alumni" },
  // { href: "/students", label: "Students Info" }, // Likely protected dashboard item
  { href: "/gallery", label: "Gallery" },
];

const Header = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" }); // Redirect to home page after sign out
  };

  return (
    <header className="bg-[#295E4F] text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
      {/* Left Side: Logo and Dropdown Trigger */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Menu (Sheet) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-white/20 text-white"
              aria-label="Toggle Menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-[#295E4F] text-white border-r-0 w-[280px] sm:w-[320px] p-0 flex flex-col" // Adjust padding
          >
            <SheetHeader className="p-4 border-b border-white/20">
              <SheetTitle className="text-white text-2xl text-left">
                KBHS Menu
              </SheetTitle>
            </SheetHeader>
            <nav className="flex-1 flex flex-col space-y-2 p-4 overflow-y-auto">
              {navLinks.map((link) => (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="text-lg hover:bg-white/10 p-2 rounded block" // Ensure block for full width click
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
              <DropdownMenuSeparator className="bg-white/30 my-3" />
              <p className="text-sm text-gray-300 px-2 pt-2 font-semibold">
                More Sections
              </p>
              {dropdownLinks.map((link) => (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="text-lg hover:bg-white/10 p-2 rounded block"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            {/* Footer might contain auth actions or social links */}
            <SheetFooter className="p-4 border-t border-white/20 mt-auto">
              {/* Example: Add login/logout in sheet footer if needed */}
              {isLoading ? (
                <Skeleton className="h-10 w-full bg-white/20" />
              ) : session ? (
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-red-500/80 hover:text-white"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              ) : (
                <SheetClose asChild>
                  <Link href="/login" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full text-white border-white hover:bg-white hover:text-[#295E4F]"
                    >
                      <LogIn className="mr-2 h-4 w-4" /> Login
                    </Button>
                  </Link>
                </SheetClose>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          href="/"
          className="text-xl sm:text-2xl font-bold hover:opacity-90 flex-shrink-0"
        >
          KBHS
        </Link>

        {/* Desktop Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="hidden md:inline-flex ml-2">
            <Button
              variant="ghost"
              className="hover:bg-white/20 text-white text-base px-3"
            >
              Explore <Menu className="h-5 w-5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#20483c] text-white border-gray-600">
            <DropdownMenuLabel className="text-gray-300">
              More Sections
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/30" />
            {dropdownLinks.map((link) => (
              <DropdownMenuItem
                key={link.href}
                asChild
                className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
              >
                <Link href={link.href}>{link.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center Navigation (Desktop) */}
      <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-base lg:text-lg hover:underline underline-offset-4 decoration-2 decoration-white/50 hover:decoration-white transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right Side: Auth Actions */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <Skeleton className="h-10 w-24 bg-white/20 rounded-md" /> // Placeholder while loading
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-white/20 p-0" // Ensure size
                aria-label="User menu"
              >
                <Avatar className="h-9 w-9">
                  {" "}
                  {/* Slightly smaller avatar */}
                  <AvatarImage
                    src={session.user?.image ?? undefined} // Use undefined if null
                    alt={session.user?.name ?? "User"}
                  />
                  <AvatarFallback className="bg-sky-600 text-white">
                    {/* Display initials or User icon */}
                    {session.user?.name ? (
                      session.user.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white text-black mt-2" // Added margin-top
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/dashboard">
                  {" "}
                  {/* Correct link */}
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              {/* Add profile link later if needed */}
              {/* <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut} // Use the handler
                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              className="hover:text-white border-white hover:bg-white text-[#295E4F]"
            >
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
