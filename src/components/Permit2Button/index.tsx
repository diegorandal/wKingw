'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import Permit2_ABI from '@/abi/Permit2.json';
import { MiniKit } from '@worldcoin/minikit-js'

export const Permit2Button = () => {

const onClickUsePermit2 = async () => {
  /*
  // Permit2 is valid for max 1 hour
  const permitTransfer = {
    permitted: {
      token: "0x..." // The token I'm sending
      amount: (0.5 * 10 ** 18).toString(),
    },
    nonce: Date.now().toString(),
    deadline: Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString(),
  };

  const transferDetails = {
    to: address,
    requestedAmount: (0.5 * 10 ** 18).toString(),
  };

  try {
    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: "0xF0882554ee924278806d708396F1a7975b732522",
          abi: Permit2_ABI,
          functionName: 'signatureTransfer',
          args: [
            [
              [
                permitTransfer.permitted.token,
                permitTransfer.permitted.amount,
              ],
              permitTransfer.nonce,
              permitTransfer.deadline,
            ],
            [transferDetails.to, transferDetails.requestedAmount],
            'PERMIT2_SIGNATURE_PLACEHOLDER_0', // Placeholders will automatically be replaced with the correct signature. 
          ],
        },
      ],
      permit2: [
        {
          ...permitTransfer,
          spender: myContractToken,
        }, // If you have more than one permit2 you can add more values here.
      ],
    });
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
    */
}

return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">send Permit2 transaction</p>
        <Button onClick={onClickUsePermit2} size="lg" variant="primary" className="w-full">sP2t</Button>
    </div>
  );

}