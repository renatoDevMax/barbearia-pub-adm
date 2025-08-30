import { NextRequest, NextResponse } from 'next/server';
import connectDB, { getDB } from '@/lib/mongodb';
import Corte from '@/models/Corte';

export async function GET() {
  try {
    await connectDB();
    
    console.log('Buscando agendamentos de todas as barbearias...');
    
    const todasBarbearias = [];
    
    // Buscar agendamentos de cada barbearia (01 a 05)
    for (let i = 1; i <= 5; i++) {
      const numeroBarbearia = i.toString().padStart(2, '0'); // 01, 02, 03, 04, 05
      const dbName = `barbeariapub-${numeroBarbearia}`;
      
      try {
        // Conectar ao banco específico da barbearia
        const db = getDB(dbName);
        const CorteModel = db.model('Corte', Corte.schema);
        
        // Buscar apenas agendamentos com status "agendado" ordenados por data
        const agendamentos = await CorteModel.find({ status: 'agendado' })
          .sort({ data: 1 })
          .select('nome data status horario barbeiro service')
          .lean();
        
        if (agendamentos.length > 0) {
          // Agrupar agendamentos por data
          const agendamentosPorData: { [key: string]: any[] } = {};
          
          agendamentos.forEach(agendamento => {
            // Usar a data exatamente como está no banco, sem conversão de fuso horário
            const data = new Date(agendamento.data as string);
            // Formatar para YYYY-MM-DD usando UTC para evitar problemas de fuso horário
            const dataFormatada = data.toISOString().split('T')[0]; // YYYY-MM-DD
            
            if (!agendamentosPorData[dataFormatada]) {
              agendamentosPorData[dataFormatada] = [];
            }
            
            agendamentosPorData[dataFormatada].push(agendamento);
          });
          
          // Converter para array e ordenar por data
          const agendamentosAgrupados = Object.entries(agendamentosPorData)
            .map(([data, agendamentos]) => ({
              data,
              agendamentos: agendamentos.sort((a, b) => a.horario.localeCompare(b.horario))
            }))
            .sort((a, b) => a.data.localeCompare(b.data));
          
          todasBarbearias.push({
            barbearia: `Barbearia ${numeroBarbearia}`,
            dbName,
            agendamentosPorData: agendamentosAgrupados
          });
        }
      } catch (error) {
        console.error(`Erro ao buscar agendamentos da ${dbName}:`, error);
        // Continua para a próxima barbearia mesmo se uma falhar
      }
    }
    
    console.log(`Encontrados agendamentos em ${todasBarbearias.length} barbearias`);
    
    return NextResponse.json({ 
      success: true,
      barbearias: todasBarbearias
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
