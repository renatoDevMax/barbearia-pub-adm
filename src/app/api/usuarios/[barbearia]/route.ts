import { NextRequest, NextResponse } from 'next/server';
import connectDB, { getDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barbearia: string }> }
) {
  try {
    await connectDB();
    
    const { barbearia } = await params;
    // Extrair apenas o número da barbearia (ex: "barbearia05" -> "05")
    const numeroBarbearia = barbearia.replace('barbearia', '');
    const dbName = `barbeariapub-${numeroBarbearia}`;
    
    console.log(`Buscando usuários da ${dbName}...`);
    
    // Conectar ao banco específico da barbearia
    const db = getDB(dbName);
    const UserModel = db.model('User', User.schema);
    
    // Buscar todos os usuários ordenados por data de criação
    const usuarios = await UserModel.find({})
      .sort({ createdAt: -1 })
      .select('userName userEmail userPhone userDatas createdAt')
      .lean();
    
    console.log(`Encontrados ${usuarios.length} usuários`);
    
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
    
    return NextResponse.json({ 
      success: true,
      usuariosPorData: usuariosAgrupados,
      barbearia: dbName
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
