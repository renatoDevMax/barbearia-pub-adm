import { NextRequest, NextResponse } from 'next/server';
import connectDB, { getDB } from '@/lib/mongodb';
import Corte from '@/models/Corte';

export async function GET() {
  try {
    await connectDB();
    
    console.log('Buscando pontuações de todas as barbearias...');
    
    const todasBarbearias = [];
    
    // Buscar pontuações de cada barbearia (01 a 05)
    for (let i = 1; i <= 5; i++) {
      const numeroBarbearia = i.toString().padStart(2, '0'); // 01, 02, 03, 04, 05
      const dbName = `barbeariapub-${numeroBarbearia}`;
      
      try {
        // Conectar ao banco específico da barbearia
        const db = getDB(dbName);
        const CorteModel = db.model('Corte', Corte.schema);
        
        // Buscar apenas cortes com status "confirmado"
        const cortes = await CorteModel.find({ status: 'confirmado' })
          .select('nome')
          .lean();
        
        if (cortes.length > 0) {
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
          
          todasBarbearias.push({
            barbearia: `Barbearia ${numeroBarbearia}`,
            dbName,
            pontuacoes: pontuacoesArray,
            totalCortes: cortes.length
          });
        }
      } catch (error) {
        console.error(`Erro ao buscar pontuações da ${dbName}:`, error);
        // Continua para a próxima barbearia mesmo se uma falhar
      }
    }
    
    console.log(`Encontradas pontuações em ${todasBarbearias.length} barbearias`);
    
    return NextResponse.json({ 
      success: true,
      barbearias: todasBarbearias
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar pontuações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
