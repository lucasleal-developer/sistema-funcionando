import { pool } from '../../server/db';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Buscar todos os tipos de atividades
    const result = await pool.query('SELECT * FROM activity_types ORDER BY name');
    
    // Log para debug
    console.log('Tipos de atividades encontrados:', result.rows);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tipos de atividades:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 