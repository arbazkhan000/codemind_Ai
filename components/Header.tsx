"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, History, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";

export const Header = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
      <header className="h-14 border-b bg-card sticky top-0 z-50">
          <div className="flex h-full items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2">
                  <Code2 />
                  <span className="font-semibold">CodeMind AI</span>
              </Link>

              <nav className="flex items-center gap-2">
                  <Button
                      asChild
                      variant={pathname === "/" ? "secondary" : "ghost"}
                  >
                      <Link href="/">Editor</Link>
                  </Button>

                  <Button
                      asChild
                      variant={pathname === "/history" ? "secondary" : "ghost"}
                  >
                      <Link href="/history">History</Link>
                  </Button>


                  {/* Theme toggle */}
                  <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                      }
                  >
                      {theme === "dark" ? <Sun /> : <Moon />}
                  </Button>
              </nav>
          </div>
      </header>
  );
};
