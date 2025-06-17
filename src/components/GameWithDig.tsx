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
import { erc20Abi, parseEther } from 'viem';

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
        address: '0xe2b81493d6c26e705bc4193a87673db07810f376',
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

      const oroAmount = parseEther('1');

      await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: '0xcd1E32B86953D79a6AC58e813D2EA7a1790cAb63',
            abi: ORO_ABI,
            functionName: 'approve',
            args: [
              '0xe2B81493d6C26E705bc4193A87673db07810f376',
              oroAmount
            ]
          },
          {
            address: '0xe2B81493d6C26E705bc4193A87673db07810f376',
            abi: TreasureHuntABI,
            functionName: 'dig',
            args: [selectedCoords.col, selectedCoords.row]
          }
        ]
      });

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
