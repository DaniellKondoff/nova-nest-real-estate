import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { env } from "@/lib/env";

/**
 * Public site shell – fully server-rendered header and footer.
 * Admin routes live outside this group and get no public chrome.
 */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      {env.NEXT_PUBLIC_CHAT_ENABLED !== "false" && <ChatLauncher />}
    </div>
  );
}
