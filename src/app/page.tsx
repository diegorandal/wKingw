import { Page } from '@/components/PageLayout';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { UserInfo } from '@/components/UserInfo';
import { Pay } from '@/components/Pay';
import { signOut } from 'next-auth/react'; // Importa signOut para cerrar la sesión actual

export default async function Home() {
  const session = await auth();

  // Si ya hay una sesión activa, forzamos el cierre de sesión
  if (session) {
    await signOut({ redirect: false }); // Cierra la sesión sin redirigir automáticamente
  }

  // Ahora redirige al login para que el usuario inicie sesión nuevamente
  redirect('/api/auth/signin'); // Redirige al formulario de login

  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center">
        <UserInfo />
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
        <AuthButton />
      </Page.Main>
    </Page>
  );
}*/}
