import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import React from 'react';

export const DigButton = ({ col, row, onDig }: { col: number | null, row: number | null, onDig: () => void }) => (
  <div className="w-full mt-2">
    <Button
      onClick={onDig}
      disabled={col === null || row === null}
      size="lg"
      variant="primary"
      className="w-full bg-gray-200 border-2 border-gray-300 rounded-lg px-4 py-2"
    >
      {col !== null && row !== null ? `Cavar en ${col}, ${row} por 1 ORO` : 'Selecciona una celda'}
    </Button>
  </div>
);