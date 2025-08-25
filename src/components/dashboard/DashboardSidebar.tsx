"use client"

import type React from "react"

import { useState, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserRole } from "@/types" // Import from types file instead of database model
import { isFeatureEnabled } from "@/lib/feature-flags"
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  BarChart2,
  Settings,
  Menu,
  X,
  School,
  FileText,
  UserCheck,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
  disabled?: boolean
}

const NavItem = ({ href, icon: Icon, label, active, onClick, disabled }: NavItemProps) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
      active ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50" : "text-gray-500 dark:text-gray-400",
      disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-gray-100 dark:hover:bg-gray-800",
    )}
    onClick={onClick}
    aria-disabled={disabled}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
    {disabled && <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">Soon</span>}
  </Link>
)

interface NavGroupProps {
  label: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}

const NavGroup = ({ label, icon: Icon, children, defaultOpen = false }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && <div className="pl-6 space-y-1">{children}</div>}
    </div>
  )
}

// Create a client component that uses pathname
function DashboardSidebarContent({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Define navigation items based on user role
  const canAccessStudents = [UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER].includes(userRole)
  const canAccessTeachers = [UserRole.ADMIN, UserRole.STAFF].includes(userRole)
  const canAccessFinance = [UserRole.ADMIN, UserRole.STAFF].includes(userRole)
  const isAdmin = userRole === UserRole.ADMIN

  // Check feature flags
  const isFeesEnabled = isFeatureEnabled("FEES_MANAGEMENT")
  const isCalendarEnabled = isFeatureEnabled("CALENDAR")
  const isReportsEnabled = isFeatureEnabled("REPORTS")

  const closeMobileMenu = () => {
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out dark:bg-gray-800 md:relative md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile Close Button */}
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 md:hidden" onClick={closeMobileMenu}>
          <X className="h-6 w-6" />
          <span className="sr-only">Close Menu</span>
        </Button>

        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-[#295E4F]">
            KBHS Admin
          </Link>
        </div>

        {/* Navigation */}
        <div className="space-y-4 py-4 px-3 overflow-y-auto">
          <NavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            active={pathname === "/dashboard"}
            onClick={closeMobileMenu}
          />

          {canAccessStudents && (
            <NavGroup label="Students" icon={Users} defaultOpen={pathname.includes("/dashboard/students")}>
              <NavItem
                href="/dashboard/students"
                icon={Users}
                label="All Students"
                active={pathname === "/dashboard/students"}
                onClick={closeMobileMenu}
              />
              <NavItem
                href="/dashboard/students/new"
                icon={Users}
                label="Add Student"
                active={pathname === "/dashboard/students/new"}
                onClick={closeMobileMenu}
              />
              <NavItem
                href="/dashboard/attendance"
                icon={UserCheck}
                label="Attendance"
                active={pathname.includes("/dashboard/attendance")}
                onClick={closeMobileMenu}
              />
            </NavGroup>
          )}

          {canAccessTeachers && (
            <NavGroup label="Teachers" icon={GraduationCap} defaultOpen={pathname.includes("/dashboard/teachers")}>
              <NavItem
                href="/dashboard/teachers"
                icon={GraduationCap}
                label="All Teachers"
                active={pathname === "/dashboard/teachers"}
                onClick={closeMobileMenu}
              />
              <NavItem
                href="/dashboard/teachers/new"
                icon={GraduationCap}
                label="Add Teacher"
                active={pathname === "/dashboard/teachers/new"}
                onClick={closeMobileMenu}
              />
            </NavGroup>
          )}

          <NavGroup label="Academics" icon={BookOpen} defaultOpen={pathname.includes("/dashboard/academics")}>
            <NavItem
              href="/dashboard/courses"
              icon={BookOpen}
              label="Courses"
              active={pathname.includes("/dashboard/courses")}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/dashboard/classes"
              icon={School}
              label="Classes"
              active={pathname.includes("/dashboard/classes")}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/dashboard/exams"
              icon={FileText}
              label="Exams"
              active={pathname.includes("/dashboard/exams")}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/dashboard/grades"
              icon={ClipboardList}
              label="Grades"
              active={pathname.includes("/dashboard/grades")}
              onClick={closeMobileMenu}
            />
          </NavGroup>

          {canAccessFinance && (
            <NavItem
              href="/dashboard/fees"
              icon={DollarSign}
              label="Fee Management"
              active={pathname.includes("/dashboard/fees")}
              onClick={closeMobileMenu}
              disabled={!isFeesEnabled}
            />
          )}

          <NavItem
            href="/dashboard/calendar"
            icon={Calendar}
            label="Calendar"
            active={pathname.includes("/dashboard/calendar")}
            onClick={closeMobileMenu}
            disabled={!isCalendarEnabled}
          />

          <NavItem
            href="/dashboard/reports"
            icon={BarChart2}
            label="Reports"
            active={pathname.includes("/dashboard/reports")}
            onClick={closeMobileMenu}
            disabled={!isReportsEnabled}
          />

          {isAdmin && (
            <NavItem
              href="/dashboard/settings"
              icon={Settings}
              label="Settings"
              active={pathname.includes("/dashboard/settings")}
              onClick={closeMobileMenu}
            />
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={closeMobileMenu} />}
    </>
  )
}

// Main component with Suspense
export default function DashboardSidebar({ userRole }: { userRole: UserRole }) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg dark:bg-gray-800 md:relative">
          <div className="flex h-16 items-center border-b px-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      }
    >
      <DashboardSidebarContent userRole={userRole} />
    </Suspense>
  )
}
