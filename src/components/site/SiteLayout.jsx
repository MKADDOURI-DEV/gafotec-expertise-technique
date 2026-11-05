import { Outlet, useRouterState } from "@tanstack/react-router";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

export default function SiteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className={isHome ? "flex-1" : "flex-1 pt-[68px] lg:pt-[80px]"}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}