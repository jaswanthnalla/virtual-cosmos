export default function TopToolbar({
  username,
  playerCount,
  onToggleFullscreen,
  isMicOn,
  isSpeakerOn,
  onToggleMic,
  onToggleSpeaker,
  voicePeerCount,
}) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 h-12 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      {/* Left: Space name */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <span className="font-semibold text-gray-800 text-sm">Space</span>
      </div>

      {/* Center: Audio Controls */}
      <div className="flex items-center gap-2">
        {/* Mic toggle */}
        <button
          onClick={onToggleMic}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors relative ${
            isMicOn
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              : 'bg-red-100 hover:bg-red-200 text-red-500'
          }`}
          title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .21-.02.42-.05.63" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
          )}
          {isMicOn && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
          )}
        </button>

        {/* Speaker toggle */}
        <button
          onClick={onToggleSpeaker}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isSpeakerOn
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              : 'bg-red-100 hover:bg-red-200 text-red-500'
          }`}
          title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
        >
          {isSpeakerOn ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

      </div>

      {/* Right: Fullscreen */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleFullscreen}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          title="Fullscreen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
