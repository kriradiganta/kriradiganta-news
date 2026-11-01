import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"ক্রীড়াদিগন্ত | KRIRADIGANTA", description:"তৃণমূল থেকে জাতীয় ক্রীড়াঙ্গন — বাংলাদেশের স্পোর্টস নিউজ ও মাল্টিমিডিয়া" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="bn"><body>{children}</body></html>; }
