import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

const neonConfig = {
  webSocketConstructor: ws
};

const DATABASE_URL = 'postgresql://neondb_owner:npg_vTrWVjeqkf93@ep-muddy-bar-acg7auww-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function insertProfessor() {
  console.log('Iniciando inserção de professor...');

  const pool = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Dados do professor
    const professor = {
      name: 'João da Silva',
      initials: 'JS',
      active: 1
    };

    console.log('Inserindo professor:', professor);

    // Inserir o professor
    const result = await pool.query(
      'INSERT INTO professionals (name, initials, active) VALUES ($1, $2, $3) RETURNING *',
      [professor.name, professor.initials, professor.active]
    );

    console.log('\nProfessor inserido com sucesso:');
    console.log(result.rows[0]);

    // Verificar todos os professores
    const allProfs = await pool.query('SELECT * FROM professionals ORDER BY name');
    
    console.log('\nLista de todos os professores:');
    allProfs.rows.forEach(prof => {
      console.log('-', prof.name, `(${prof.initials})`);
    });

  } catch (error) {
    console.error('Erro ao inserir professor:', error);
  } finally {
    await pool.end();
  }
}

insertProfessor(); 