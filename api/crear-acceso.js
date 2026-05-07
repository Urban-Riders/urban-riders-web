// api/crear-acceso.js
export default async function handler(req, res) {
    // Solo permitimos peticiones POST
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const { email, password, cliente_id } = req.body;
    
    // Vercel tomará estas llaves de sus variables de entorno seguras
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return res.status(500).json({ error: 'Faltan credenciales del servidor' });
    }

    try {
        // 1. Crear el usuario en Auth (saltando la verificación de email)
        const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({ email, password, email_confirm: true })
        });

        const authData = await authRes.json();
        if (!authRes.ok) throw new Error(authData.message || 'Error al crear usuario en Auth');

        const nuevoUserId = authData.id;

        // 2. Pegar el auth_id en tu tabla 'clientes'
        const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/clientes?id=eq.${cliente_id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Prefer': 'return=minimal'
            },
           body: JSON.stringify({ auth_id: nuevoUserId, email: email })
        });

        if (!dbRes.ok) throw new Error('Usuario creado, pero falló al enlazar en la tabla clientes');

        return res.status(200).json({ success: true, message: 'Alta exitosa' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
