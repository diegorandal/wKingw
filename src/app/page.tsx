import { Page } from '@/components/PageLayout';
import { auth } from '@/auth';
import { AuthButton } from '@/components/AuthButton';
import { Pay } from '@/components/Pay';
import { Transaction } from '@/components/Transaction';
import { UserInfo } from '@/components/UserInfo';

export default async function Home() {
  const session = await auth(); // Detecta si hay sesión activa

  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        {session ? (
          <>
            <UserInfo />
            <Pay />
            <Transaction />
          </>
        ) : (
          <AuthButton />
        )}
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
        <AuthButton />
      </Page.Main>
    </Page>
  );
}*/}
