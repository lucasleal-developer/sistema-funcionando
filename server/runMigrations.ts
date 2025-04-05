import { pool } from './db';
import { readFileSync } from 'fs';
import { log } from './vite';
import path from 'path';

export async function runMigrations() {
  try {
    log("Iniciando execução das migrações...");
    
    // Lê o arquivo de migrações
    const migrationsPath = path.join(process.cwd(), 'migrations.sql');
    const migrations = readFileSync(migrationsPath, 'utf8');
    
    // Executa as migrações
    await pool.query(migrations);
    
    log("Migrações executadas com sucesso!");
    return true;
  } catch (error) {
    log(`Erro ao executar migrações: ${error}`);
    return false;
  }
} 