'use client';

import OROtokenABI from '@/abi/ORO_ABI.json';
import { MiniKit } from '@worldcoin/minikit-js';
import { useEffect, useState } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { worldchain } from 'viem/chains';
import { useSession } from 'next-auth/react';

export const BalanceORO = () => {
  const myContractToken = '0xcd1E32B86953D79a6AC58e813D2EA7a1790cAb63';
  const [balance, setBalance] = useState<string | null>(null);

  // Obtener la sesión del usuario
  const { data: session, status } = useSession();

  // Configuración del cliente Viem para interactuar con Worldchain
  const client = createPublicClient({
    chain: worldchain,
    transport: http('https://worldchain-mainnet.g.alchemy.com/public'),
  });

  // Función para consultar el balanceOf
  const fetchBalance = async () => {
    if (status !== 'authenticated' || !session?.user?.username) {
      return;
    }

    try {
      // Obtener la dirección del usuario usando MiniKit con el username de la sesión
      const user = await MiniKit.getUserByUsername(session.user.username);
      const address = user.walletAddress;

      // Consultar el balanceOf del contrato ORO
      const balanceResult = await client.readContract({
        address: myContractToken,
        abi: OROtokenABI,
        functionName: 'balanceOf',
        args: [address],
      } as const);

      // Convertir el balance de wei a ether (o la unidad deseada)
      const formattedBalance = Number(formatEther(balanceResult as bigint)).toFixed(2);

      setBalance(formattedBalance);
    } catch (err) {
      console.error('Error al consultar el balance:', err);
    }
  };

  // Ejecutar la consulta automáticamente al cargar el componente o cuando cambie la sesión
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.username) {
      fetchBalance();
    }
  }, [status, session]);

  return (
    <>
      {balance && status === 'authenticated' && (
        <p className="w-full text-md bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-2 text-black">
          Disponible: {balance} ORO
        </p>
      )}
    </>
  );
};