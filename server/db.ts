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

log('[DEBUG] Iniciando configuração do banco de dados...');
log('[DEBUG] NODE_ENV:', process.env.NODE_ENV || 'não definido');
log('[DEBUG] Arquivo .env usado:', envFile);
log('[DEBUG] process.cwd():', process.cwd());
log('[DEBUG] __dirname:', __dirname);

// Configuração do WebSocket
try {
  if (!ws) {
    throw new Error('Módulo WebSocket não encontrado');
  }
  log('[DEBUG] Módulo WebSocket carregado:', typeof ws);
  log('[DEBUG] WebSocket ready state:', ws.OPEN.toString());
  
  neonConfig.webSocketConstructor = ws;
  log('[DEBUG] WebSocket configurado para Neon');
} catch (error) {
  log('[ERROR] Erro ao configurar WebSocket:', error instanceof Error ? error.message : String(error));
  log('[ERROR] Stack:', error instanceof Error ? error.stack : 'No stack available');
}

// URL do banco de dados
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  log('[ERROR] DATABASE_URL não está definida!');
  throw new Error('DATABASE_URL não está definida! Verifique as variáveis de ambiente.');
}

log('[DEBUG] DATABASE_URL está definida e tem comprimento:', DATABASE_URL.length.toString());
log('[DEBUG] DATABASE_URL começa com:', DATABASE_URL.substring(0, 20) + '...');
log('[DEBUG] DATABASE_URL contém SSL?', DATABASE_URL.includes('sslmode=require').toString());

// Configuração do pool
const poolConfig = {
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    requestCert: true
  },
  connectionTimeoutMillis: 30000, // Aumentado para 30 segundos
  idleTimeoutMillis: 30000, // Aumentado para 30 segundos
  max: 20, // Máximo de conexões no pool
  allowExitOnIdle: true
};

log('[DEBUG] Configuração do pool:', JSON.stringify({
  ...poolConfig,
  connectionString: '[REDACTED]',
  ssl: poolConfig.ssl
}));

export const pool = new Pool(poolConfig);

// Função para testar a conexão
async function testConnection() {
  let client;
  try {
    log('[DEBUG] Tentando estabelecer conexão com o banco...');
    client = await pool.connect();
    log('[DEBUG] Conexão estabelecida, executando query de teste...');
    
    const result = await client.query('SELECT NOW(), version(), current_database(), inet_server_addr() as server_ip');
    log('[SUCCESS] Conexão e query bem sucedidas: ' + JSON.stringify({
      timestamp: result.rows[0].now,
      version: result.rows[0].version,
      database: result.rows[0].current_database,
      server_ip: result.rows[0].server_ip
    }));
    
    return true;
  } catch (error) {
    log('[ERROR] Falha na conexão com o banco:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      log('[ERROR] Stack trace:', error.stack);
      // Tenta extrair mais informações do erro
      const errorObj = error as any;
      if (errorObj.code) log('[ERROR] Código do erro:', errorObj.code);
      if (errorObj.errno) log('[ERROR] Errno:', errorObj.errno);
      if (errorObj.syscall) log('[ERROR] Syscall:', errorObj.syscall);
      if (errorObj.address) log('[ERROR] Address:', errorObj.address);
      if (errorObj.port) log('[ERROR] Port:', errorObj.port);
    }
    return false;
  } finally {
    if (client) {
      log('[DEBUG] Liberando conexão...');
      client.release();
    }
  }
}

// Testar conexão ao inicializar
testConnection().then(success => {
  if (success) {
    log('[INFO] Inicialização do banco de dados concluída com sucesso');
  } else {
    log('[ERROR] Falha na inicialização do banco de dados');
  }
}).catch(err => {
  log('[ERROR] Erro não tratado durante inicialização:', err instanceof Error ? err.message : String(err));
  if (err instanceof Error && err.stack) {
    log('[ERROR] Stack completo:', err.stack);
  }
});

// Monitoramento do pool
setInterval(() => {
  const poolStatus = {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
  log('[DEBUG] Status do pool:', JSON.stringify(poolStatus));
}, 5000);

export const db = drizzle({ client: pool, schema });
