import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  telefone: {
    type: String,
    required: true
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'clientes'
});

// Modelo base sem especificar banco
const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', clienteSchema);

export default Cliente;
