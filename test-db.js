import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configuração do cliente Neon
const neonConfig = {
  webSocketConstructor: ws
};

const DATABASE_URL = 'postgresql://neondb_owner:npg_vTrWVjeqkf93@ep-muddy-bar-acg7auww-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function testConnection() {
  console.log('Iniciando teste de conexão...');
  console.log('URL do banco:', DATABASE_URL);

  const pool = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Tentando conectar ao banco de dados...');
    
    // Testar conexão básica
    const result = await pool.query('SELECT version()');
    console.log('Conexão estabelecida! Versão do PostgreSQL:', result.rows[0].version);

    // Verificar tabelas com mais detalhes
    const tables = await pool.query(`
      SELECT 
        table_name,
        table_schema,
        table_type
      FROM information_schema.tables 
      WHERE table_schema IN ('public')
      ORDER BY table_schema, table_name;
    `);
    
    console.log('\nTabelas encontradas:');
    tables.rows.forEach(table => {
      console.log('-', table.table_name, '(schema:', table.table_schema, ', tipo:', table.table_type, ')');
    });

    // Verificar estrutura de cada tabela
    for (const table of tables.rows) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position;
      `, [table.table_schema, table.table_name]);
      
      console.log(`\nEstrutura da tabela ${table.table_name}:`);
      columns.rows.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

  } catch (error) {
    console.error('Erro ao conectar:', error);
  } finally {
    await pool.end();
  }
}

testConnection(); 