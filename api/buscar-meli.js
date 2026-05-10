export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    
    const { query } = req.body;
    
    try {
        // En vez de usar la API bloqueada, vamos al listado web público
        const url = `https://listado.mercadolibre.com.ar/${encodeURIComponent(query)}`;
        
        // El truco maestro: Disfrazamos el servidor de Vercel como Googlebot
        const meliRes = await fetch(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'text/html'
            }
        });
        
        if (!meliRes.ok) throw new Error("MeLi frenó al bot. Status: " + meliRes.status);
        
        const html = await meliRes.text();
        
        // Usamos una expresión regular para "chupar" todos los números con formato de precio de la web
        const priceRegex = /<span class="andes-money-amount__fraction">([\d\.]+)<\/span>/g;
        let match;
        let preciosRaw = [];
        
        while ((match = priceRegex.exec(html)) !== null) {
            // Limpiamos los puntos de los miles y convertimos a número
            let p = parseFloat(match[1].replace(/\./g, ''));
            // Filtramos cuotas o precios ridículos menores a $500
            if (p > 500) preciosRaw.push(p);
        }

        if (preciosRaw.length === 0) {
            throw new Error("No pudimos leer los precios del código HTML.");
        }

        // Descartamos los primeros 2 números que suelen ser publicidades del banner superior
        let precios = preciosRaw.slice(2, 17);
        if (precios.length === 0) precios = preciosRaw;
        
        // Formateamos los datos para que el panel los entienda
        const results = precios.map((price, index) => ({
            title: `Repuesto similar extraído #${index + 1}`,
            price: price
        }));

        return res.status(200).json({ results });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
