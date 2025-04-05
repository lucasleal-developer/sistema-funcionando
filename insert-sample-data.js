import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

const neonConfig = {
  webSocketConstructor: ws
};

const DATABASE_URL = 'postgresql://neondb_owner:npg_vTrWVjeqkf93@ep-muddy-bar-acg7auww-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function insertSampleData() {
  console.log('Iniciando inserção de dados de exemplo...');

  const pool = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Limpar dados existentes
    console.log('\nLimpando dados existentes...');
    await pool.query('TRUNCATE schedules, professionals, activity_types, time_slots CASCADE;');

    // Inserir tipos de atividade
    console.log('\nInserindo tipos de atividade...');
    await pool.query(`
      INSERT INTO activity_types (code, name, color) VALUES
      ('AULA', 'Aula', '#4CAF50'),
      ('REUNIAO', 'Reunião', '#2196F3'),
      ('PLANEJ', 'Planejamento', '#FFC107'),
      ('ATEND', 'Atendimento', '#9C27B0');
    `);

    // Inserir professores
    console.log('Inserindo professores...');
    await pool.query(`
      INSERT INTO professionals (name, initials, active) VALUES
      ('João Silva', 'JS', 1),
      ('Maria Santos', 'MS', 1),
      ('Pedro Oliveira', 'PO', 1),
      ('Ana Costa', 'AC', 1);
    `);

    // Inserir horários
    console.log('Inserindo slots de horário...');
    await pool.query(`
      INSERT INTO time_slots (start_time, end_time) VALUES
      ('07:00', '07:50'),
      ('07:50', '08:40'),
      ('08:40', '09:30'),
      ('09:50', '10:40'),
      ('10:40', '11:30'),
      ('11:30', '12:20');
    `);

    // Inserir algumas escalas
    console.log('Inserindo escalas...');
    
    // Primeiro, pegar IDs dos professores
    const profResult = await pool.query('SELECT id, name FROM professionals');
    const profs = profResult.rows;

    // Inserir escalas para cada professor
    for (const prof of profs) {
      await pool.query(`
        INSERT INTO schedules (professional_id, weekday, start_time, end_time, activity_code, location, notes) VALUES
        ($1, 'segunda', '07:00', '07:50', 'AULA', 'Sala 101', 'Matemática'),
        ($1, 'segunda', '07:50', '08:40', 'AULA', 'Sala 101', 'Matemática'),
        ($1, 'segunda', '08:40', '09:30', 'PLANEJ', 'Sala dos Professores', 'Planejamento semanal'),
        ($1, 'segunda', '09:50', '10:40', 'ATEND', 'Sala de Atendimento', 'Atendimento aos alunos')
      `, [prof.id]);
      
      console.log(`Escalas inseridas para ${prof.name}`);
    }

    console.log('\nDados de exemplo inseridos com sucesso!');

    // Verificar dados inseridos
    const counts = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM activity_types) as activity_types_count,
        (SELECT COUNT(*) FROM professionals) as professionals_count,
        (SELECT COUNT(*) FROM time_slots) as time_slots_count,
        (SELECT COUNT(*) FROM schedules) as schedules_count;
    `);

    console.log('\nQuantidade de registros em cada tabela:');
    console.log('- Tipos de atividade:', counts.rows[0].activity_types_count);
    console.log('- Professores:', counts.rows[0].professionals_count);
    console.log('- Slots de horário:', counts.rows[0].time_slots_count);
    console.log('- Escalas:', counts.rows[0].schedules_count);

  } catch (error) {
    console.error('Erro ao inserir dados:', error);
  } finally {
    await pool.end();
  }
}

insertSampleData(); 