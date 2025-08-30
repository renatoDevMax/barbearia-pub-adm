import { NextRequest, NextResponse } from 'next/server';
import connectDB, { getDB } from '@/lib/mongodb';
import Funcionario from '@/models/Funcionario';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barbearia: string }> }
) {
  try {
    await connectDB();

    const { barbearia } = await params;
    // Extrair apenas o número da barbearia (ex: "barbearia05" -> "05")
    const numeroBarbearia = barbearia.replace('barbearia', '');
    const dbName = `barbeariapub-${numeroBarbearia}`;

    console.log(`Buscando funcionários da ${dbName}...`);

    // Conectar ao banco específico da barbearia
    const db = getDB(dbName);
    const FuncionarioModel = db.model('Funcionario', Funcionario.schema);

    // Buscar todos os funcionários ordenados por nome
    const funcionarios = await FuncionarioModel.find({})
      .sort({ nome: 1 })
      .select('nome salarioBruto inss fgts dataContratacao')
      .lean();

    console.log(`Encontrados ${funcionarios.length} funcionários`);

    return NextResponse.json({
      success: true,
      funcionarios,
      barbearia: dbName
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
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
    const { nome, salarioBruto, inss, fgts, dataContratacao } = body;

    // Validação dos campos obrigatórios
    if (!nome || !salarioBruto || !inss || !fgts || !dataContratacao) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`Criando funcionário na ${dbName}...`);

    // Conectar ao banco específico da barbearia
    const db = getDB(dbName);
    const FuncionarioModel = db.model('Funcionario', Funcionario.schema);

    // Criar novo funcionário
    const novoFuncionario = new FuncionarioModel({
      nome,
      salarioBruto: Number(salarioBruto),
      inss: Number(inss),
      fgts: Number(fgts),
      dataContratacao
    });

    await novoFuncionario.save();

    console.log('Funcionário criado com sucesso:', novoFuncionario._id);

    return NextResponse.json({
      success: true,
      message: 'Funcionário criado com sucesso',
      funcionario: novoFuncionario
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
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
    const { funcionarioId } = body;

    if (!funcionarioId) {
      return NextResponse.json(
        { error: 'ID do funcionário é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`Removendo funcionário ${funcionarioId} da ${dbName}...`);

    const db = getDB(dbName);
    const FuncionarioModel = db.model('Funcionario', Funcionario.schema);

    const funcionarioRemovido = await FuncionarioModel.findByIdAndDelete(funcionarioId);

    if (!funcionarioRemovido) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    console.log('Funcionário removido com sucesso:', funcionarioRemovido._id);

    return NextResponse.json({
      success: true,
      message: 'Funcionário removido com sucesso',
      funcionario: funcionarioRemovido
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao remover funcionário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
