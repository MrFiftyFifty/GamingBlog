import { UserProfileView } from "@/components/user/UserProfileView";
import { getUsernameParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getUsernameParams();
}

export default function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  return <UserProfileView username={params.username} />;
}
