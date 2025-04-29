"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, Upload, Settings, Menu } from "lucide-react"

const routes = [
  {
    href: "/playground",
    label: "Playground",
    icon: FileText,
    description: "Interactive resume analysis",
  },
  {
    href: "/bulk",
    label: "Bulk Analysis",
    icon: Upload,
    description: "Process multiple resumes",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "Configure application settings",
  },
]

export function NavigationBar() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center space-x-2">
          <Link 
            href="/" 
            className="flex items-center space-x-2"
          >
            <FileText className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Resume Analyzer
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden md:flex items-center space-x-2">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "default" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link
                  href={route.href}
                  className="flex items-center space-x-2"
                >
                  <route.icon className="h-4 w-4" />
                  <span>{route.label}</span>
                </Link>
              </Button>
            ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-9 p-0 md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {routes.map((route) => (
                <DropdownMenuItem key={route.href} asChild>
                  <Link
                    href={route.href}
                    className="flex items-center space-x-2"
                  >
                    <route.icon className="h-4 w-4" />
                    <span>{route.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
