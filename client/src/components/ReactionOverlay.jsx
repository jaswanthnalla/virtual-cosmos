import { useEffect, useState } from 'react';

export default function ReactionOverlay({ reactions, currentUserId, players }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-25">
      {reactions.map((reaction) => {
        const isSelf = reaction.userId === currentUserId;
        const player = players.get(reaction.userId);
        const name = isSelf ? 'You' : player?.username || 'Someone';

        return (
          <FloatingReaction
            key={reaction.id}
            emoji={reaction.emoji}
            name={name}
          />
        );
      })}
    </div>
  );
}

function FloatingReaction({ emoji, name }) {
  const [style, setStyle] = useState({
    opacity: 0,
    transform: 'translateY(0px) scale(0.5)',
  });

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => {
      setStyle({
        opacity: 1,
        transform: 'translateY(-30px) scale(1)',
        transition: 'all 0.3s ease-out',
      });
    });

    // Animate out
    const timer = setTimeout(() => {
      setStyle({
        opacity: 0,
        transform: 'translateY(-80px) scale(0.8)',
        transition: 'all 0.8s ease-in',
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed left-1/2 top-16 -translate-x-1/2 flex flex-col items-center gap-1"
      style={style}
    >
      <span className="text-4xl">{emoji}</span>
      <span className="text-xs font-medium text-gray-600 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm">
        {name}
      </span>
    </div>
  );
}
