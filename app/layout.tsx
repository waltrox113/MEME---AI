import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meme AI",
  description: "Give it a picture. Get a meme."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}