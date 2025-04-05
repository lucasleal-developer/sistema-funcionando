import { pool } from '../../server/db.js';

export default async function handler(req, res) {
  console.log('Iniciando endpoint /api/professionals');
  console.log('Método:', req.method);

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
    switch (req.method) {
      case 'GET':
        console.log('Buscando todos os professores...');
        const result = await pool.query('SELECT * FROM professionals ORDER BY name');
        console.log('Professores encontrados:', result.rows);
        return res.status(200).json(result.rows);

      case 'POST':
        console.log('Criando novo professor:', req.body);
        const { name, initials, active = 1 } = req.body;
        
        if (!name || !initials) {
          return res.status(400).json({ 
            error: 'Dados inválidos',
            details: 'Nome e iniciais são obrigatórios'
          });
        }

        const insertResult = await pool.query(
          'INSERT INTO professionals (name, initials, active) VALUES ($1, $2, $3) RETURNING *',
          [name, initials, active]
        );
        
        console.log('Professor criado:', insertResult.rows[0]);
        return res.status(201).json(insertResult.rows[0]);

      case 'PUT':
        console.log('Atualizando professor:', req.query.id);
        const id = Number(req.query.id);
        const updateData = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'ID não fornecido' });
        }

        const updateResult = await pool.query(
          'UPDATE professionals SET name = $1, initials = $2, active = $3 WHERE id = $4 RETURNING *',
          [updateData.name, updateData.initials, updateData.active, id]
        );

        if (updateResult.rows.length === 0) {
          return res.status(404).json({ error: 'Professor não encontrado' });
        }

        console.log('Professor atualizado:', updateResult.rows[0]);
        return res.status(200).json(updateResult.rows[0]);

      case 'DELETE':
        console.log('Excluindo professor:', req.query.id);
        const deleteId = Number(req.query.id);
        
        if (!deleteId) {
          return res.status(400).json({ error: 'ID não fornecido' });
        }

        const deleteResult = await pool.query(
          'DELETE FROM professionals WHERE id = $1 RETURNING *',
          [deleteId]
        );

        if (deleteResult.rows.length === 0) {
          return res.status(404).json({ error: 'Professor não encontrado' });
        }

        console.log('Professor excluído com sucesso');
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Método ${req.method} não permitido` });
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
} 