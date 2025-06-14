'use client';

import TreasureHuntABI from '@/abi/TreasureHunt_ABI.json';
import { MiniKit } from '@worldcoin/minikit-js';
import { useEffect, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { useSession } from 'next-auth/react';

// Definir el tipo de la tupla devuelta por getGameState
interface GameState {
  round: bigint; // uint256
  treasureAmount: bigint; // uint256
  lastWinner: string; // address
  lastWinTimestamp: bigint; // uint256
  bitmap: [string, string, string, string]; // bytes32[4]
}

export const GameBoard = () => {
  const contractAddress = '0xe2b81493d6c26e705bc4193a87673db07810f376';
  const [gameState, setGameState] = useState<boolean[]>([]); // Array de 1024 bits (true = excavado, false = no excavado)

  // Obtener la sesión del usuario
  const { data: session, status } = useSession();

  // Configuración del cliente Viem para interactuar con Worldchain
  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
  });

  // Función para consultar getGameState
  const fetchGameState = async () => {
    if (status !== 'authenticated' || !session?.user?.username) {
      return;
    }

    try {
      // Obtener la dirección del usuario usando MiniKit (aunque no se usa en getGameState)
      const user = await MiniKit.getUserByUsername(session.user.username);
      const address = user.walletAddress;

      // Consultar getGameState del contrato con tipado explícito
      const result = await client.readContract({
        address: contractAddress,
        abi: TreasureHuntABI,
        functionName: 'getGameState',
      }) as GameState;

      // Extraer el array de bytes32[4] (campo bitmap)
      const boardData: string[] = result.bitmap;
      
      console.log('Board Data:', boardData);

      // Convertir bytes32 a bits
      const bits: boolean[] = [];
      for (const bytes32 of boardData) {
        // Convertir bytes32 a número (BigInt)
        const num = BigInt(bytes32);
        // Extraer 256 bits (de derecha a izquierda)
        for (let i = 255; i >= 0; i--) {
          bits.push((num & (BigInt(1) << BigInt(i))) !== BigInt(0));
        }
      }

      // Asegurar que tenemos exactamente 1024 bits
      setGameState(bits.slice(0, 1024));
    } catch (err) {
      console.error('Error al consultar getGameState:', err);
    }
  };

  // Ejecutar la consulta cada 10 segundos
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.username) {
      fetchGameState(); // Consulta inicial
      const interval = setInterval(fetchGameState, 10000); // Cada 10 segundos
      return () => clearInterval(interval); // Limpiar intervalo al desmontar
    }
  }, [status, session]);

  return (
    <div className="w-full h-[80vh] overflow-auto">
      <div
        className="grid grid-cols-32 gap-0 w-full"
        style={{ aspectRatio: '1/1' }}
      >
        {gameState.length === 1024 &&
          gameState.map((isDug, index) => (
            <div
              key={index}
              className={`w-full h-full ${isDug ? 'bg-orange-500' : 'bg-green-500'}`}
              style={{ aspectRatio: '1/1' }}
              title={`Celda ${index % 32},${Math.floor(index / 32)}: ${
                isDug ? 'Excavada' : 'No excavada'
              }`}
            />
          ))}
      </div>
    </div>
  );
};