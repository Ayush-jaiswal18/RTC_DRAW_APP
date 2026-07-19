import { cookies } from "next/headers";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("token");

  return <NavbarClient initialIsAuthenticated={isAuthenticated} />;
}
