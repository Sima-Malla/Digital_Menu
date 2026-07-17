import Sidebar from "@/components/SuperAdmin/Sidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />

      <main className="lg:ml-64 bg-[#fafafa] min-h-screen">
        {children}
      </main>
    </div>
  );
}