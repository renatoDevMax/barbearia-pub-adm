import { NextRequest, NextResponse } from 'next/server';
import connectDB, { getDB } from '@/lib/mongodb';
import UserAdm from '@/models/UserAdm';

export async function POST(request: NextRequest) {
  try {
    console.log('Iniciando autenticação...');
    
    const { username, password } = await request.json();
    console.log('Credenciais recebidas:', { username, password });

    // Verificação de fallback para teste
    if (username === 'Carlos Souza' && password === 'adm') {
      console.log('Login de teste bem-sucedido');
      return NextResponse.json(
        { 
          success: true, 
          message: 'Login realizado com sucesso (modo teste)',
          user: {
            userName: username
          }
        },
        { status: 200 }
      );
    }

    try {
      await connectDB();
      
      // Conectar ao banco específico
      const db = getDB('barbeariapub-adm');
      const UserAdmModel = db.model('UserAdm', UserAdm.schema);
      
      // Buscar o usuário no banco de dados
      console.log('Buscando usuário no banco barbeariapub-adm...');
      const user = await UserAdmModel.findOne({ 
        userName: username,
        pass: password 
      });

      console.log('Resultado da busca:', user);

      if (!user) {
        console.log('Usuário não encontrado');
        return NextResponse.json(
          { error: 'Credenciais inválidas' },
          { status: 401 }
        );
      }

      console.log('Login bem-sucedido para:', user.userName);
      // Login bem-sucedido
      return NextResponse.json(
        { 
          success: true, 
          message: 'Login realizado com sucesso',
          user: {
            userName: user.userName
          }
        },
        { status: 200 }
      );

    } catch (dbError) {
      console.error('Erro na conexão com banco:', dbError);
      return NextResponse.json(
        { error: 'Erro de conexão com banco de dados' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
