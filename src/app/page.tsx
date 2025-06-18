import { Page } from '@/components/PageLayout';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
//import { UserInfo } from '@/components/UserInfo';
//import { Pay } from '@/components/Pay';
import { BalanceORO } from '@/components/BalanceORO';
import { Permit2Button } from '@/components/Permit2Button';
//import { GameBoard } from '@/components/GameBoard';
//import { Verify } from '@/components/Verify';
import GameWithDig from '@/components/GameWithDig';

export default async function Home() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth');
  }

  return (
    <Page>
      <Page.Main className="flex flex-col justify-start items-stretch w-full px-0 pt-0 pb-2">
        <GameWithDig /> 
        <BalanceORO />
        <Permit2Button />
      </Page.Main>
    </Page>
  );
}

