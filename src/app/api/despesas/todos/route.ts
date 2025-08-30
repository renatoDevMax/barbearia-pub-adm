import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Despesa from '@/models/Despesa';
import Funcionario from '@/models/Funcionario';

export async function GET(request: NextRequest) {
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

    // Arrays para armazenar dados de todas as barbearias
    const todasDespesas: any[] = [];
    const todosFuncionarios: any[] = [];
    let totalSalarios = 0;

    // Processar cada barbearia (01 a 05)
    for (let i = 1; i <= 5; i++) {
      const dbName = `barbeariapub-${i.toString().padStart(2, '0')}`;
      const db = mongoose.connection.useDb(dbName);

      try {
        // Buscar todas as despesas
        const DespesaModel = db.model('Despesa', Despesa.schema);
        const despesas = await DespesaModel.find({}).lean();

        // Buscar funcionários
        const FuncionarioModel = db.model('Funcionario', Funcionario.schema);
        const funcionarios = await FuncionarioModel.find({})
          .select('nome salarioBruto')
          .lean();

        // Adicionar identificador da barbearia e adicionar às listas
        despesas.forEach(despesa => {
          todasDespesas.push({
            ...despesa,
            barbearia: `Barbearia ${i.toString().padStart(2, '0')}`,
            barbeariaNumero: i
          });
        });

        funcionarios.forEach(funcionario => {
          todosFuncionarios.push({
            ...funcionario,
            barbearia: `Barbearia ${i.toString().padStart(2, '0')}`,
            barbeariaNumero: i
          });
          totalSalarios += funcionario.salarioBruto;
        });

      } catch (error) {
        console.error(`Erro ao processar despesas da barbearia ${dbName}:`, error);
        // Continua para a próxima barbearia
      }
    }

    // Filtrar despesas (mesma lógica da página de despesas)
    const despesasPeriodicas = todasDespesas.filter(despesa => despesa.recorrencia === 'periodica');
    const despesasIndividuais = todasDespesas.filter(despesa => 
      despesa.recorrencia === 'individual' && isMesAtual(despesa.data)
    );

    // Calcular totais
    const totalPeriodicas = despesasPeriodicas.reduce((total, despesa) => total + despesa.valor, 0);
    const totalIndividuais = despesasIndividuais.reduce((total, despesa) => total + despesa.valor, 0);
    const totalMensal = totalPeriodicas + totalIndividuais + totalSalarios;

    return NextResponse.json({
      success: true,
      despesas: todasDespesas,
      funcionarios: todosFuncionarios,
      totalSalarios: totalSalarios,
      totalPeriodicas: totalPeriodicas,
      totalIndividuais: totalIndividuais,
      totalMensal: totalMensal,
      barbearias: ['barbeariapub-01', 'barbeariapub-02', 'barbeariapub-03', 'barbeariapub-04', 'barbeariapub-05']
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar despesas de todas as barbearias:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
