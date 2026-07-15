import Sidebar from "@/components/SuperAdmin/Sidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      <Sidebar />

      <main className="flex-1 bg-[#fafafa]">

        {children}

      </main>

    </div>
  );
}