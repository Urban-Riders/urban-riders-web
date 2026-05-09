export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const { query } = req.body;

    try {
        // Entramos camuflados como un navegador Chrome normal para saltar el error 403
        const meliRes = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=15`, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'es-AR,es;q=0.9'
            }
        });
        
        if (!meliRes.ok) {
            const errorText = await meliRes.text();
            throw new Error(`Error ${meliRes.status} de MeLi: ${errorText}`);
        }

        const data = await meliRes.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
