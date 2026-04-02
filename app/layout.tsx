import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ordinexa Proposals | Proposal Operations Platform",
    template: "%s | Ordinexa Proposals",
  },
  description: "Create professional proposals with AI-powered estimation, budget planning, and polished deliverables.",
  openGraph: {
    type: "website",
    siteName: "Ordinexa Proposals",
    title: "Ordinexa Proposals | Proposal Operations Platform",
    description: "Create professional proposals with AI-powered estimation, budget planning, and polished deliverables.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ordinexa Proposals | Proposal Operations Platform",
    description: "Create professional proposals with AI-powered estimation, budget planning, and polished deliverables.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--color-canvas)] text-[var(--color-text-primary)] font-sans">
        {children}
      </body>
    </html>
  );
}
