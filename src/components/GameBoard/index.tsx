'use client';

import TreasureHuntABI from '@/abi/TreasureHunt_ABI.json';
import { MiniKit } from '@worldcoin/minikit-js';
import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { useSession } from 'next-auth/react';
import { Sparkles, Trophy, Calendar } from 'lucide-react';
import { GameInfo } from '../GameInfo';
 
interface GameState {
  round: bigint;
  treasureAmount: bigint;
  lastWinner: string;
  lastWinTimestamp: bigint;
  bitmap: [string, string, string, string];
}

export const GameBoard = ({ onCellSelect, onGameInfo }: { onCellSelect: (col: number, row: number) => void, onGameInfo: (round: bigint, lastWinner: string, lastWinTimestamp: bigint) => void }) => {
  const contractAddress = '0xe2b81493d6c26e705bc4193a87673db07810f376';
  const [gameState, setGameState] = useState<boolean[]>([]);
  const [round, setRound] = useState<bigint>(BigInt(0));
  const [treasureAmount, setTreasureAmount] = useState<bigint>(BigInt(0));
  const [lastWinner, setLastWinner] = useState<string>('');
  const [lastWinTimestamp, setLastWinTimestamp] = useState<bigint>(BigInt(0));

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data: session, status } = useSession();

  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
  });

  const fetchGameState = async () => {
    if (status !== 'authenticated' || !session?.user?.username) return;

    try {
      const user = await MiniKit.getUserByUsername(session.user.username);
      const address = user.walletAddress;

      const result = await client.readContract({
        address: contractAddress,
        abi: TreasureHuntABI,
        functionName: 'getGameState',
      }) as GameState;

      setRound(result.round);
      setTreasureAmount(result.treasureAmount);
      setLastWinner(result.lastWinner);
      setLastWinTimestamp(result.lastWinTimestamp);

      const boardData: string[] = result.bitmap;
      const bits: boolean[] = [];
      for (const bytes32 of boardData) {
        const num = BigInt(bytes32);
        for (let i = 255; i >= 0; i--) {
          const mask = BigInt(1) << BigInt(i);
          bits.push((num & mask) !== BigInt(0));
        }
      }
      setGameState(bits.slice(0, 1024));
    } catch (err) {
      console.error('Error al consultar getGameState:', err);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.username) {
      fetchGameState();
      const interval = setInterval(fetchGameState, 10000);
      return () => clearInterval(interval);
    }
  }, [status, session]);

  // Cuando se actualizan round, lastWinner o lastWinTimestamp, notificar al padre
  useEffect(() => {
    onGameInfo(round, lastWinner, lastWinTimestamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, lastWinner, lastWinTimestamp]);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCellClick = (index: number, isDug: boolean) => {
    if (isDug) {
      setSelectedIndex(null);
      return;
    }
    setSelectedIndex(index);
    const col = index % 32;
    const row = Math.floor(index / 32);
    console.log(`Celda seleccionada (Índice: ${index}, Coordenadas: [${col}, ${row}])`);
    onCellSelect(col, row);
  };

  return (
    <div className="w-full p-0 space-y-6 text-white font-sans bg-gradient-to-br from-black via-gray-900 to-black h-screen flex flex-col items-stretch justify-center">
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
                  <div
                    className="absolute inset-0 bg-white/30 animate-pulse"
                  />
                )}
                {!isDug && (
                  <div
                    className="absolute inset-0 transition-colors duration-200 ease-in-out hover:bg-green-600/50"
                  />
                )}
                {/* Aquí podrías añadir otros elementos de la celda (ej. números, banderas) */}
              </div>
            ))}
        </div>
      </div>

      <GameInfo
        round={round}
        lastWinner={lastWinner}
        lastWinTimestamp={lastWinTimestamp}
        formatAddress={formatAddress}
        formatTimestamp={formatTimestamp}
      />
    </div>
  );
};