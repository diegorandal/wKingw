'use client';

import TreasureHuntABI from '@/abi/TreasureHunt_ABI.json';
import { MiniKit } from '@worldcoin/minikit-js';
import { useEffect, useState } from 'react'; // Asegúrate de que useState esté importado
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

  // --- NUEVO ESTADO PARA LA CELDA SELECCIONADA ---
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

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // --- NUEVA FUNCIÓN PARA MANEJAR EL CLIC DE LA CELDA ---
  const handleCellClick = (index: number, isDug: boolean) => {
    // Si la celda ya está excavada, no hacemos nada (no se puede seleccionar)
    if (isDug) {
      // Opcional: Deseleccionar cualquier celda previa si se hace clic en una ya excavada
      setSelectedIndex(null);
      return;
    }
    // Si la celda no está excavada, la seleccionamos
    setSelectedIndex(index);

    // --- AQUÍ PUEDES USAR EL ÍNDICE DE LA CELDA SELECCIONADA ---
    // Por ejemplo, para preparar una transacción de excavación:
    const col = index % 32;
    const row = Math.floor(index / 32);
    console.log(`Celda seleccionada (Índice: ${index}, Coordenadas: [${col}, ${row}])`);
    // En un futuro paso, aquí es donde llamarías a la función para interactuar con el contrato
    // Por ejemplo: digCell(index);
  };

  return (
    // Contenedor principal de la aplicación, le damos 'h-screen' para que ocupe toda la altura.
    <div className="w-full p-0 space-y-6 text-white font-sans bg-gradient-to-br from-black via-gray-900 to-black h-screen flex flex-col items-center justify-center">
      {/* Tesoro actual */}
      <div className="bg-yellow-500/10 border border-yellow-400 shadow-lg shadow-yellow-400/20 rounded-2xl px-2 py-1 text-xl font-bold text-yellow-300 text-center animate-pulse backdrop-blur-sm">
        💰 Tesoro: {(Number(treasureAmount) * 0.75 / 1e18).toFixed(2)} ORO
      </div>

      {/* Mapa del tesoro */}
      {/* Contenedor que permite el scroll y es cuadrado.
          'w-full': ocupa todo el ancho del padre.
          'aspect-square': hace que su altura sea igual a su ancho, creando un cuadrado.
          'overflow-scroll': habilita el scroll si el contenido es más grande.
          'max-w-full': asegura que no desborde el padre horizontalmente.
      */}
      <div className="overflow-scroll w-full aspect-square max-w-full rounded-lg shadow-inner bg-white">
        {/* Tablero (el contenido que puede ser más grande que el contenedor de scroll y se desplaza) */}
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: 'repeat(32, 32px)', // CADA COLUMNA AHORA TIENE 32PX
            gridAutoRows: '32px', // CADA FILA AHORA TIENE 32PX
            width: 'max-content', // El grid se expandirá para contener 32 columnas de 32px (1024px de ancho)
            height: 'max-content', // El grid se expandirá para contener 32 filas de 32px (1024px de alto)
          }}
        >
          {gameState.length === 1024 &&
            gameState.map((isDug, index) => (
              <div
                key={index}
                // CLASES CONDICIONALES PARA LA SELECCIÓN Y EL CURSOR
                className={`
                  relative w-full h-full bg-[url(/Sprites/grass.png)] bg-cover bg-center
                  ${index === selectedIndex ? 'ring-4 ring-blue-500 ring-offset-0' : ''} /* Recuadro azul si está seleccionada */
                  ${isDug ? 'cursor-not-allowed' : 'cursor-pointer'} /* Cambio de cursor */
                `}
                style={{ aspectRatio: '1/1' }} // Cada celda individualmente también mantiene su aspecto cuadrado
                title={`Celda ${index % 32},${Math.floor(index / 32)}: ${isDug ? 'Excavada' : 'No excavada'}`}
                onClick={() => handleCellClick(index, isDug)} // AÑADIMOS EL MANEJADOR DE CLIC
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
                {/* Aquí podrías añadir otros elementos de la celda (ej. números, banderas) */}
              </div>
            ))}
        </div>
      </div>

      {/* Información del juego */}
      <div className="space-y-2 text-base sm:text-lg mt-4"> {/* Añadido mt-4 para espacio */}
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