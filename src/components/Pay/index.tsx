'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useState } from 'react';
import { erc20Abi, parseEther } from 'viem';

// ABI estándar ERC-20 solo con la función transfer
const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
];

export const Pay = () => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  const onClickPay = async () => {
    // Cuenta privada de la wallet de prueba
    const address = '0xcc3651131c8262720332507ae1a4c370904d8614';
    setButtonState('pending');

    // ORO token contract address and decimals
    const oroAddress = '0xcd1E32B86953D79a6AC58e813D2EA7a1790cAb63';
    const oroDecimals = 18;
    const oroAmount = parseEther('0.1');

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: oroAddress,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [address, oroAmount],
          },
        ],
      });

      console.log(finalPayload);
      if (finalPayload.status === 'success') {
        setButtonState('success');
      } else {
        setButtonState('failed');
        setTimeout(() => {
          setButtonState(undefined);
        }, 3000);
      }
    } catch (err) {
      setButtonState('failed');
      setTimeout(() => {
        setButtonState(undefined);
      }, 3000);
    }
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Desafiar</p>
      <LiveFeedback
        label={{
          failed: 'Payment failed',
          pending: 'Payment pending',
          success: 'Payment successful',
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={onClickPay}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Desafiar
        </Button>
      </LiveFeedback>
    </div>
  );
};
