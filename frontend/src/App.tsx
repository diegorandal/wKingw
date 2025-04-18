import { useEffect } from "react";
import { MiniKit, WalletAuthInput } from "@worldcoin/minikit-js";

function App() {
    // Inicializa MiniKit al cargar la app
    useEffect(() => {
        MiniKit.install();
    }, []);

    const handleCheckBalance = async () => {
        if (!MiniKit.isInstalled()) {
            console.log("MiniKit no está instalado. Abre esta app en World App.");
            window.alert("Por favor, abre esta aplicación en World App.");
            return;
        }

        // Configura el payload para walletAuth
        const payload: WalletAuthInput = {
            nonce: "check-balance-" + Date.now(), // Nonce único
        };

        // Autentica y obtén la respuesta, usando any para evitar problemas de tipos
        const response: any = MiniKit.commands.walletAuth(payload);
        console.log("Respuesta de MiniKit:", response);

        if (response) {
            // Si response no es null, la autenticación fue exitosa
            window.alert(
                `Autenticación exitosa. Respuesta: ${JSON.stringify(response)}\n` +
                `Nota: MiniKit 1.6.1 no proporciona el saldo de WLD directamente. ` +
                `Usa Optimism Explorer o una API como Alchemy para consultar el saldo.`
            );

            // Extrae la dirección si está disponible (a confirmar con la respuesta)
            const walletAddress = response.address || response.walletAddress || null;
            if (walletAddress) {
                console.log("Dirección de la billetera:", walletAddress);
                // Placeholder para consultar el saldo con una API externa
                /*
                try {
                    const balance = await fetchWldBalance(walletAddress);
                    window.alert(`Saldo de Worldcoins (WLD): ${balance} WLD`);
                } catch (error) {
                    window.alert("Error al consultar el saldo: " + error.message);
                }
                */
            } else {
                window.alert("No se encontró la dirección de la billetera en la respuesta.");
            }
        } else {
            window.alert("Error al autenticar la billetera.");
        }
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>Consulta de Saldo con MiniKit</h1>
            <p>Haz clic para autenticar y ver la dirección de tu billetera</p>
            <button
                onClick={handleCheckBalance}
                style={{ padding: "10px 20px", fontSize: "16px" }}
            >
                Consultar Saldo
            </button>
        </div>
    );
}

export default App;