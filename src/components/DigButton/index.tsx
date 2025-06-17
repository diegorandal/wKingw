import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import React from 'react';

export const DigButton = ({ col, row, onDig }: { col: number | null, row: number | null, onDig: () => void }) => (
  <Button
    onClick={onDig}
    disabled={col === null || row === null}
    size="lg"
    variant="primary"
    className="w-full"
  >
    {col !== null && row !== null ? `Cavar en ${col}, ${row} por 1 ORO` : 'Selecciona un lugar'}
  </Button>
  
);
