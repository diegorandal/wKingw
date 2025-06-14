'use client';

import TreasureHuntABI from '@/abi/TreasureHunt_ABI.json';
import { MiniKit } from '@worldcoin/minikit-js';
import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { useSession } from 'next-auth/react';
import { Sparkles, Trophy, Calendar } from 'lucide-react';

interface GameState {
  round: bigint;
  treasureAmount: bigint;
  lastWinner: string;
  lastWinTimestamp: bigint;
  bitmap: [string, string, string, string];
}

export const GameBoard = () => {
  const contractAddress = '0xe2b81493d6c26e705bc4193a87673db07810f376';
  const [gameState, setGameState] = useState<boolean[]>([]);
  const [round, setRound] = useState<bigint>(BigInt(0));
  const [treasureAmount, setTreasureAmount] = useState<bigint>(BigInt(0));
  const [lastWinner, setLastWinner] = useState<string>('');
  const [lastWinTimestamp, setLastWinTimestamp] = useState<bigint>(BigInt(0));

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

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="w-full h-[90vh] p-0 space-y-6 text-white font-sans bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Tesoro actual */}
      <div className="bg-yellow-500/10 border border-yellow-400 shadow-lg shadow-yellow-400/20 rounded-2xl px-2 py-1 text-xl font-bold text-yellow-300 text-center animate-pulse backdrop-blur-sm">
  💰 Tesoro: {(Number(treasureAmount) * 0.75 / 1e18).toFixed(2)} ORO
      </div>

      {/* Tablero */}
      <div className="grid grid-cols-32 gap-0 w-full" style={{ aspectRatio: '1/1' }}>
        {gameState.length === 1024 &&
          gameState.map((isDug, index) => (
            <div
              key={index}
              className={`w-full h-full transition-colors duration-200 ease-in-out ${
                isDug ? 'bg-yellow-800' : 'bg-green-700 hover:bg-green-600'
              }`}
              style={{ aspectRatio: '1/1' }}
              title={`Celda ${index % 32},${Math.floor(index / 32)}: ${isDug ? 'Excavada' : 'No excavada'}`}
            />
          ))}
      </div>

      {/* Informacion del juego */}
      <div className="space-y-2 text-base sm:text-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={20} />
          <span><strong>Ronda:</strong> {round.toString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400" size={20} />
          <span><strong>Últ. ganador:</strong> {lastWinner ? formatAddress(lastWinner) : 'Ninguno'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-pink-400" size={20} />
          <span><strong>Últ. hallazgo:</strong> {lastWinTimestamp > BigInt(0) ? formatTimestamp(lastWinTimestamp) : 'Nunca'}</span>
        </div>
      </div>

    </div>
  );
};
