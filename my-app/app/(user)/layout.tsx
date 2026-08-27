import { getSession } from "@/lib/session";
import UserShell from "@/components/user/UserShell";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return <UserShell session={session}>{children}</UserShell>;
}
