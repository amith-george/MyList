// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StartupLoader from "@/components/LoaderClient"; // adjust if in different directory

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyList",
  description: "Track and discover movies and TV shows with MyList",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo3.svg" type="image/svg+xml" />
      </head>
      <body
        className={`bg-gray-300 text-foreground ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StartupLoader>{children}</StartupLoader>
      </body>
    </html>
  );
}
