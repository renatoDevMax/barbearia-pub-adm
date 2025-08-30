import { NextRequest, NextResponse } from 'next/server';
import connectDB, { getDB } from '@/lib/mongodb';
import Corte from '@/models/Corte';

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
    
    console.log(`Buscando pontuações da ${dbName}...`);
    
    // Conectar ao banco específico da barbearia
    const db = getDB(dbName);
    const CorteModel = db.model('Corte', Corte.schema);
    
    // Buscar apenas cortes com status "confirmado"
    const cortes = await CorteModel.find({ status: 'confirmado' })
      .select('nome')
      .lean();
    
    console.log(`Encontrados ${cortes.length} cortes confirmados`);
    
    // Calcular pontuações por usuário
    const pontuacoes: { [key: string]: number } = {};
    
    cortes.forEach(corte => {
      const nome = corte.nome as string;
      if (pontuacoes[nome]) {
        pontuacoes[nome]++;
      } else {
        pontuacoes[nome] = 1;
      }
    });
    
    // Converter para array e ordenar por pontuação (maior primeiro)
    const pontuacoesArray = Object.entries(pontuacoes)
      .map(([nome, pontos]) => ({
        nome,
        pontos
      }))
      .sort((a, b) => b.pontos - a.pontos); // Ordem decrescente por pontos
    
    return NextResponse.json({ 
      success: true,
      pontuacoes: pontuacoesArray,
      barbearia: dbName,
      totalCortes: cortes.length
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar pontuações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
