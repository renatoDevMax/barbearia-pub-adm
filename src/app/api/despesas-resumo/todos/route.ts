import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Despesa from '@/models/Despesa';
import Funcionario from '@/models/Funcionario';

export async function GET() {
  try {
    // Conectar ao MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

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

    // Totais agregados de todas as barbearias
    let totalPeriodicas = 0;
    let totalIndividuais = 0;
    let totalSalarios = 0;
    let totalMensal = 0;

    // Processar cada barbearia (01 a 05)
    for (let i = 1; i <= 5; i++) {
      const dbName = `barbeariapub-${i.toString().padStart(2, '0')}`;
      const db = mongoose.connection.useDb(dbName);

      try {
        // Buscar todas as despesas
        const DespesaModel = db.model('Despesa', Despesa.schema);
        const todasDespesas = await DespesaModel.find({}).lean();

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

        // Somar valores desta barbearia
        const salariosBarbearia = funcionarios.reduce((total, funcionario) => total + (funcionario.salarioBruto as number), 0);
        const periodicasBarbearia = despesasPeriodicas.reduce((total, despesa) => total + (despesa.valor as number), 0);
        const individuaisBarbearia = despesasIndividuais.reduce((total, despesa) => total + (despesa.valor as number), 0);

        // Adicionar aos totais gerais
        totalSalarios += salariosBarbearia;
        totalPeriodicas += periodicasBarbearia;
        totalIndividuais += individuaisBarbearia;

      } catch (error) {
        console.error(`Erro ao processar despesas da barbearia ${dbName}:`, error);
        // Continua para a próxima barbearia
      }
    }

    // Calcular total mensal
    totalMensal = totalPeriodicas + totalIndividuais + totalSalarios;

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
      barbearias: ['barbeariapub-01', 'barbeariapub-02', 'barbeariapub-03', 'barbeariapub-04', 'barbeariapub-05']
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar resumo de despesas de todas as barbearias:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
