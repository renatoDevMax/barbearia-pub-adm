import { NextRequest, NextResponse } from 'next/server';
import connectDB, { getDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    console.log('Buscando usuários de todas as barbearias...');
    
    const todasBarbearias = [];
    
    // Buscar usuários de cada barbearia (01 a 05)
    for (let i = 1; i <= 5; i++) {
      const numeroBarbearia = i.toString().padStart(2, '0'); // 01, 02, 03, 04, 05
      const dbName = `barbeariapub-${numeroBarbearia}`;
      
      try {
        // Conectar ao banco específico da barbearia
        const db = getDB(dbName);
        const UserModel = db.model('User', User.schema);
        
        // Buscar todos os usuários ordenados por data de criação
        const usuarios = await UserModel.find({})
          .sort({ createdAt: -1 })
          .select('userName userEmail userPhone userDatas createdAt')
          .lean();
        
        if (usuarios.length > 0) {
          // Agrupar usuários por data de criação
          const usuariosPorData: { [key: string]: any[] } = {};
          
          usuarios.forEach(usuario => {
            // Usar a data de criação (createdAt) para agrupamento
            const data = new Date(usuario.createdAt as string);
            // Formatar para YYYY-MM-DD usando UTC para evitar problemas de fuso horário
            const dataFormatada = data.toISOString().split('T')[0]; // YYYY-MM-DD
            
            if (!usuariosPorData[dataFormatada]) {
              usuariosPorData[dataFormatada] = [];
            }
            
            usuariosPorData[dataFormatada].push(usuario);
          });
          
          // Converter para array e ordenar por data
          const usuariosAgrupados = Object.entries(usuariosPorData)
            .map(([data, usuarios]) => ({
              data,
              usuarios: usuarios.sort((a, b) => a.userName.localeCompare(b.userName))
            }))
            .sort((a, b) => b.data.localeCompare(a.data)); // Ordem decrescente (mais recente primeiro)
          
          todasBarbearias.push({
            barbearia: `Barbearia ${numeroBarbearia}`,
            dbName,
            usuariosPorData: usuariosAgrupados
          });
        }
      } catch (error) {
        console.error(`Erro ao buscar usuários da ${dbName}:`, error);
        // Continua para a próxima barbearia mesmo se uma falhar
      }
    }
    
    console.log(`Encontrados usuários em ${todasBarbearias.length} barbearias`);
    
    return NextResponse.json({ 
      success: true,
      barbearias: todasBarbearias
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
