import { getSession } from "@/lib/session";
import { getPublicBusinesses } from "@/lib/queries/businesses";
import UserShell from "@/components/user/UserShell";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const allBusinesses = await getPublicBusinesses();

  return (
    <UserShell session={session} allBusinesses={allBusinesses}>
      {children}
    </UserShell>
  );
}
