'use client';

import OROtokenABI from '@/abi/ORO_ABI.json';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useEffect, useState } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { worldchain } from 'viem/chains';
import { useSession } from 'next-auth/react';

export const BalanceORO = () => {
  const myContractToken = '0xcd1E32B86953D79a6AC58e813D2EA7a1790cAb63';
  const [balance, setBalance] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage('Usuario no autenticado');
      setButtonState('failed');
      setTimeout(() => {
        setButtonState(undefined);
      }, 3000);
      return;
    }

    setButtonState('pending');
    setErrorMessage(null);

    try {
      // Obtener la dirección del usuario usando MiniKit con el username de la sesión
      const user = await MiniKit.getUserByUsername(session.user.username);
      const address = user.walletAddress;
      setUserAddress(address);

      // Consultar el balanceOf del contrato ORO
      const balanceResult = await client.readContract({
        address: myContractToken,
        abi: OROtokenABI,
        functionName: 'balanceOf',
        args: [address],
      });

      
      const formattedBalance = formatEther(balanceResult as bigint);
      setBalance(formattedBalance);
      setButtonState('success');

      // Restablecer el estado del botón después de 3 segundos
      setTimeout(() => {
        setButtonState(undefined);
      }, 3000);
    } catch (err) {
      console.error('Error al consultar el balance:', err);
      setErrorMessage('Error al consultar el balance');
      setButtonState('failed');
      setTimeout(() => {
        setButtonState(undefined);
      }, 3000);
    }
  };

  // Ejecutar la consulta automáticamente al cargar el componente o cuando cambie la sesión
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.username) {
      fetchBalance();
    }
  }, [status, session]);

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Saldo del Token ORO</p>
      {status === 'loading' && <p className="text-md">Cargando sesión...</p>}
      {status === 'unauthenticated' && (
        <p className="text-md">Por favor, inicia sesión para ver tu saldo.</p>
      )}
      {userAddress && status === 'authenticated' && (
        <p className="text-sm">
          Dirección: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </p>
      )}
      {balance && status === 'authenticated' ? (
        <p className="text-md">Saldo: {balance} ORO</p>
      ) : (
        status === 'authenticated' && <p className="text-md">Cargando saldo...</p>
      )}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <LiveFeedback
        label={{
          failed: 'Error al consultar el saldo',
          pending: 'Consultando saldo...',
          success: 'Saldo consultado con éxito',
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={fetchBalance}
          disabled={buttonState === 'pending' || status !== 'authenticated'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Actualizar Saldo
        </Button>
      </LiveFeedback>
    </div>
  );
};