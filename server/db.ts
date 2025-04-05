import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

neonConfig.webSocketConstructor = ws;

// Log para debug
console.log('Diretório atual:', process.cwd());
console.log('Arquivo .env:', path.resolve(process.cwd(), '.env'));
console.log('DATABASE_URL definida:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL valor:', process.env.DATABASE_URL ? '[DEFINIDA]' : '[NÃO DEFINIDA]');

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('Configurando conexão com o banco de dados...');

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Testar conexão ao inicializar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conexão com banco de dados estabelecida:', res.rows[0]);
  }
});

export const db = drizzle({ client: pool, schema });
