import "@/styles/globals.css";
import { Inter } from "next/font/google";

import { type Metadata } from "next";

import { ThemeProvider } from "@/Providers/Theme-Provider";
import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Heardly",
  description: "Easily Close Deals with Customers using Heardly",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider signInForceRedirectUrl="/callback" signUpForceRedirectUrl="/callback">
      <html lang="en" className={`${inter.className} antialiased`} suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
