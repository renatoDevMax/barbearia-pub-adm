import mongoose from 'mongoose';

const despesaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
  },
  valor: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
    min: [0, 'Valor não pode ser negativo'],
  },
  recorrencia: {
    type: String,
    required: [true, 'Recorrência é obrigatória'],
    enum: ['individual', 'periodica'],
    default: 'individual'
  },
  data: {
    type: Date,
    required: [true, 'Data é obrigatória'],
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'despesas'
});

const Despesa = mongoose.models.Despesa || mongoose.model('Despesa', despesaSchema);

export default Despesa;
