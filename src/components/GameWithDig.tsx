'use client';
import { useState } from 'react';
import { GameBoard } from './GameBoard';
import { DigButton } from './DigButton';
import { GameInfo } from './GameInfo';

export default function GameWithDig() {
  const [selectedCoords, setSelectedCoords] = useState<{ col: number | null, row: number | null }>({ col: null, row: null });
  const [round, setRound] = useState<bigint>(BigInt(0));
  const [lastWinner, setLastWinner] = useState<string>('');
  const [lastWinTimestamp, setLastWinTimestamp] = useState<bigint>(BigInt(0));

  // Funciones para formatear datos
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  // Función que GameBoard llamará al seleccionar una celda
  const handleCellSelect = (col: number, row: number) => {
    setSelectedCoords({ col, row });
  };

  // GameBoard debe informar cambios de info de juego
  const handleGameInfo = (round: bigint, lastWinner: string, lastWinTimestamp: bigint) => {
    setRound(round);
    setLastWinner(lastWinner);
    setLastWinTimestamp(lastWinTimestamp);
  };

  const handleDig = () => {
    alert(`Cavar en ${selectedCoords.col}, ${selectedCoords.row}`);
  };

  return (
    <>
      <GameBoard onCellSelect={handleCellSelect} onGameInfo={handleGameInfo} />
      <DigButton col={selectedCoords.col} row={selectedCoords.row} onDig={handleDig} />
      <GameInfo round={round} lastWinner={lastWinner} lastWinTimestamp={lastWinTimestamp} formatAddress={formatAddress} formatTimestamp={formatTimestamp}/>
    </>
  );
}
