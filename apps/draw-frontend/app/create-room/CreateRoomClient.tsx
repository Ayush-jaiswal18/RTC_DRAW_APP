"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@repo/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@repo/ui/card";
import { Loader2, Link as LinkIcon, Copy, Clock3, RefreshCw } from "lucide-react";

import { HTTP_BACKEND } from "@/config";

interface UserRoom {
  id: number;
  slug: string;
  createAt: string;
}

function makeSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base || "room"}-${rand}`;
}

export default function CreateRoomClient() {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [createdRoomUrl, setCreatedRoomUrl] = useState<string | null>(null);
  const [userRooms, setUserRooms] = useState<UserRoom[]>([]);
  const router = useRouter();

  const loadUserRooms = async () => {
    try {
      setLoadingRooms(true);
      setFetchError("");
      const res = await axios.get(`${HTTP_BACKEND}/rooms`, { withCredentials: true });
      setUserRooms(res.data.rooms || []);
    } catch (err: any) {
      setUserRooms([]);
      setFetchError(
        err?.response?.data?.message || err?.message || "Unable to load your rooms."
      );
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadUserRooms();
  }, []);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError("Please enter a room name.");
      return;
    }

    if (roomName.length < 3 || roomName.length > 40) {
      setError("Room name must be between 3 and 40 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Optional: generate a suggested slug to send as name if user prefers
      const suggested = makeSlug(roomName);

      const res = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: suggested },
        { withCredentials: true }
      );

      const roomId = res.data.roomId || res.data.id;
      const url = `${window.location.origin}/canvas/${roomId}`;
      setCreatedRoomId(roomId);
      setCreatedRoomUrl(url);
      await loadUserRooms();

      // store auth flag (keeps navbar in sync)
      try {
        window.localStorage.setItem("isAuthenticated", "true");
        window.dispatchEvent(new Event("auth:change"));
      } catch {}

      // Do not auto-redirect to the canvas; user will click "Open room" to navigate.
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

  const handleCopy = async () => {
    if (!createdRoomUrl) return;
    try {
      await navigator.clipboard.writeText(createdRoomUrl);
      // small UI feedback could be added
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_55%)] px-4 py-10 flex items-center justify-center">
      <Card className="w-full max-w-2xl border border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-200/70 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <LinkIcon className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">Create a room</CardTitle>
          <p className="mt-2 text-sm text-slate-500">Invite teammates by sharing the room link after creation.</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); handleCreateRoom(); }} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="room" className="text-sm font-medium text-slate-700">Room name</label>
              <input
                id="room"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                placeholder="E.g. Sprint planning, UX sketch"
                disabled={!!createdRoomId || loading}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={loading || !!createdRoomId}
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </span>
                ) : createdRoomId ? (
                  "Created"
                ) : (
                  "Create room"
                )}
              </Button>

              {createdRoomUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <input readOnly value={createdRoomUrl} className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                  <Button variant="outline" onClick={handleCopy} className="h-11 rounded-xl">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </form>

          {createdRoomUrl && (
            <div className="text-center">
              <Button onClick={() => router.push(`/canvas/${createdRoomId}`)} className="h-10 rounded-xl">
                Open room
              </Button>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Your recent rooms</p>
                <p className="text-xs text-slate-500">Jump back into any room you created before.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => loadUserRooms()}
                className="h-8 rounded-lg px-3 text-xs"
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>

            {loadingRooms ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading rooms…
              </div>
            ) : fetchError ? (
              <p className="text-sm text-red-500">{fetchError}</p>
            ) : userRooms.length === 0 ? (
              <p className="text-sm text-slate-500">You haven’t created any rooms yet.</p>
            ) : (
              <div className="space-y-2">
                {userRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => router.push(`/canvas/${room.id}`)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{room.slug.replace(/-/g, " ")}</p>
                      <p className="text-xs text-slate-500">Open this room again</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(room.createAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
