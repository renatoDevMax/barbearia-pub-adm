import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Corte from '@/models/Corte';

export async function GET() {
  try {
    // Conectar ao MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Buscar todos os cortes confirmados e fechados dos últimos 30 dias de todas as barbearias
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    // Função para calcular valor do serviço
    const calcularValorServico = (service: string) => {
      return service === 'cabelo e barba' ? 65.00 : 45.00;
    };

    // Função para formatar data (DD/MM)
    const formatarData = (dataString: string) => {
      const data = new Date(dataString);
      const dia = data.getDate().toString().padStart(2, '0');
      const mes = (data.getMonth() + 1).toString().padStart(2, '0');
      return `${dia}/${mes}`;
    };

    // Agrupar receitas por dia
    const receitasPorDia: { [key: string]: number } = {};
    
    // Inicializar todos os dias dos últimos 30 dias com 0
    for (let i = 29; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - i);
      const dataFormatada = formatarData(data.toISOString());
      receitasPorDia[dataFormatada] = 0;
    }

    let totalCortes = 0;

    // Processar cada barbearia (01 a 05)
    for (let i = 1; i <= 5; i++) {
      const dbName = `barbeariapub-${i.toString().padStart(2, '0')}`;
      const db = mongoose.connection.useDb(dbName);

      try {
        const CorteModel = db.model('Corte', Corte.schema);
        const cortes = await CorteModel.find({
          status: { $in: ['confirmado', 'fechado'] },
          data: { $gte: trintaDiasAtras.toISOString() }
        })
          .select('service data')
          .sort({ data: 1 })
          .lean();

        // Somar receitas dos cortes desta barbearia
        cortes.forEach(corte => {
          const dataFormatada = formatarData(corte.data as string);
          const valor = calcularValorServico(corte.service as string);
          receitasPorDia[dataFormatada] += valor;
          totalCortes++;
        });

      } catch (error) {
        console.error(`Erro ao processar gráfico da barbearia ${dbName}:`, error);
        // Continua para a próxima barbearia
      }
    }

    // Converter para arrays para o gráfico
    const labels = Object.keys(receitasPorDia);
    const dados = Object.values(receitasPorDia);

    return NextResponse.json({
      success: true,
      labels,
      dados,
      totalCortes: totalCortes,
      barbearias: ['barbeariapub-01', 'barbeariapub-02', 'barbeariapub-03', 'barbeariapub-04', 'barbeariapub-05']
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar dados do gráfico de todas as barbearias:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
