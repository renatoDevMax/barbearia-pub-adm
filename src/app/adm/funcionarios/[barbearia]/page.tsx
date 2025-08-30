'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaUserTie, FaMoneyBillWave, FaCalendarAlt, FaClock, FaBars, FaPlus, FaTimes, FaSave, FaTrash } from 'react-icons/fa';

interface Funcionario {
  _id: string;
  nome: string;
  salarioBruto: number;
  inss: number;
  fgts: number;
  dataContratacao: string;
}

export default function FuncionariosPage() {
  const params = useParams();
  const barbearia = params.barbearia as string;
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalRemoverOpen, setIsModalRemoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string>('');
  const [formData, setFormData] = useState({
    nome: '',
    salarioBruto: '',
    inss: '20',
    fgts: '8',
    dataContratacao: ''
  });

  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/funcionarios/${barbearia}`);
        const data = await response.json();

        if (response.ok) {
          setFuncionarios(data.funcionarios);
        } else {
          setError(data.error || 'Erro ao carregar funcionários');
        }
      } catch (error) {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    if (barbearia) {
      fetchFuncionarios();
    }
  }, [barbearia]);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const formatarSalario = (salario: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(salario);
  };

  const calcularSalarioLiquido = (salarioBruto: number, inss: number, fgts: number) => {
    const descontoInss = (salarioBruto * inss) / 100;
    const descontoFgts = (salarioBruto * fgts) / 100;
    return salarioBruto - descontoInss - descontoFgts;
  };

  const handleAdicionarFuncionario = () => {
    setIsMenuOpen(false);
    setIsModalOpen(true);
  };

  const handleRemoverFuncionario = () => {
    setIsMenuOpen(false);
    setIsModalRemoverOpen(true);
    setFuncionarioSelecionado('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      nome: '',
      salarioBruto: '',
      inss: '20',
      fgts: '8',
      dataContratacao: ''
    });
  };

  const handleCloseModalRemover = () => {
    setIsModalRemoverOpen(false);
    setFuncionarioSelecionado('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-preenchimento para data de contratação
    if (name === 'dataContratacao') {
      // Remove tudo que não é dígito
      const digits = value.replace(/\D/g, '');
      
      // Aplica a formatação DD/MM/AAAA
      let formattedValue = '';
      if (digits.length >= 1) {
        formattedValue = digits.substring(0, 2);
      }
      if (digits.length >= 3) {
        formattedValue = digits.substring(0, 2) + '/' + digits.substring(2, 4);
      }
      if (digits.length >= 5) {
        formattedValue = digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4, 8);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
             const response = await fetch(`/api/funcionarios/${barbearia}`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(formData),
       });

      const data = await response.json();

      if (response.ok) {
        // Recarregar a lista de funcionários
        const funcionariosResponse = await fetch(`/api/funcionarios/${barbearia}`);
        const funcionariosData = await funcionariosResponse.json();
        
        if (funcionariosResponse.ok) {
          setFuncionarios(funcionariosData.funcionarios);
        }
        
        handleCloseModal();
        alert('Funcionário adicionado com sucesso!');
      } else {
        alert(data.error || 'Erro ao adicionar funcionário');
      }
    } catch (error) {
      alert('Erro de conexão');
         } finally {
       setIsSubmitting(false);
     }
   };

   const handleRemoverFuncionarioSubmit = async () => {
     if (!funcionarioSelecionado) {
       alert('Selecione um funcionário para remover');
       return;
     }

     try {
       setIsSubmitting(true);

       const response = await fetch(`/api/funcionarios/${barbearia}`, {
         method: 'DELETE',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ funcionarioId: funcionarioSelecionado }),
       });

       const data = await response.json();

       if (response.ok) {
         // Recarregar a lista de funcionários
         const funcionariosResponse = await fetch(`/api/funcionarios/${barbearia}`);
         const funcionariosData = await funcionariosResponse.json();

         if (funcionariosResponse.ok) {
           setFuncionarios(funcionariosData.funcionarios);
         }

         handleCloseModalRemover();
         alert('Funcionário removido com sucesso!');
       } else {
         alert(data.error || 'Erro ao remover funcionário');
       }
     } catch (error) {
       alert('Erro de conexão');
     } finally {
       setIsSubmitting(false);
     }
   };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <FaArrowLeft />
              <span>Voltar</span>
            </button>

            {/* Menu Hambúrguer */}
            <div className="relative menu-container">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <FaBars className="text-white text-lg" />
              </button>

                             {/* Dropdown Menu */}
               {isMenuOpen && (
                 <div className="absolute right-0 top-12 w-48 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-2xl z-50">
                   <div className="p-2 space-y-1">
                     <button
                       onClick={handleAdicionarFuncionario}
                       className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                     >
                       <FaPlus className="text-green-400" />
                       <span>Adicionar Funcionário</span>
                     </button>
                     <button
                       onClick={handleRemoverFuncionario}
                       className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                     >
                       <FaTrash className="text-red-400" />
                       <span>Remover Funcionário</span>
                     </button>
                   </div>
                 </div>
               )}
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
              FUNCIONÁRIOS
            </h1>
            <p className="text-gray-300 text-lg font-light tracking-wide">
              Barbearia {barbearia.toUpperCase()}
            </p>
            <div className="w-24 h-1 bg-white mx-auto mt-4 rounded-full"></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-white text-lg">Carregando funcionários...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg">{error}</div>
            </div>
          ) : funcionarios.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">Nenhum funcionário encontrado</div>
              <p className="text-gray-500 text-sm mt-2">
                Esta barbearia ainda não possui funcionários cadastrados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Estatísticas */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      Total de Funcionários
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {funcionarios.length} funcionário{funcionarios.length !== 1 ? 's' : ''} ativo{funcionarios.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{funcionarios.length}</div>
                    <div className="text-gray-400 text-sm">funcionários</div>
                  </div>
                </div>
              </div>

              {/* Lista de Funcionários */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {funcionarios.map((funcionario) => {
                  const salarioLiquido = calcularSalarioLiquido(
                    funcionario.salarioBruto,
                    funcionario.inss,
                    funcionario.fgts
                  );

                  return (
                    <div
                      key={funcionario._id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <FaUserTie className="text-2xl text-blue-400" />
                          <h3 className="text-white font-semibold text-lg">
                            {funcionario.nome}
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Salário */}
                        <div className="flex items-center gap-2">
                          <FaMoneyBillWave className="text-green-400" />
                          <div>
                            <p className="text-gray-300 text-sm">Salário Bruto</p>
                            <p className="text-white font-medium">
                              {formatarSalario(funcionario.salarioBruto)}
                            </p>
                          </div>
                        </div>

                        {/* Salário Líquido */}
                        <div className="flex items-center gap-2">
                          <FaMoneyBillWave className="text-green-500" />
                          <div>
                            <p className="text-gray-300 text-sm">Salário Líquido</p>
                            <p className="text-green-400 font-medium">
                              {formatarSalario(salarioLiquido)}
                            </p>
                          </div>
                        </div>

                        {/* Data de Contratação */}
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-blue-400" />
                          <div>
                            <p className="text-gray-300 text-sm">Contratado em</p>
                            <p className="text-white font-medium">
                              {funcionario.dataContratacao}
                            </p>
                          </div>
                        </div>

                        

                        {/* Descontos */}
                        <div className="bg-white/5 rounded p-3 mt-3">
                          <p className="text-gray-300 text-sm mb-2">Descontos:</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">INSS: {funcionario.inss}%</span>
                            <span className="text-gray-400">FGTS: {funcionario.fgts}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
                     )}
         </div>
       </div>

               {/* Modal Adicionar Funcionário */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                         <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl w-full max-w-md max-h-[600px] animate-fade-in flex flex-col">
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
                <h2 className="text-2xl font-bold text-white">Adicionar Funcionário</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Formulário com Scroll */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
               {/* Nome */}
               <div>
                 <label className="block text-gray-300 text-sm font-medium mb-2">
                   Nome Completo
                 </label>
                 <input
                   type="text"
                   name="nome"
                   value={formData.nome}
                   onChange={handleInputChange}
                   className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                   placeholder="Digite o nome completo"
                   required
                 />
               </div>

               {/* Salário Bruto */}
               <div>
                 <label className="block text-gray-300 text-sm font-medium mb-2">
                   Salário Bruto (R$)
                 </label>
                 <input
                   type="number"
                   name="salarioBruto"
                   value={formData.salarioBruto}
                   onChange={handleInputChange}
                   className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                   placeholder="0,00"
                   step="0.01"
                   min="0"
                   required
                 />
               </div>

               {/* INSS */}
               <div>
                 <label className="block text-gray-300 text-sm font-medium mb-2">
                   INSS (%)
                 </label>
                 <input
                   type="number"
                   name="inss"
                   value={formData.inss}
                   onChange={handleInputChange}
                   className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                   placeholder="0"
                   step="0.01"
                   min="0"
                   max="100"
                   required
                 />
               </div>

               {/* FGTS */}
               <div>
                 <label className="block text-gray-300 text-sm font-medium mb-2">
                   FGTS (%)
                 </label>
                 <input
                   type="number"
                   name="fgts"
                   value={formData.fgts}
                   onChange={handleInputChange}
                   className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                   placeholder="0"
                   step="0.01"
                   min="0"
                   max="100"
                   required
                 />
               </div>

                               {/* Data de Contratação */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Data de Contratação
                  </label>
                  <input
                    type="text"
                    name="dataContratacao"
                    value={formData.dataContratacao}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    required
                  />
                </div>

                             </form>

              {/* Botões - Fora do Scroll */}
              <div className="p-6 border-t border-white/20 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </div>
           </div>
         </div>
       )}

       {/* Modal Remover Funcionário */}
       {isModalRemoverOpen && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl w-full max-w-md animate-fade-in">
             {/* Header do Modal */}
             <div className="flex items-center justify-between p-6 border-b border-white/20">
               <h2 className="text-2xl font-bold text-white">Remover Funcionário</h2>
               <button
                 onClick={handleCloseModalRemover}
                 className="text-gray-400 hover:text-white transition-colors"
               >
                 <FaTimes className="text-xl" />
               </button>
             </div>

             {/* Conteúdo do Modal */}
             <div className="p-6">
               {funcionarios.length === 0 ? (
                 <div className="text-center py-8">
                   <div className="text-gray-400 text-lg">Nenhum funcionário para remover</div>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <p className="text-gray-300 text-sm">
                     Selecione o funcionário que deseja remover:
                   </p>
                   
                   {/* Lista de Funcionários */}
                   <div className="max-h-60 overflow-y-auto border border-white/20 rounded-lg">
                     {funcionarios.map((funcionario) => (
                       <button
                         key={funcionario._id}
                         onClick={() => setFuncionarioSelecionado(funcionario._id)}
                         className={`w-full text-left px-4 py-3 border-b border-white/10 last:border-b-0 transition-colors ${
                           funcionarioSelecionado === funcionario._id
                             ? 'bg-blue-600/20 text-white'
                             : 'text-gray-300 hover:bg-white/5'
                         }`}
                       >
                         <div className="flex items-center gap-3">
                           <FaUserTie className="text-blue-400" />
                           <span className="font-medium">{funcionario.nome}</span>
                         </div>
                       </button>
                     ))}
                   </div>

                   {/* Botões */}
                   <div className="flex gap-3 pt-4">
                     <button
                       type="button"
                       onClick={handleCloseModalRemover}
                       className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                       disabled={isSubmitting}
                     >
                       Cancelar
                     </button>
                     <button
                       type="button"
                       onClick={handleRemoverFuncionarioSubmit}
                       className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                       disabled={isSubmitting || !funcionarioSelecionado}
                     >
                       {isSubmitting ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           Removendo...
                         </>
                       ) : (
                         <>
                           <FaTrash />
                           Remover
                         </>
                       )}
                     </button>
                   </div>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
