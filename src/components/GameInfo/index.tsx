import React from 'react';

interface GameInfoProps {
  round: bigint;
  lastWinner: string;
  lastWinTimestamp: bigint;
  formatAddress: (addr: string) => string;
  formatTimestamp: (timestamp: bigint) => string;
}

export const GameInfo: React.FC<GameInfoProps> = ({ round, lastWinner, lastWinTimestamp, formatAddress, formatTimestamp }) => (
  <div className="space-y-2 text-base sm:text-lg mt-4 pb-2">
    <div className="flex items-center gap-2">
      <span className="text-cyan-400">🏆</span>
      <span>
        <strong>Ronda:</strong> {round.toString()}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-yellow-400">🥇</span>
      <span>
        <strong>Últ. ganador:</strong> {lastWinner ? formatAddress(lastWinner) : 'Ninguno'}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-pink-400">📅</span>
      <span>
        <strong>Últ. hallazgo:</strong> {lastWinTimestamp > BigInt(0) ? formatTimestamp(lastWinTimestamp) : 'Nunca'}
      </span>
    </div>
  </div>
);
