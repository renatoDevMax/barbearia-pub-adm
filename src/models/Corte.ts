import mongoose from 'mongoose';

const corteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
  },
  telefone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
  },
  status: {
    type: String,
    required: [true, 'Status é obrigatório'],
    enum: ['agendado', 'confirmado', 'cancelado', 'realizado'],
    default: 'agendado'
  },
  data: {
    type: Date,
    required: [true, 'Data é obrigatória'],
  },
  horario: {
    type: String,
    required: [true, 'Horário é obrigatório'],
  },
  barbeiro: {
    type: String,
    required: [true, 'Barbeiro é obrigatório'],
  },
  service: {
    type: String,
    required: [true, 'Serviço é obrigatório'],
    enum: ['cabelo', 'cabelo e barba'],
  },
  userId: {
    type: String,
    required: [true, 'ID do usuário é obrigatório'],
  }
}, {
  timestamps: true,
  collection: 'cortes'
});

const Corte = mongoose.models.Corte || mongoose.model('Corte', corteSchema);

export default Corte;
