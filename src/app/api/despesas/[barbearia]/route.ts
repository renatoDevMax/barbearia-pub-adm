import { NextRequest, NextResponse } from 'next/server';
import connectDB, { getDB } from '@/lib/mongodb';
import Despesa from '@/models/Despesa';
import Funcionario from '@/models/Funcionario';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barbearia: string }> }
) {
  try {
    await connectDB();

    const { barbearia } = await params;
    const numeroBarbearia = barbearia.replace('barbearia', '');
    const dbName = `barbeariapub-${numeroBarbearia}`;

    console.log(`Buscando despesas da ${dbName}...`);

    const db = getDB(dbName);
    const DespesaModel = db.model('Despesa', Despesa.schema);

    const despesas = await DespesaModel.find({})
      .sort({ data: -1, nome: 1 })
      .select('nome valor recorrencia data')
      .lean();

    // Buscar funcionários para calcular total de salários
    const FuncionarioModel = db.model('Funcionario', Funcionario.schema);
    const funcionarios = await FuncionarioModel.find({})
      .select('nome salarioBruto')
      .lean();

    const totalSalarios = funcionarios.reduce((total, funcionario) => total + funcionario.salarioBruto, 0);

    console.log(`Encontradas ${despesas.length} despesas e ${funcionarios.length} funcionários`);

    return NextResponse.json({
      success: true,
      despesas,
      funcionarios,
      totalSalarios,
      barbearia: dbName
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barbearia: string }> }
) {
  try {
    await connectDB();

    const { barbearia } = await params;
    const numeroBarbearia = barbearia.replace('barbearia', '');
    const dbName = `barbeariapub-${numeroBarbearia}`;

    const body = await request.json();
    const { nome, valor, recorrencia, data } = body;

    // Validação dos campos obrigatórios
    if (!nome || !valor || !recorrencia) {
      return NextResponse.json(
        { error: 'Nome, valor e recorrência são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`Criando despesa na ${dbName}...`);

    const db = getDB(dbName);
    const DespesaModel = db.model('Despesa', Despesa.schema);

    const novaDespesa = new DespesaModel({
      nome,
      valor: Number(valor),
      recorrencia,
      data: data ? new Date(data) : new Date()
    });

    await novaDespesa.save();

    console.log('Despesa criada com sucesso:', novaDespesa._id);

    return NextResponse.json({
      success: true,
      message: 'Despesa criada com sucesso',
      despesa: novaDespesa
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barbearia: string }> }
) {
  try {
    await connectDB();

    const { barbearia } = await params;
    const numeroBarbearia = barbearia.replace('barbearia', '');
    const dbName = `barbeariapub-${numeroBarbearia}`;

    const body = await request.json();
    const { despesaId } = body;

    if (!despesaId) {
      return NextResponse.json(
        { error: 'ID da despesa é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`Removendo despesa ${despesaId} da ${dbName}...`);

    const db = getDB(dbName);
    const DespesaModel = db.model('Despesa', Despesa.schema);

    const despesaRemovida = await DespesaModel.findByIdAndDelete(despesaId);

    if (!despesaRemovida) {
      return NextResponse.json(
        { error: 'Despesa não encontrada' },
        { status: 404 }
      );
    }

    console.log('Despesa removida com sucesso:', despesaRemovida._id);

    return NextResponse.json({
      success: true,
      message: 'Despesa removida com sucesso',
      despesa: despesaRemovida
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao remover despesa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
