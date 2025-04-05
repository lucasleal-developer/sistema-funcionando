import { pool } from '../../server/db.js';

export default async function handler(req, res) {
  console.log('Iniciando endpoint /api/schedules');
  
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
    // Extrair o dia da semana da URL
    const weekday = req.query.day || 'segunda';
    console.log('Buscando escalas para o dia:', weekday);

    // Buscar todas as escalas do dia
    const result = await pool.query(
      `SELECT 
        s.*,
        p.name as professional_name,
        p.initials as professional_initials,
        a.name as activity_name,
        a.color as activity_color
      FROM schedules s
      LEFT JOIN professionals p ON s.professional_id = p.id
      LEFT JOIN activity_types a ON s.activity_code = a.code
      WHERE s.weekday = $1
      ORDER BY s.start_time, p.name`,
      [weekday]
    );
    
    console.log('Escalas encontradas:', result.rows);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar escalas:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      stack: error.stack
    });
  }
} 