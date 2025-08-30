import { NextRequest, NextResponse } from 'next/server';
import connectDB, { getDB } from '@/lib/mongodb';
import Cliente from '@/models/Cliente';

export async function GET() {
  try {
    await connectDB();
    
    // Conectar ao banco barbeariapub-01
    const db = getDB('barbeariapub-01');
    const ClienteModel = db.model('Cliente', Cliente.schema);
    
    // Buscar todos os clientes
    const clientes = await ClienteModel.find({});
    
    return NextResponse.json({ clientes }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { nome, email, telefone } = await request.json();
    
    // Conectar ao banco barbeariapub-01
    const db = getDB('barbeariapub-01');
    const ClienteModel = db.model('Cliente', Cliente.schema);
    
    // Criar novo cliente
    const novoCliente = new ClienteModel({
      nome,
      email,
      telefone
    });
    
    await novoCliente.save();
    
    return NextResponse.json(
      { message: 'Cliente criado com sucesso', cliente: novoCliente },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
