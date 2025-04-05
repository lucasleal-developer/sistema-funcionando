import { pool } from '../../server/db.js';

export default async function handler(req, res) {
  console.log('Iniciando endpoint /api/activity-types');
  
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
    console.log('Buscando tipos de atividades...');
    const result = await pool.query('SELECT * FROM activity_types ORDER BY name');
    
    console.log('Tipos de atividades encontrados:', result.rows);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tipos de atividades:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      stack: error.stack
    });
  }
} 