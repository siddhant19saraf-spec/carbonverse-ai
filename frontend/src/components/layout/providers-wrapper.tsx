"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/providers/AuthProvider";

interface ProvidersWrapperProps {
  children: React.ReactNode;
}

export function ProvidersWrapper({ children }: ProvidersWrapperProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
