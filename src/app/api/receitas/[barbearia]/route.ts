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
    const numeroBarbearia = barbearia.replace('barbearia', '');
    const dbName = `barbeariapub-${numeroBarbearia}`;

    console.log(`Buscando receitas da ${dbName}...`);

    const db = getDB(dbName);
    const CorteModel = db.model('Corte', Corte.schema);

    // Buscar todos os cortes confirmados e fechados para receita real
    const cortesReceita = await CorteModel.find({ 
      status: { $in: ['confirmado', 'fechado'] } 
    })
      .select('service data')
      .sort({ data: -1 })
      .lean();

    // Buscar todos os cortes agendados para expectativa
    const cortesExpectativa = await CorteModel.find({ status: 'agendado' })
      .select('service data')
      .sort({ data: -1 })
      .lean();

    // Função para calcular valor do serviço
    const calcularValorServico = (service: string) => {
      switch (service) {
        case 'cabelo':
          return 45.00;
        case 'cabelo e barba':
          return 65.00;
        default:
          return 0;
      }
    };

    // Função para verificar se uma data está em um período específico
    const isDataNoPeriodo = (data: Date, periodo: 'dia' | 'semana' | 'mes') => {
      const hoje = new Date();
      const dataCorte = new Date(data);
      
      switch (periodo) {
        case 'dia':
          return dataCorte.toDateString() === hoje.toDateString();
        case 'semana':
          const inicioSemana = new Date(hoje);
          inicioSemana.setDate(hoje.getDate() - hoje.getDay());
          inicioSemana.setHours(0, 0, 0, 0);
          const fimSemana = new Date(inicioSemana);
          fimSemana.setDate(inicioSemana.getDate() + 6);
          fimSemana.setHours(23, 59, 59, 999);
          return dataCorte >= inicioSemana && dataCorte <= fimSemana;
        case 'mes':
          return dataCorte.getMonth() === hoje.getMonth() && 
                 dataCorte.getFullYear() === hoje.getFullYear();
        default:
          return false;
      }
    };

    // Calcular receitas reais (confirmados + fechados)
    let receitaDiaria = 0;
    let receitaSemanal = 0;
    let receitaMensal = 0;
    let totalCortesDiarios = 0;
    let totalCortesSemanais = 0;
    let totalCortesMensais = 0;

    cortesReceita.forEach(corte => {
      const valor = calcularValorServico(corte.service);
      const dataCorte = new Date(corte.data);

      if (isDataNoPeriodo(dataCorte, 'dia')) {
        receitaDiaria += valor;
        totalCortesDiarios++;
      }
      
      if (isDataNoPeriodo(dataCorte, 'semana')) {
        receitaSemanal += valor;
        totalCortesSemanais++;
      }
      
      if (isDataNoPeriodo(dataCorte, 'mes')) {
        receitaMensal += valor;
        totalCortesMensais++;
      }
    });

    // Calcular expectativa de receita (agendados)
    let expectativaDiaria = 0;
    let expectativaSemanal = 0;
    let expectativaMensal = 0;
    let totalAgendadosDiarios = 0;
    let totalAgendadosSemanais = 0;
    let totalAgendadosMensais = 0;

    cortesExpectativa.forEach(corte => {
      const valor = calcularValorServico(corte.service);
      const dataCorte = new Date(corte.data);

      if (isDataNoPeriodo(dataCorte, 'dia')) {
        expectativaDiaria += valor;
        totalAgendadosDiarios++;
      }
      
      if (isDataNoPeriodo(dataCorte, 'semana')) {
        expectativaSemanal += valor;
        totalAgendadosSemanais++;
      }
      
      if (isDataNoPeriodo(dataCorte, 'mes')) {
        expectativaMensal += valor;
        totalAgendadosMensais++;
      }
    });

    console.log(`Receitas calculadas: Diária: R$ ${receitaDiaria}, Semanal: R$ ${receitaSemanal}, Mensal: R$ ${receitaMensal}`);
    console.log(`Expectativas calculadas: Diária: R$ ${expectativaDiaria}, Semanal: R$ ${expectativaSemanal}, Mensal: R$ ${expectativaMensal}`);

    return NextResponse.json({
      success: true,
      receitas: {
        diaria: {
          valor: receitaDiaria,
          quantidade: totalCortesDiarios
        },
        semanal: {
          valor: receitaSemanal,
          quantidade: totalCortesSemanais
        },
        mensal: {
          valor: receitaMensal,
          quantidade: totalCortesMensais
        }
      },
      expectativa: {
        diaria: {
          valor: expectativaDiaria,
          quantidade: totalAgendadosDiarios
        },
        semanal: {
          valor: expectativaSemanal,
          quantidade: totalAgendadosSemanais
        },
        mensal: {
          valor: expectativaMensal,
          quantidade: totalAgendadosMensais
        }
      },
      barbearia: dbName
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
