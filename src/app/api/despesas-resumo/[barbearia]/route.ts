import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Despesa from '@/models/Despesa';
import Funcionario from '@/models/Funcionario';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barbearia: string }> }
) {
  try {
    const { barbearia } = await params;
    const dbName = `barbeariapub-${barbearia.replace('barbearia', '')}`;

    // Conectar ao banco específico da barbearia
    const db = mongoose.connection.useDb(dbName);

    // Buscar todas as despesas
    const DespesaModel = db.model('Despesa', Despesa.schema);
    const todasDespesas = await DespesaModel.find({}).lean();

    // Função para verificar se está no mês atual (mesma lógica da página de despesas)
    const getMesAtual = () => {
      const hoje = new Date();
      return {
        ano: hoje.getFullYear(),
        mes: hoje.getMonth() + 1
      };
    };

    const isMesAtual = (dataString: string) => {
      const data = new Date(dataString);
      const mesAtual = getMesAtual();
      return data.getFullYear() === mesAtual.ano && (data.getMonth() + 1) === mesAtual.mes;
    };

    // Filtrar despesas (mesma lógica da página de despesas)
    const despesasPeriodicas = todasDespesas.filter(despesa => despesa.recorrencia === 'periodica');
    const despesasIndividuais = todasDespesas.filter(despesa => 
      despesa.recorrencia === 'individual' && isMesAtual(despesa.data as string)
    );

    // Buscar funcionários para calcular total de salários
    const FuncionarioModel = db.model('Funcionario', Funcionario.schema);
    const funcionarios = await FuncionarioModel.find({})
      .select('nome salarioBruto')
      .lean();

    const totalSalarios = funcionarios.reduce((total, funcionario) => total + (funcionario.salarioBruto as number), 0);
    const totalPeriodicas = despesasPeriodicas.reduce((total, despesa) => total + (despesa.valor as number), 0);
    const totalIndividuais = despesasIndividuais.reduce((total, despesa) => total + (despesa.valor as number), 0);
    const totalMensal = totalPeriodicas + totalIndividuais + totalSalarios;

    // Calcular custo diário médio
    const hoje = new Date();
    const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    const custoDiario = totalMensal / diasNoMes;

    return NextResponse.json({
      success: true,
      totalPeriodicas: totalPeriodicas,
      totalIndividuais: totalIndividuais,
      totalSalarios: totalSalarios,
      totalMensal: totalMensal,
      custoDiario: custoDiario,
      diasNoMes: diasNoMes,
      barbearia: dbName
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar resumo de despesas:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
