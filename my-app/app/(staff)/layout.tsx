import GourmetHubSidebar from "@/components/staff/gourmethub-sidebar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <GourmetHubSidebar />
      <main className="flex-1 pt-16 lg:ml-64 lg:pt-0">{children}</main>
    </div>
  );
}
