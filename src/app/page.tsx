import { Page } from '@/components/PageLayout';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { UserInfo } from '@/components/UserInfo';
import { Pay } from '@/components/Pay';
import { Verify } from '@/components/Verify';
import { AttackButton } from '@/components/AttackButton';
import { DefenseButton } from '@/components/DefenseButton';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin'); // Forzar autenticación
  }

  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        <AttackButton />
        <DefenseButton />
        <Pay />
      </Page.Main>
    </Page>
  );
}


{/*import { Page } from '@/components/PageLayout';
import { AuthButton } from '../components/AuthButton';

export default function Home() {
  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        <UserInfo />
        <AuthButton />
      </Page.Main>
    </Page>
  );
}*/}
