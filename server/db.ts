import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as dotenv from 'dotenv';
import path from 'path';
import { log } from './vite';

// Carrega as variáveis de ambiente do arquivo .env
const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

neonConfig.webSocketConstructor = ws;

// URL do banco de dados
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não está definida! Verifique as variáveis de ambiente.');
}

log('Configurando conexão com o banco de dados...');
log(`Ambiente: ${process.env.NODE_ENV || 'não definido'}`);
log(`Arquivo .env: ${envFile}`);
log('DATABASE_URL definida e tem comprimento:', DATABASE_URL.length);

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000, // 10 segundos
  idleTimeoutMillis: 10000 // 10 segundos
});

// Testar conexão ao inicializar
pool.connect()
  .then(client => {
    log('Conexão inicial com o banco estabelecida');
    client.query('SELECT NOW()', (err, res) => {
      if (err) {
        log('Erro ao executar query de teste:', err);
      } else {
        log('Query de teste executada com sucesso:', res.rows[0]);
      }
      client.release();
    });
  })
  .catch(err => {
    log('Erro ao estabelecer conexão inicial:', err);
    throw err;
  });

export const db = drizzle({ client: pool, schema });
