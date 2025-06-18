'use client';
import { useState, useEffect } from 'react';
import { GameBoard } from './GameBoard';
import { DigButton } from './DigButton';
import { GameInfo } from './GameInfo';
import TreasureHuntABI from '@/abi/TreasureHunt_ABI.json';
import ORO_ABI from '@/abi/ORO_ABI.json';
import { MiniKit } from '@worldcoin/minikit-js';
import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { useSession } from 'next-auth/react';
import { parseEther } from 'viem';

export default function GameWithDig() {
  const [selectedCoords, setSelectedCoords] = useState<{ col: number | null, row: number | null, index: number | null }>({ col: null, row: null, index: null });
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
        address: '0x8Ea430CCD2618957630bC7130B2c89a07068AD38',
        abi: TreasureHuntABI,
        functionName: 'getGameState',
      }) as any;
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

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const handleCellSelect = (col: number, row: number, index: number, isDug: boolean) => {
    if (isDug) return;
    setSelectedCoords({ col, row, index });
  };

  const handleDig = async () => {

    //alert(`Cavar en ${selectedCoords.col}, ${selectedCoords.row}`);
    if (selectedCoords.col === null || selectedCoords.row === null || selectedCoords.index === null) {console.error('No cell selected'); return;};

    try {
      
      let address = '';
      if (status === 'authenticated' && session?.user?.username) {
        const user = await MiniKit.getUserByUsername(session.user.username);
        address = user.walletAddress;
        console.log("Wallet address:", address);
      }

      const oroAmount = parseEther('1');
      //const oroAmount = parseUnits('1',18);
      console.log('ORO amount:', oroAmount);
      if (!selectedCoords || typeof selectedCoords.col !== 'number' || typeof selectedCoords.row !== 'number') {
        console.error('Coordenadas no válidas:', selectedCoords);
        return;
      }
      if (selectedCoords.col < 0 || selectedCoords.col >= 32 || selectedCoords.row < 0 || selectedCoords.row >= 32) {
        console.error('Coordenadas fuera de rango:', selectedCoords);
        return;
      }

      const PERMIT_EXPIRATION = Math.floor(Date.now() / 1000) + 3600; // 1 hora desde ahora

      const permitStruct = {
        permitted: {
          token: '0xcd1e32b86953d79a6ac58e813d2ea7a1790cab63', // 🔥 en lowercase
          amount: oroAmount,
        },
        spender: '0x8ea430ccd2618957630bc7130b2c89a07068ad38', // 🔥 en lowercase
        nonce: BigInt(0),
        deadline: PERMIT_EXPIRATION,
      };

      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: '0x8ea430ccd2618957630bc7130b2c89a07068ad38',
            abi: TreasureHuntABI,
            functionName: 'digWithPermit',
            args: [
              selectedCoords.col, // x
              selectedCoords.row, // y
              {
                token: '0xcd1e32b86953d79a6ac58e813d2ea7a1790cab63',
                amount: oroAmount,
                expiration: PERMIT_EXPIRATION,
                nonce: BigInt(0),
              },
              {
                to: '0x8ea430ccd2618957630bc7130b2c89a07068ad38',
                requestedAmount: oroAmount,
              },
              address, // 👤 El address del usuario firmante (owner)
              'PERMIT2_SIGNATURE_PLACEHOLDER_0',
            ],
          },
        ],
        permit2: [permitStruct], // 👈 necesario para que MiniKit genere y adjunte la firma
      });


    

      console.log('FinalPayload:' , JSON.stringify(finalPayload));

    } catch (err: any) {
      console.error('Error en dig:', {message: err.message, code: err.code, details: err.details});
    }

  };

  return (
    <>
      <GameBoard
        gameState={gameState}
        treasureAmount={treasureAmount}
        selectedIndex={selectedCoords.index}
        onCellSelect={handleCellSelect}
      />
      <DigButton col={selectedCoords.col} row={selectedCoords.row} onDig={handleDig} />
      <GameInfo
        round={round}
        lastWinner={lastWinner}
        lastWinTimestamp={lastWinTimestamp}
        formatAddress={formatAddress}
        formatTimestamp={formatTimestamp}
      />
    </>
  );
}
