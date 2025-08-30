import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null as any };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Removendo dbName para permitir acesso a múltiplos bancos
    };

    console.log('Tentando conectar ao MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Conectado ao MongoDB com sucesso!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null as any;
    console.error('Erro na conexão com MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

// Função utilitária para conectar a um banco específico
export function getDB(dbName: string) {
  return mongoose.connection.useDb(dbName);
}

export default connectDB;
