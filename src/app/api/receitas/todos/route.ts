import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Corte from '@/models/Corte';

export async function GET(request: NextRequest) {
  try {
    // Conectar ao MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Função para calcular valor do serviço
    const calcularValorServico = (service: string) => {
      return service === 'cabelo e barba' ? 65.00 : 45.00;
    };

    // Função para verificar se está no período
    const isDataNoPeriodo = (dataString: string, periodo: 'dia' | 'semana' | 'mes') => {
      const data = new Date(dataString);
      const hoje = new Date();
      
      switch (periodo) {
        case 'dia':
          return data.toDateString() === hoje.toDateString();
        case 'semana':
          const inicioSemana = new Date(hoje);
          inicioSemana.setDate(hoje.getDate() - hoje.getDay());
          inicioSemana.setHours(0, 0, 0, 0);
          const fimSemana = new Date(inicioSemana);
          fimSemana.setDate(inicioSemana.getDate() + 6);
          fimSemana.setHours(23, 59, 59, 999);
          return data >= inicioSemana && data <= fimSemana;
        case 'mes':
          return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
        default:
          return false;
      }
    };

    // Arrays para armazenar dados de todas as barbearias
    let receitaDiaria = 0;
    let receitaSemanal = 0;
    let receitaMensal = 0;
    let totalCortesDiarios = 0;
    let totalCortesSemanais = 0;
    let totalCortesMensais = 0;

    let expectativaDiaria = 0;
    let expectativaSemanal = 0;
    let expectativaMensal = 0;
    let totalAgendadosDiarios = 0;
    let totalAgendadosSemanais = 0;
    let totalAgendadosMensais = 0;

    // Processar cada barbearia (01 a 05)
    for (let i = 1; i <= 5; i++) {
      const dbName = `barbeariapub-${i.toString().padStart(2, '0')}`;
      const db = mongoose.connection.useDb(dbName);

      try {
        const CorteModel = db.model('Corte', Corte.schema);
        
        // Buscar cortes confirmados e fechados
        const cortesReceita = await CorteModel.find({
          status: { $in: ['confirmado', 'fechado'] }
        })
          .select('service data')
          .sort({ data: -1 })
          .lean();

        // Buscar cortes agendados
        const cortesExpectativa = await CorteModel.find({ status: 'agendado' })
          .select('service data')
          .sort({ data: -1 })
          .lean();

        // Processar receitas reais
        cortesReceita.forEach(corte => {
          const valor = calcularValorServico(corte.service);
          
          if (isDataNoPeriodo(corte.data, 'dia')) {
            receitaDiaria += valor;
            totalCortesDiarios++;
          }
          if (isDataNoPeriodo(corte.data, 'semana')) {
            receitaSemanal += valor;
            totalCortesSemanais++;
          }
          if (isDataNoPeriodo(corte.data, 'mes')) {
            receitaMensal += valor;
            totalCortesMensais++;
          }
        });

        // Processar expectativas
        cortesExpectativa.forEach(corte => {
          const valor = calcularValorServico(corte.service);
          
          if (isDataNoPeriodo(corte.data, 'dia')) {
            expectativaDiaria += valor;
            totalAgendadosDiarios++;
          }
          if (isDataNoPeriodo(corte.data, 'semana')) {
            expectativaSemanal += valor;
            totalAgendadosSemanais++;
          }
          if (isDataNoPeriodo(corte.data, 'mes')) {
            expectativaMensal += valor;
            totalAgendadosMensais++;
          }
        });

      } catch (error) {
        console.error(`Erro ao processar barbearia ${dbName}:`, error);
        // Continua para a próxima barbearia
      }
    }

    return NextResponse.json({
      success: true,
      receitas: {
        diaria: { valor: receitaDiaria, quantidade: totalCortesDiarios },
        semanal: { valor: receitaSemanal, quantidade: totalCortesSemanais },
        mensal: { valor: receitaMensal, quantidade: totalCortesMensais }
      },
      expectativa: {
        diaria: { valor: expectativaDiaria, quantidade: totalAgendadosDiarios },
        semanal: { valor: expectativaSemanal, quantidade: totalAgendadosSemanais },
        mensal: { valor: expectativaMensal, quantidade: totalAgendadosMensais }
      },
      barbearias: ['barbeariapub-01', 'barbeariapub-02', 'barbeariapub-03', 'barbeariapub-04', 'barbeariapub-05']
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar receitas de todas as barbearias:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
