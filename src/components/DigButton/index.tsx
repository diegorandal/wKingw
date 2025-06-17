import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import React from 'react';

export const DigButton = ({ col, row, onDig }: { col: number | null, row: number | null, onDig: () => void }) => (
  <div className="w-full text-md bg-gray-200 border-2 border-gray-300 rounded-lg px-4 py-2 text-black flex items-center justify-center mt-2">
    <Button onClick={onDig} disabled={col === null || row === null} size="lg" variant="primary" className="w-full">
      {col !== null && row !== null ? `Cavar en ${col}, ${row}` : 'Selecciona una celda'}
    </Button>
  </div>
);
