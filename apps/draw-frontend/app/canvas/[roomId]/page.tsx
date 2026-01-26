import { RoomCanvas } from "@/components/RoomCanvas";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Canvas({ params }: {
    params: {
        roomId: string
    }
}) {
    const roomId = (await params).roomId;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect(`/signin?redirect=/canvas/${roomId}`);
    }

    return <RoomCanvas roomId={roomId} token={token} />
}