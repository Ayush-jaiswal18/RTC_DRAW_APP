"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";

import { HTTP_BACKEND } from "@/config";

export default function CreateRoomClient() {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError("Room name is required");
      return;
    }

    if (roomName.length < 3 || roomName.length > 20) {
      setError("Room name must be between 3 and 20 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: roomName },
        { withCredentials: true }
      );

      router.push(`/canvas/${res.data.roomId}`);
    } catch (err: any) {
      if (err.response?.status === 409) {
          setError("Room with this name already exists");
      } else {
          setError("Failed to create room. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6 space-y-5">
        <h1 className="text-2xl font-bold text-center">Create a Room</h1>

        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="Room name"
        />

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Button onClick={handleCreateRoom} disabled={loading}>
          {loading ? "Creating..." : "Create Room"}
        </Button>
      </Card>
    </div>
  );
}
