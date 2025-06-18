'use client';
import { useState, useEffect } from 'react';
import { GameBoard } from './GameBoard';
import { DigButton } from './DigButton';
import { GameInfo } from './GameInfo';
import TreasureHuntABI from '@/abi/TreasureHunt_ABI.json';
import ORO_ABI from '@/abi/ORO_ABI.json';
import Permit2_ABI from '@/abi/Permit2.json';
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
    
    if (selectedCoords.col === null || selectedCoords.row === null || selectedCoords.index === null) {
      console.error('No cell selected');
      return;
    }

    let address = '';
    if (status === 'authenticated' && session?.user?.username) {
      const user = await MiniKit.getUserByUsername(session.user.username);
      address = user.walletAddress;
      console.log('Wallet address:', address);
    }

    const oroAmount = parseEther('1');
    const PERMIT_EXPIRATION = Math.floor(Date.now() / 1000) + 180;
    
    const permitTransfer = {
      permitted: {
        token: '0xcd1E32B86953D79a6AC58e813D2EA7a1790cAb63',
        amount: (0.5 * 10 ** 18).toString(),
      },
      nonce: Date.now().toString(),
      deadline: Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString(),
    };
    const transferDetails = {
      to: '0x8ea430ccd2618957630bc7130b2c89a07068ad38',
      requestedAmount: (1 * 10 ** 18).toString(),
    };
    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: '0xF0882554ee924278806d708396F1a7975b732522',
            abi: Permit2_ABI,
            functionName: 'signatureTransfer',
            args: [
              [
                [permitTransfer.permitted.token, permitTransfer.permitted.amount],
                permitTransfer.nonce,
                permitTransfer.deadline,
              ],
              [transferDetails.to, transferDetails.requestedAmount],
              'PERMIT2_SIGNATURE_PLACEHOLDER_0',
            ],
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: '0x8ea430ccd2618957630bc7130b2c89a07068ad38',
          },
        ],
      });
      console.log('FinalPayload:', JSON.stringify(finalPayload));
    } catch (err: any) {
      console.error('Error en onClickUsePermit2:', { message: err.message, code: err.code, details: err.details });
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
