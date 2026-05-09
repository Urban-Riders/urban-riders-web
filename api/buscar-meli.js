export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const { query } = req.body;
    const APP_ID = process.env.MELI_APP_ID;
    const SECRET = process.env.MELI_CLIENT_SECRET;

    try {
        // 1. Pedimos el token oficial
        const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: `grant_type=client_credentials&client_id=${APP_ID}&client_secret=${SECRET}`
        });
        
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            throw new Error("MeLi no nos dio el Token: " + JSON.stringify(tokenData));
        }

        // 2. Buscamos los precios con el DISFRAZ puesto (User-Agent)
        const meliRes = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=15`, {
            headers: { 
                'Authorization': `Bearer ${tokenData.access_token}`,
                'User-Agent': `UrbanRidersApp/1.0 (AppID: ${APP_ID})`, // <-- El escudo se abre con esto
                'Accept': 'application/json'
            }
        });
        
        // 3. Si nos tiran bronca (403, 401, etc), capturamos el texto exacto
        if (!meliRes.ok) {
            const errorText = await meliRes.text(); // Leemos qué nos dice el escudo
            throw new Error(`Código ${meliRes.status} - Mensaje de MeLi: ${errorText}`);
        }

        // 4. Si pasamos, devolvemos los datos
        const data = await meliRes.json();
        return res.status(200).json(data);

    } catch (error) {
        // Ahora el error que veas en tu panel va a ser exacto y detallado
        return res.status(500).json({ error: error.message });
    }
}
