'use client';

import { Sparkles } from 'lucide-react';

interface GameBoardProps {
  gameState: boolean[];
  treasureAmount: bigint;
  selectedIndex: number | null;
  onCellSelect: (col: number, row: number, index: number, isDug: boolean) => void;
}

export const GameBoard = ({ gameState, treasureAmount, selectedIndex, onCellSelect }: GameBoardProps) => {
  const handleCellClick = (index: number, isDug: boolean) => {
    if (isDug) return;
    const col = index % 32;
    const row = Math.floor(index / 32);
    onCellSelect(col, row, index, isDug);
  };

  return (
    <div className="w-full p-0 space-y-6 text-white font-sans bg-gradient-to-br from-black via-gray-900 to-black h-screen flex flex-col items-stretch justify-center">
      {/* Treasure amount */}
      <div className="bg-yellow-500/10 border border-yellow-400 shadow-lg shadow-yellow-400/20 rounded-2xl px-2 py-1 text-xl font-bold text-yellow-300 text-center animate-pulse backdrop-blur-sm">
        💰 Tesoro: {(Number(treasureAmount) * 0.75 / 1e18).toFixed(2)} ORO
      </div>
      <div className="overflow-scroll w-full aspect-square max-w-full rounded-lg shadow-inner bg-white">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: 'repeat(32, 24px)',
            gridAutoRows: '24px',
            width: 'max-content',
            height: 'max-content',
          }}
        >
          {gameState.length === 1024 &&
            gameState.map((isDug, index) => (
              <div
                key={index}
                className={`
                  relative w-full h-full bg-[url(/Sprites/grass.png)] bg-cover bg-center
                  ${isDug ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{ aspectRatio: '1/1' }}
                title={`Celda ${index % 32},${Math.floor(index / 32)}: ${isDug ? 'Excavada' : 'No excavada'}`}
                onClick={() => handleCellClick(index, isDug)}
              >
                {isDug && (
                  <div className="absolute inset-0 bg-[url(/Sprites/dirt.png)] bg-cover bg-center" />
                )}
                {!isDug && index === selectedIndex && (
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                )}
                {!isDug && (
                  <div className="absolute inset-0 transition-colors duration-200 ease-in-out hover:bg-green-600/50" />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};