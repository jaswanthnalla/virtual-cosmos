import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useVoiceChat(socket, chatRooms) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [activeVoicePeers, setActiveVoicePeers] = useState(new Set());
  const [micReady, setMicReady] = useState(false);

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const remoteAudiosRef = useRef(new Map());
  const pendingCallsRef = useRef(new Set());
  const chatRoomsRef = useRef(chatRooms);

  // Keep ref in sync
  useEffect(() => {
    chatRoomsRef.current = chatRooms;
  }, [chatRooms]);

  // ─── Get microphone stream ──────────────────────────────────
  const acquireMic = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      localStreamRef.current = stream;
      setIsMicOn(true);
      setMicReady(true);
      console.log('[Voice] Mic acquired');
      return stream;
    } catch (err) {
      console.error('[Voice] Mic access denied:', err.message);
      setIsMicOn(false);
      setMicReady(false);
      return null;
    }
  }, []);

  // ─── Toggle mic (mute/unmute track, don't destroy stream) ──
  const toggleMic = useCallback(() => {
    if (!localStreamRef.current) {
      acquireMic();
      return;
    }
    const tracks = localStreamRef.current.getAudioTracks();
    const newState = !isMicOn;
    tracks.forEach((t) => { t.enabled = newState; });
    setIsMicOn(newState);
    console.log('[Voice] Mic', newState ? 'unmuted' : 'muted');
  }, [isMicOn, acquireMic]);

  // ─── Toggle speaker ─────────────────────────────────────────
  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn((prev) => {
      const next = !prev;
      remoteAudiosRef.current.forEach((audio) => { audio.muted = !next; });
      console.log('[Voice] Speaker', next ? 'on' : 'off');
      return next;
    });
  }, []);

  // ─── Create peer connection ─────────────────────────────────
  const createPeerConnection = useCallback((peerId) => {
    if (!socket) return null;

    // Close existing
    const existing = peerConnectionsRef.current.get(peerId);
    if (existing) {
      existing.close();
      peerConnectionsRef.current.delete(peerId);
    }

    console.log('[Voice] Creating peer connection for', peerId);
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
      console.log('[Voice] Added local tracks to PC');
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log('[Voice] Received remote track from', peerId);
      const [remoteStream] = event.streams;

      let audio = remoteAudiosRef.current.get(peerId);
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        remoteAudiosRef.current.set(peerId, audio);
      }
      audio.muted = !isSpeakerOn;
      audio.srcObject = remoteStream;

      // Force play (some browsers need this)
      audio.play().catch((e) => console.warn('[Voice] Audio play blocked:', e.message));

      setActiveVoicePeers((prev) => new Set([...prev, peerId]));
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc:ice-candidate', {
          targetId: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[Voice] ICE state for', peerId, ':', pc.iceConnectionState);
      if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) {
        setActiveVoicePeers((prev) => {
          const next = new Set(prev);
          next.delete(peerId);
          return next;
        });
      }
    };

    peerConnectionsRef.current.set(peerId, pc);
    return pc;
  }, [socket, isSpeakerOn]);

  // ─── Call a peer (create offer) ─────────────────────────────
  const callPeer = useCallback(async (peerId) => {
    if (!socket || !localStreamRef.current) {
      console.log('[Voice] Cannot call - no mic stream, queueing', peerId);
      pendingCallsRef.current.add(peerId);
      return;
    }

    console.log('[Voice] Calling peer', peerId);
    const pc = createPeerConnection(peerId);
    if (!pc) return;

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
      });
      await pc.setLocalDescription(offer);
      socket.emit('webrtc:offer', { targetId: peerId, offer });
      console.log('[Voice] Sent offer to', peerId);
    } catch (err) {
      console.error('[Voice] Failed to create offer:', err);
    }
  }, [socket, createPeerConnection]);

  // ─── Process pending calls once mic is ready ────────────────
  useEffect(() => {
    if (!micReady || !localStreamRef.current) return;

    for (const peerId of pendingCallsRef.current) {
      console.log('[Voice] Processing pending call to', peerId);
      callPeer(peerId);
    }
    pendingCallsRef.current.clear();
  }, [micReady, callPeer]);

  // ─── Handle incoming WebRTC signals ─────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({ callerId, offer }) => {
      console.log('[Voice] Received offer from', callerId);

      // Acquire mic if needed
      let stream = localStreamRef.current;
      if (!stream) {
        stream = await acquireMic();
      }

      const pc = createPeerConnection(callerId);
      if (!pc) return;

      // If we just acquired the stream, re-add tracks
      if (stream && pc.getSenders().length === 0) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', { targetId: callerId, answer });
        console.log('[Voice] Sent answer to', callerId);
      } catch (err) {
        console.error('[Voice] Failed to handle offer:', err);
      }
    };

    const handleAnswer = async ({ answererId, answer }) => {
      console.log('[Voice] Received answer from', answererId);
      const pc = peerConnectionsRef.current.get(answererId);
      if (pc && pc.signalingState === 'have-local-offer') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('[Voice] Failed to set answer:', err);
        }
      }
    };

    const handleIceCandidate = async ({ senderId, candidate }) => {
      const pc = peerConnectionsRef.current.get(senderId);
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          // Ignore non-critical ICE errors
        }
      }
    };

    socket.on('webrtc:offer', handleOffer);
    socket.on('webrtc:answer', handleAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);

    return () => {
      socket.off('webrtc:offer', handleOffer);
      socket.off('webrtc:answer', handleAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
    };
  }, [socket, createPeerConnection, acquireMic]);

  // ─── Auto-call peers in proximity ───────────────────────────
  useEffect(() => {
    const activePeerIds = new Set();
    for (const [, room] of chatRooms) {
      activePeerIds.add(room.peerUserId);
    }

    // Call new peers
    for (const peerId of activePeerIds) {
      if (!peerConnectionsRef.current.has(peerId)) {
        callPeer(peerId);
      }
    }

    // Disconnect peers no longer in proximity
    for (const [peerId, pc] of peerConnectionsRef.current) {
      if (!activePeerIds.has(peerId)) {
        console.log('[Voice] Disconnecting from', peerId);
        pc.close();
        peerConnectionsRef.current.delete(peerId);
        const audio = remoteAudiosRef.current.get(peerId);
        if (audio) {
          audio.srcObject = null;
          remoteAudiosRef.current.delete(peerId);
        }
        setActiveVoicePeers((prev) => {
          const next = new Set(prev);
          next.delete(peerId);
          return next;
        });
      }
    }
  }, [chatRooms, callPeer]);

  // ─── Acquire mic on mount ───────────────────────────────────
  useEffect(() => {
    acquireMic();
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      remoteAudiosRef.current.forEach((audio) => { audio.srcObject = null; });
      remoteAudiosRef.current.clear();
    };
  }, [acquireMic]);

  return {
    isMicOn,
    isSpeakerOn,
    activeVoicePeers,
    toggleMic,
    toggleSpeaker,
    micReady,
  };
}
