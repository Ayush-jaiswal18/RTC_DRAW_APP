import { AuthPage } from "@/components/AuthPage";

export default async function Signin({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const { redirect } = await searchParams;
  return <AuthPage isSignin redirect={redirect} />;
}
