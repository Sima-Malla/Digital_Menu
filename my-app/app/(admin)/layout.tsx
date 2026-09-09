
import Sidebar from "@/components/HotelAdmin/Sidebar";
import TopBar from "@/components/admin/TopBar";
import { getSidebarBusinessAction } from "@/app/actions/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getSidebarBusinessAction();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopBar businessName={business?.businessName ?? "Your Business"} />
        {children}
      </div>
    </div>
  );
}
