import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useMovement } from '../hooks/useMovement';
import { useProximity } from '../hooks/useProximity';
import { useVoiceChat } from '../hooks/useVoiceChat';
import Canvas from './Canvas';
import ChatPanel from './ChatPanel';
import TopToolbar from './TopToolbar';
import BottomToolbar from './BottomToolbar';
import ReactionOverlay from './ReactionOverlay';
import ErrorBoundary from './ErrorBoundary';

export default function GameView({ username }) {
  const {
    socket,
    currentUser,
    setCurrentUser,
    players,
    chatRooms,
    reactions,
    joinGame,
    movePlayer,
    sendMessage,
    sendReaction,
    toggleHand,
  } = useSocket();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  const {
    isMicOn,
    isSpeakerOn,
    activeVoicePeers,
    toggleMic,
    toggleSpeaker,
  } = useVoiceChat(socket, chatRooms);

  useMovement(currentUser, setCurrentUser, movePlayer);
  useProximity(currentUser, players);

  useEffect(() => {
    joinGame(username);
  }, [username, joinGame]);

  // Auto-open chat when a connection is made
  useEffect(() => {
    if (chatRooms.size > 0) {
      setIsChatOpen(true);
    }
  }, [chatRooms.size]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleToggleHand = useCallback(
    (raised) => {
      setIsHandRaised(raised);
      toggleHand(raised);
    },
    [toggleHand]
  );

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-gray-500 animate-pulse text-sm font-medium">Entering space...</div>
      </div>
    );
  }

  const playerCount = players.size + 1;

  return (
    <div className="h-screen w-screen overflow-hidden">
      <TopToolbar
        username={currentUser.username}
        playerCount={playerCount}
        onToggleFullscreen={toggleFullscreen}
        isMicOn={isMicOn}
        isSpeakerOn={isSpeakerOn}
        onToggleMic={toggleMic}
        onToggleSpeaker={toggleSpeaker}
        voicePeerCount={activeVoicePeers.size}
      />

      {/* Position overlay */}
      <div className="fixed top-14 left-3 z-20 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
        <p className="text-xs font-semibold text-gray-800">{currentUser.username}</p>
        <p className="text-[11px] text-gray-500 font-mono">
          x: {Math.round(currentUser.x)}, y: {Math.round(currentUser.y)}
        </p>
      </div>

      <ErrorBoundary>
        <Canvas
          currentUser={currentUser}
          players={players}
          chatRooms={chatRooms}
          reactions={reactions}
          isHandRaised={isHandRaised}
        />
      </ErrorBoundary>

      <ReactionOverlay
        reactions={reactions}
        currentUserId={socket?.id}
        players={players}
      />

      <ChatPanel
        chatRooms={chatRooms}
        currentUserId={socket?.id}
        onSendMessage={sendMessage}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <BottomToolbar
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        connectionCount={chatRooms.size}
        onSendReaction={sendReaction}
        onToggleHand={handleToggleHand}
        isHandRaised={isHandRaised}
      />
    </div>
  );
}
