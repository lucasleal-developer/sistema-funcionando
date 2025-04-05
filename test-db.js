import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Configura o WebSocket para o Neon
const neonConfig = {
  webSocketConstructor: ws
};

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const result = await pool.query('SELECT version()');
    console.log('Conexão bem sucedida!');
    console.log('Versão do PostgreSQL:', result.rows[0].version);
    
    await pool.end();
  } catch (error) {
    console.error('Erro ao conectar:', error);
  }
}

testConnection(); 