import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedTrace — Hospital AI Compliance Platform",
  description:
    "IBM Bob traces every patient data flow and every AI decision in your hospital — so you're always audit-ready. EU AI Act Article 50 compliant. NABH-aligned.",
  keywords: "clinical AI, hospital compliance, EU AI Act, NABH, patient safety, IBM Bob",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
