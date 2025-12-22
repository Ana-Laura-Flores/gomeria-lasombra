import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BotoomNav";

export default function MainLayout({ children }) {
  return (
    <div className="flex bg-gray-900 text-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 pb-20 md:pb-4">{children}</main>
       <BottomNav />
    </div>
  );
}
