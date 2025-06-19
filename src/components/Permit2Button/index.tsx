'use client';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import Permit2_ABI from '@/abi/Permit2.json';
import TreasureHunt_ABI from '@/abi/TreasureHunt_ABI.json';
import { MiniKit } from '@worldcoin/minikit-js'

export const Permit2Button = () => {

  const OROaddress = '0xcd1E32B86953D79a6AC58e813D2EA7a1790cAb63'; 
  const myContractToken = '0xd7c561663751dfd2b11ddce5915ee2b12028f3cd';

const onClickUsePermit2 = async () => {


const permitTransfer = {
  permitted: {
    token: OROaddress, // Dirección del token ORO
    amount: (1 * 10 ** 18).toString(), // 1 token ORO (ajusta los decimales según el token)
  },
  nonce: Date.now().toString(),
  deadline: Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString(), // 30 minutos desde ahora
};

const transferDetails = {
  to: myContractToken, // Dirección del contrato mycontract
  requestedAmount: (1 * 10 ** 18).toString(), // Misma cantidad que en permitTransfer
};

try {
  
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: myContractToken,
          abi: TreasureHunt_ABI,
          functionName: 'dig',
          args: [
            7,
            7,
            [
              [
                permitTransfer.permitted.token,
                permitTransfer.permitted.amount,
              ],
              permitTransfer.nonce,
              permitTransfer.deadline,
            ],
            [myContractToken, permitTransfer.permitted.amount],
            'PERMIT2_SIGNATURE_PLACEHOLDER_0',
          ],
        },
      ],
      permit2: [
        {
          ...permitTransfer,
          spender: myContractToken, 
        },
      ],
    });


  console.log("Transacción enviada:", finalPayload);

} catch (error) {
  console.error("Error al enviar la transacción:", error);
}










}

return (
    <div className="grid w-full gap-4">
        <Button onClick={onClickUsePermit2} size="lg" variant="primary" className="w-full">Permit2sendTransaction</Button>
    </div>
  );

}