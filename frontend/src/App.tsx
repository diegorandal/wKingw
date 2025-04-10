import { useEffect } from "react";
import { MiniKit, WalletAuthInput } from "@worldcoin/minikit-js";

function App() {
    // Inicializa MiniKit al cargar la app
    useEffect(() => {
        MiniKit.install();
    }, []);

    const handleHelloWorld = () => {
        if (!MiniKit.isInstalled()) {
            console.log("MiniKit no está instalado. Abre esta app en World App.");
            window.alert("Por favor, abre esta aplicación en World App.");
            return;
        }

        // Configura el payload para walletAuth
        const payload: WalletAuthInput = {
            nonce: "hello-world-" + Date.now(), // Nonce único
        };

        // Usamos any para evitar problemas de tipado
        const response: any = MiniKit.commands.walletAuth(payload);
        console.log("Respuesta de MiniKit:", response);

        if (response) {
            // Si response no es null, asumimos éxito
            window.alert("¡Hola Mundo desde MiniKit! Respuesta: " + JSON.stringify(response));
        } else {
            window.alert("Error al ejecutar Hola Mundo. Autenticación fallida.");
        }
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>Hola Mundo con MiniKit</h1>
            <p>Haz clic para saludar usando World App</p>
            <button
                onClick={handleHelloWorld}
                style={{ padding: "10px 20px", fontSize: "16px" }}
            >
                Decir Hola
            </button>
        </div>
    );
}

export default App;