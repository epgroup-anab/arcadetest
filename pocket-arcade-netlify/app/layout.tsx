import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
const display = Fredoka({ variable: "--font-display", subsets: ["latin"] });
const body = Nunito({ variable: "--font-body", subsets: ["latin"] });
export const metadata: Metadata = { title: "Pocket Arcade", description: "Eight colourful games. One tiny arcade. Play instantly in your browser.", other: { "codex-preview": "development" } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, themeColor: "#fff5df" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body className={`${display.variable} ${body.variable}`}>{children}</body></html> }
