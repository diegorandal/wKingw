'use client';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import Permit2_ABI from '@/abi/Permit2.json';
import { MiniKit } from '@worldcoin/minikit-js'

export const Permit2Button = () => {

  const OROaddress = '0xcd1E32B86953D79a6AC58e813D2EA7a1790cAb63'; 
  const myContractToken = '0xe2b81493d6c26e705bc4193a87673db07810f376';

const onClickUsePermit2 = async () => {
  
  console.log('onClickUsePermit2 clicked');
  
  // Permit2 is valid for max 1 hour
  const permitTransfer = {
    permitted: {
      token: OROaddress, // The token I'm sending
      amount: (1 * 10 ** 18).toString()
    },
    nonce: Date.now().toString(),
    deadline: Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString(),
  };

  const transferDetails = {
    to: myContractToken,
    requestedAmount: (1 * 10 ** 18).toString(),
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
    
}

return (
    <div className="grid w-full gap-4">
        <Button onClick={onClickUsePermit2} size="lg" variant="primary" className="w-full">Permit2sendTransaction</Button>
    </div>
  );

}