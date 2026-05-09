export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const { query } = req.body;
    const APP_ID = process.env.MELI_APP_ID;
    const SECRET = process.env.MELI_CLIENT_SECRET;

    try {
        // 1. Pedimos un permiso temporal a Mercado Libre usando tus credenciales secretas
        let accessToken = '';
        if (APP_ID && SECRET) {
            const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `grant_type=client_credentials&client_id=${APP_ID}&client_secret=${SECRET}`
            });
            const tokenData = await tokenResponse.json();
            if (tokenData.access_token) accessToken = tokenData.access_token;
        }

        // 2. Buscamos los precios mostrando la credencial oficial
        const fetchHeaders = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
        const meliRes = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=15`, {
            headers: fetchHeaders
        });
        
        const data = await meliRes.json();
        if (data.error) throw new Error(data.message);

        // 3. Le devolvemos los datos limpios a tu panel
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
