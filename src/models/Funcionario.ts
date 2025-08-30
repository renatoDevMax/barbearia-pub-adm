import mongoose from 'mongoose';

const funcionarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  salarioBruto: {
    type: Number,
    required: true,
  },
  inss: {
    type: Number,
    required: true,
  },
  fgts: {
    type: Number,
    required: true,
  },
  dataContratacao: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  collection: 'funcionarios'
});

const Funcionario = mongoose.models.Funcionario || mongoose.model('Funcionario', funcionarioSchema);

export default Funcionario;
