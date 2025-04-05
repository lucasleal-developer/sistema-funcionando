import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

neonConfig.webSocketConstructor = ws;

// URL do banco de dados
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_vTrWVjeqkf93@ep-muddy-bar-acg7auww-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

console.log('Configurando conexão com o banco de dados...');
console.log('DATABASE_URL definida:', !!DATABASE_URL);

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
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
