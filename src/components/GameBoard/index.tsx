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
    <div className="w-full p-0 space-y-6 text-white font-sans bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Tesoro actual */}
      <div className="bg-yellow-500/10 border border-yellow-400 shadow-lg shadow-yellow-400/20 rounded-2xl px-2 py-1 text-xl font-bold text-yellow-300 text-center animate-pulse backdrop-blur-sm">
        💰 Tesoro: {(Number(treasureAmount) * 0.75 / 1e18).toFixed(2)} ORO
      </div>

      <div className="overflow-scroll w-full h-full"> {/* Puedes ajustar w-full h-full a un tamaño fijo si lo prefieres, e.g., 'w-[400px] h-[400px]' */}
        {/* Tablero (el contenido que puede ser más grande que el contenedor de scroll y se desplaza) */}
        <div className="grid gap-0" // Quitamos grid-cols-32 de aquí, lo definimos en style
          style={{
            gridTemplateColumns: 'repeat(32, 64px)', // Esto hace que cada columna tenga 40px de ancho
            gridAutoRows: '64px', // Esto hace que cada fila tenga 40px de alto
            width: 'max-content', // El grid se expandirá para contener 32 columnas de 40px (32 * 40px = 1280px)
            height: 'max-content', // El grid se expandirá para contener 32 filas de 40px (32 * 40px = 1280px)
          }}
        >
          {gameState.length === 1024 &&
            gameState.map((isDug, index) => (
              <div
                key={index}
                // w-full h-full aquí significa que la celda ocupará el 100% de su espacio de 40x40px en la cuadrícula
                className="relative w-full h-full bg-[url(/Sprites/grass.png)] bg-cover bg-center"
                title={`Celda ${index % 32},${Math.floor(index / 32)}: ${isDug ? 'Excavada' : 'No excavada'}`}
              >
                {/* Capa de tierra (dirt) que se muestra solo si la celda fue excavada */}
                {isDug && (
                  <div className="absolute inset-0 bg-[url(/Sprites/dirt.png)] bg-cover bg-center" />
                )}

                {/* Capa para el efecto hover, solo si la celda NO está excavada */}
                {!isDug && (
                  <div
                    className="absolute inset-0 transition-colors duration-200 ease-in-out hover:bg-green-600/50"
                  />
                )}

                {/* Aquí puedes añadir otros elementos de la celda si los necesitas (ej. número de bombas, banderas, etc.) */}
              </div>
            ))}
        </div>
      </div>

      {/* Información del juego */}
      <div className="space-y-2 text-base sm:text-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={20} />
          <span>
            <strong>Ronda:</strong> {round.toString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400" size={20} />
          <span>
            <strong>Últ. ganador:</strong> {lastWinner ? formatAddress(lastWinner) : 'Ninguno'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-pink-400" size={20} />
          <span>
            <strong>Últ. hallazgo:</strong>{' '}
            {lastWinTimestamp > BigInt(0) ? formatTimestamp(lastWinTimestamp) : 'Nunca'}
          </span>
        </div>
      </div>
    </div>
  );
};