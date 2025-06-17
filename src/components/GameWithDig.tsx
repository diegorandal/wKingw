'use client';
import { useState } from 'react';
import { GameBoard } from './GameBoard';
import { DigButton } from './DigButton';

export default function GameWithDig() {
  // Estado para las coordenadas seleccionadas
  const [selectedCoords, setSelectedCoords] = useState<{ col: number | null, row: number | null }>({ col: null, row: null });

  // Función que GameBoard llamará al seleccionar una celda
  const handleCellSelect = (col: number, row: number) => {
    setSelectedCoords({ col, row });
  };

  // Acción al cavar
  const handleDig = () => {
    // Aquí va la lógica de cavar usando selectedCoords
    alert(`Cavar en ${selectedCoords.col}, ${selectedCoords.row}`);
  };

  return (
    <>
      <GameBoard onCellSelect={handleCellSelect} />
      <DigButton col={selectedCoords.col} row={selectedCoords.row} onDig={handleDig} />
    </>
  );
}
