"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

interface ConditionalWrapperProps {
  children: React.ReactNode;
}

export default function ConditionalWrapper({ children }: ConditionalWrapperProps) {
  const pathname = usePathname();
  
  // Don't show header and footer on admin pages
  const isAdminPage = pathname?.startsWith("/admin") ?? false;
  
  if (isAdminPage) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Header />
      <main className="flex-1" role="main">
        {children}
      </main>
      <Footer />
    </>
  );
}
