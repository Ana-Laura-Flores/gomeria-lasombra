import SidebarDesktop from "../components/Sidebar";
import BottomNav from "../components/BotoomNav";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <SidebarDesktop />

      <main className="flex-1 p-4 pb-20 md:pb-4">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
