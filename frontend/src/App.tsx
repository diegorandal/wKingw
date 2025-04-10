import { PayBlock } from "./components/Pay";
import { VerifyBlock } from "./components/Verify";

export default function App() {
  
  const handleClick = () => {
    console.log("Respuesta de verify: sape");
};

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
      <VerifyBlock />
      <PayBlock />
      <div>
            <h1>Mi MiniApp 2</h1>
            <button onClick={handleClick}>Probar MiniKit</button>
        </div>
    </main>
  );
}

