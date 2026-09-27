import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedTrace — AI Developer Orchestration for Hospital Software | IBM Bob 2.0",
  description:
    "Autonomous developer platform orchestrating 5 specialist AI agents to diagnose, fix, test, and safely release clinical software with verified HIPAA, FHIR, and NABH safety compliance.",
  keywords: "hospital software, developer workflow, AI code triage, automated testing, HIPAA compliance, IBM Bob 2.0, healthcare engineering",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
