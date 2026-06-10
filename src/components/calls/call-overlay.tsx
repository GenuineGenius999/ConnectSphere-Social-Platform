"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, MonitorUp, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { buildCallRoomId, ICE_SERVERS } from "@/lib/calls";
import { toast } from "sonner";

type CallPeer = {
  id: string;
  name: string;
  username: string;
  avatar: string;
};

type CallOverlayProps = {
  currentUserId: string;
  peer: CallPeer;
  mode: "voice" | "video";
  incoming?: boolean;
  incomingOffer?: string;
  onClose: () => void;
};

async function sendSignal(
  roomId: string,
  toUserId: string,
  signalType: string,
  payload: unknown
) {
  await fetch("/api/calls/signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roomId,
      toUserId,
      signalType,
      payload: JSON.stringify(payload),
    }),
  });
}

export function CallOverlay({
  currentUserId,
  peer,
  mode,
  incoming = false,
  incomingOffer,
  onClose,
}: CallOverlayProps) {
  const roomId = buildCallRoomId(currentUserId, peer.id);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pollSinceRef = useRef(new Date().toISOString());
  const isInitiator = !incoming;

  const [status, setStatus] = useState(incoming ? "incoming" : "connecting");
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(mode === "voice");
  const [screenSharing, setScreenSharing] = useState(false);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    sendSignal(roomId, peer.id, "hangup", {}).catch(() => null);
  }, [roomId, peer.id]);

  useEffect(() => {
    let cancelled = false;

    const setupPeer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: mode === "video",
        });
        if (cancelled) return;

        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (ev) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = ev.streams[0];
          }
          setStatus("connected");
        };

        pc.onicecandidate = (ev) => {
          if (ev.candidate) {
            sendSignal(roomId, peer.id, "ice", ev.candidate.toJSON()).catch(() => null);
          }
        };

        if (isInitiator) {
          await sendSignal(roomId, peer.id, "ring", { mode });
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendSignal(roomId, peer.id, "offer", offer);
          setStatus("ringing");
        } else if (incomingOffer) {
          const offer = JSON.parse(incomingOffer);
          await pc.setRemoteDescription(offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal(roomId, peer.id, "answer", answer);
          setStatus("connecting");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not access camera/microphone");
        onClose();
      }
    };

    setupPeer();

    const poll = setInterval(async () => {
      if (!pcRef.current) return;
      try {
        const res = await fetch(`/api/calls/signal?since=${encodeURIComponent(pollSinceRef.current)}`);
        const data = await res.json();
        pollSinceRef.current = new Date().toISOString();

        for (const sig of data.signals ?? []) {
          if (sig.fromUserId !== peer.id || sig.roomId !== roomId) continue;
          const payload = JSON.parse(sig.payload);

          if (sig.signalType === "answer" && pcRef.current.signalingState !== "stable") {
            await pcRef.current.setRemoteDescription(payload);
            setStatus("connected");
          }
          if (sig.signalType === "offer" && !isInitiator) {
            await pcRef.current.setRemoteDescription(payload);
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            await sendSignal(roomId, peer.id, "answer", answer);
          }
          if (sig.signalType === "ice" && payload) {
            await pcRef.current.addIceCandidate(payload).catch(() => null);
          }
          if (sig.signalType === "hangup") {
            toast.info("Call ended");
            onClose();
          }
        }
      } catch {
        // ignore poll errors
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(poll);
      cleanup();
    };
  }, [cleanup, incomingOffer, isInitiator, mode, onClose, peer.id, roomId]);

  const toggleMute = () => {
    const audio = localStreamRef.current?.getAudioTracks()[0];
    if (audio) {
      audio.enabled = !audio.enabled;
      setMuted(!audio.enabled);
    }
  };

  const toggleVideo = () => {
    const video = localStreamRef.current?.getVideoTracks()[0];
    if (video) {
      video.enabled = !video.enabled;
      setVideoOff(!video.enabled);
    }
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setScreenSharing(true);
      screenTrack.onended = () => setScreenSharing(false);
      toast.success("Screen sharing started");
    } catch {
      toast.error("Screen share cancelled or denied");
    }
  };

  const hangUp = () => {
    cleanup();
    onClose();
  };

  if (status === "incoming") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-card rounded-2xl p-8 max-w-sm w-full text-center space-y-4 border border-border/60">
          <UserAvatar src={peer.avatar} alt={peer.name} size="xl" />
          <div>
            <p className="text-lg font-bold">{peer.name}</p>
            <p className="text-sm text-muted-foreground">Incoming {mode} call...</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="destructive" size="lg" className="rounded-full" onClick={hangUp}>
              <PhoneOff className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className="rounded-full"
              onClick={() => {
                setStatus("connecting");
                // offer handled in useEffect via incomingOffer
              }}
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {!videoOff && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-24 right-4 w-40 h-28 rounded-xl object-cover border-2 border-white/30 shadow-lg"
          />
        )}
        <div className="absolute top-4 left-4 flex items-center gap-3 text-white">
          <UserAvatar src={peer.avatar} alt={peer.name} size="sm" />
          <div>
            <p className="font-semibold">{peer.name}</p>
            <p className="text-xs text-white/70 capitalize">{status}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 p-6 bg-black/60">
        <Button variant="secondary" size="icon" className="rounded-full h-12 w-12" onClick={toggleMute}>
          {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        {mode === "video" && (
          <Button variant="secondary" size="icon" className="rounded-full h-12 w-12" onClick={toggleVideo}>
            {videoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
        )}
        {mode === "video" && (
          <Button
            variant={screenSharing ? "default" : "secondary"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={shareScreen}
            title="Share screen"
          >
            <MonitorUp className="h-5 w-5" />
          </Button>
        )}
        <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={hangUp}>
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
