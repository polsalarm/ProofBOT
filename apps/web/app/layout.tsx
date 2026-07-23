import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "ProofBOT — Hash it. Stamp it. Verify it.",
    template: "%s — ProofBOT",
  },
  description: "Timestamp hashes of AI assets on BOT Chain without uploading the original content.",
  applicationName: "ProofBOT",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a1221",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppHeader />
          <main>{children}</main>
          <AppFooter />
        </Providers>
      </body>
    </html>
  );
}
