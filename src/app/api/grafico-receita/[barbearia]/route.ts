import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Corte from '@/models/Corte';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barbearia: string }> }
) {
  try {
    const { barbearia } = await params;
    const dbName = `barbeariapub-${barbearia.replace('barbearia', '')}`;

    // Conectar ao banco específico da barbearia
    const db = mongoose.connection.useDb(dbName);

    // Buscar todos os cortes confirmados e fechados dos últimos 30 dias
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    const CorteModel = db.model('Corte', Corte.schema);
    const cortes = await CorteModel.find({
      status: { $in: ['confirmado', 'fechado'] },
      data: { $gte: trintaDiasAtras.toISOString() }
    })
      .select('service data')
      .sort({ data: 1 })
      .lean();

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

    // Somar receitas dos cortes
    cortes.forEach(corte => {
      const dataFormatada = formatarData(corte.data as string);
      const valor = calcularValorServico(corte.service as string);
      receitasPorDia[dataFormatada] += valor;
    });

    // Converter para arrays para o gráfico
    const labels = Object.keys(receitasPorDia);
    const dados = Object.values(receitasPorDia);

    return NextResponse.json({
      success: true,
      labels,
      dados,
      totalCortes: cortes.length,
      barbearia: dbName
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
