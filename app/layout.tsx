import "./globals.css";
import { getContent } from "@/lib/content";
export async function generateMetadata() { const s = (await getContent()).settings;
  return { title: s.siteTitle, description: s.metaDesc, openGraph: { title: s.siteTitle, description: s.metaDesc, type: "website" } }; }
export default function L({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
