import { pool } from '../../server/db.js';

export default async function handler(req, res) {
  console.log('Iniciando endpoint /api/professionals');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');

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
    console.log('Tentando conectar ao banco de dados...');
    
    // Primeiro, testar a conexão
    try {
      const testResult = await pool.query('SELECT NOW()');
      console.log('Conexão com banco de dados estabelecida:', testResult.rows[0]);
    } catch (connError) {
      console.error('Erro ao testar conexão:', connError);
      return res.status(500).json({ 
        error: 'Erro ao conectar ao banco de dados',
        details: connError.message
      });
    }

    // Verificar se a tabela existe
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'professionals'
        );
      `);
      console.log('Tabela professionals existe?', tableCheck.rows[0].exists);
      
      if (!tableCheck.rows[0].exists) {
        return res.status(500).json({ 
          error: 'Tabela professionals não existe',
          details: 'A tabela não foi criada no banco de dados'
        });
      }
    } catch (tableError) {
      console.error('Erro ao verificar tabela:', tableError);
      return res.status(500).json({ 
        error: 'Erro ao verificar tabela',
        details: tableError.message
      });
    }

    // Buscar todos os profissionais
    console.log('Buscando profissionais...');
    const result = await pool.query('SELECT * FROM professionals ORDER BY name');
    
    console.log('Profissionais encontrados:', result.rows);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      stack: error.stack
    });
  }
} 