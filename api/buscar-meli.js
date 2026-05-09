export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const { query } = req.body;
    const APP_ID = process.env.MELI_APP_ID;
    const SECRET = process.env.MELI_CLIENT_SECRET;

    console.log("1. Buscando producto:", query);
    console.log("2. Llaves secretas en Vercel detectadas:", APP_ID ? "SÍ" : "NO (Falta hacer bien el Redeploy)");

    try {
        if (!APP_ID || !SECRET) {
            throw new Error("Faltan las credenciales en Vercel. Las variables de entorno no cargaron.");
        }

        console.log("3. Pidiendo permiso oficial a Mercado Libre...");
        const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
            body: `grant_type=client_credentials&client_id=${APP_ID}&client_secret=${SECRET}`
        });
        
        const tokenData = await tokenResponse.json();
        console.log("4. Respuesta de MeLi al pedir permiso:", tokenData);
        
        if (!tokenData.access_token) {
            throw new Error("Mercado Libre rechazó las llaves: " + JSON.stringify(tokenData));
        }

        console.log("5. ¡Permiso concedido! Buscando precios...");
        const meliRes = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=15`, {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        });
        
        const data = await meliRes.json();
        
        if (data.error) throw new Error("Error en la búsqueda de MeLi: " + data.message);

        console.log("6. Búsqueda exitosa. Enviando datos al panel.");
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> ERROR FATAL DETECTADO:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
