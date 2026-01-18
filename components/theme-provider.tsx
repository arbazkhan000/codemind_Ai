"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// We import the specific type for the props here
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
