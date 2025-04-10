import { useEffect } from "react"; // Para inicializar MiniKit al cargar
import { MiniKit, VerifyCommandInput, VerifyCommandResponse } from "@worldcoin/minikit-js";

function App() {
    // Inicializa MiniKit cuando el componente se monta
    useEffect(() => {
        MiniKit.install(); // Instala MiniKit en el entorno
    }, []);

    const handleVerifyIdentity = () => {
        // Verifica si MiniKit está instalado
        if (!MiniKit.isInstalled()) {
            console.log("MiniKit no está instalado. Por favor, ejecuta esta app dentro de World App.");
            window.alert("Abre esta aplicación en World App para verificar tu identidad.");
            return;
        }

        // Configura el payload para el comando verify
        const payload: VerifyCommandInput = {
            verification_level: "device" as const, // Puede ser "device" o "orb"
        };

        // Ejecuta el comando verify
        const response: VerifyCommandResponse | null = MiniKit.commands.verify(payload);

        // Maneja la respuesta
        if (response) {
            console.log("Respuesta de verificación:", response);
            if (response.success) {
                window.alert("Identidad verificada exitosamente!");
            } else {
                window.alert("Fallo en la verificación: " + (response.reason || "Error desconocido"));
            }
        } else {
            console.log("No se recibió respuesta del comando verify.");
            window.alert("No se pudo verificar la identidad. Asegúrate de estar en World App.");
        }
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>Verificación de Identidad</h1>
            <p>Haz clic para verificar tu identidad con World App</p>
            <button
                onClick={handleVerifyIdentity}
                style={{ padding: "10px 20px", fontSize: "16px" }}
            >
                Verificar Identidad
            </button>
        </div>
    );
}

export default App;