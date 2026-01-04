import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CreateRoomClient from "./CreateRoomClient";

export default async function CreateRoomPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/signin");
  }

  return <CreateRoomClient />;
}
