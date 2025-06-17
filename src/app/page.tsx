import { Page } from '@/components/PageLayout';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { UserInfo } from '@/components/UserInfo';
import { Pay } from '@/components/Pay';
import { BalanceORO } from '@/components/BalanceORO';
import { GameBoard } from '@/components/GameBoard';
import { Verify } from '@/components/Verify';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin'); // Forzar autenticación
  }

  return (
    <Page>
      <Page.Main className="flex flex-col justify-start items-stretch w-full px-0 pt-0 pb-2">
        <GameBoard />
        <BalanceORO />
      </Page.Main>
    </Page>
  );
}

