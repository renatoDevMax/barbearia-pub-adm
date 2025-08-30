'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaMoneyBillWave, FaCalendarAlt, FaBars, FaPlus, FaTimes, FaSave, FaTrash, FaSync, FaUserTie } from 'react-icons/fa';

interface Despesa {
  _id: string;
  nome: string;
  valor: number;
  recorrencia: 'individual' | 'periodica';
  data: string;
}

interface Funcionario {
  _id: string;
  nome: string;
  salarioBruto: number;
}

export default function DespesasPage() {
  const params = useParams();
  const barbearia = params.barbearia as string;
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [totalSalarios, setTotalSalarios] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalRemoverOpen, setIsModalRemoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [despesaSelecionada, setDespesaSelecionada] = useState<string>('');
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    recorrencia: 'individual',
    data: ''
  });

  useEffect(() => {
    const fetchDespesas = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/despesas/${barbearia}`);
        const data = await response.json();

        if (response.ok) {
          setDespesas(data.despesas);
          setFuncionarios(data.funcionarios || []);
          setTotalSalarios(data.totalSalarios || 0);
        } else {
          setError(data.error || 'Erro ao carregar despesas');
        }
      } catch (error) {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    if (barbearia) {
      fetchDespesas();
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

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarDataPeriodica = (dataString: string) => {
    const data = new Date(dataString);
    const dia = data.getDate().toString().padStart(2, '0');
    return `${dia} / mês`;
  };

  const getMesAtual = () => {
    const hoje = new Date();
    return {
      ano: hoje.getFullYear(),
      mes: hoje.getMonth() + 1
    };
  };

  const isMesAtual = (dataString: string) => {
    const data = new Date(dataString);
    const mesAtual = getMesAtual();
    return data.getFullYear() === mesAtual.ano && (data.getMonth() + 1) === mesAtual.mes;
  };

  const filtrarDespesas = () => {
    const despesasPeriodicas = despesas.filter(despesa => despesa.recorrencia === 'periodica');
    const despesasIndividuais = despesas.filter(despesa => 
      despesa.recorrencia === 'individual' && isMesAtual(despesa.data)
    );
    
    return { despesasPeriodicas, despesasIndividuais };
  };

  const criarDespesaSalarios = () => {
    if (totalSalarios > 0) {
      return {
        _id: 'salarios-funcionarios',
        nome: 'Salários dos Funcionários',
        valor: totalSalarios,
        recorrencia: 'periodica' as const,
        data: new Date().toISOString(),
        isSalarios: true
      };
    }
    return null;
  };

  const getRecorrenciaText = (recorrencia: string) => {
    return recorrencia === 'individual' ? 'Individual' : 'Periódica';
  };

  const getRecorrenciaColor = (recorrencia: string) => {
    return recorrencia === 'individual' ? 'text-blue-400' : 'text-orange-400';
  };

  const calcularTotalDespesas = () => {
    const { despesasPeriodicas, despesasIndividuais } = filtrarDespesas();
    const totalPeriodicas = despesasPeriodicas.reduce((total, despesa) => total + despesa.valor, 0);
    const totalIndividuais = despesasIndividuais.reduce((total, despesa) => total + despesa.valor, 0);
    const totalSalarios = criarDespesaSalarios()?.valor || 0;
    return totalPeriodicas + totalIndividuais + totalSalarios;
  };

  const handleAdicionarDespesa = () => {
    setIsMenuOpen(false);
    setIsModalOpen(true);
  };

  const handleRemoverDespesa = () => {
    setIsMenuOpen(false);
    setIsModalRemoverOpen(true);
    setDespesaSelecionada('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      nome: '',
      valor: '',
      recorrencia: 'individual',
      data: ''
    });
  };

  const handleCloseModalRemover = () => {
    setIsModalRemoverOpen(false);
    setDespesaSelecionada('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/despesas/${barbearia}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Recarregar a lista de despesas
        const despesasResponse = await fetch(`/api/despesas/${barbearia}`);
        const despesasData = await despesasResponse.json();
        
        if (despesasResponse.ok) {
          setDespesas(despesasData.despesas);
        }
        
        handleCloseModal();
        alert('Despesa adicionada com sucesso!');
      } else {
        alert(data.error || 'Erro ao adicionar despesa');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoverDespesaSubmit = async () => {
    if (!despesaSelecionada) {
      alert('Selecione uma despesa para remover');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/despesas/${barbearia}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ despesaId: despesaSelecionada }),
      });

      const data = await response.json();

      if (response.ok) {
        // Recarregar a lista de despesas
        const despesasResponse = await fetch(`/api/despesas/${barbearia}`);
        const despesasData = await despesasResponse.json();

        if (despesasResponse.ok) {
          setDespesas(despesasData.despesas);
        }

        handleCloseModalRemover();
        alert('Despesa removida com sucesso!');
      } else {
        alert(data.error || 'Erro ao remover despesa');
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
                      onClick={handleAdicionarDespesa}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                    >
                      <FaPlus className="text-green-400" />
                      <span>Adicionar Despesa</span>
                    </button>
                    <button
                      onClick={handleRemoverDespesa}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                    >
                      <FaTrash className="text-red-400" />
                      <span>Remover Despesa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
              DESPESAS
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
              <div className="text-white text-lg">Carregando despesas...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg">{error}</div>
            </div>
          ) : despesas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">Nenhuma despesa encontrada</div>
              <p className="text-gray-500 text-sm mt-2">
                Esta barbearia ainda não possui despesas cadastradas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Estatísticas */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                                 {(() => {
                   const { despesasPeriodicas, despesasIndividuais } = filtrarDespesas();
                   const totalPeriodicas = despesasPeriodicas.reduce((total, despesa) => total + despesa.valor, 0);
                   const totalIndividuais = despesasIndividuais.reduce((total, despesa) => total + despesa.valor, 0);
                   const totalSalarios = criarDespesaSalarios()?.valor || 0;
                   const totalGeral = totalPeriodicas + totalIndividuais + totalSalarios;
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            Despesas do Mês
                          </h3>
                                                     <p className="text-gray-400 text-sm">
                             {despesasPeriodicas.length + despesasIndividuais.length + (totalSalarios > 0 ? 1 : 0)} despesa{(despesasPeriodicas.length + despesasIndividuais.length + (totalSalarios > 0 ? 1 : 0)) !== 1 ? 's' : ''} ativa{(despesasPeriodicas.length + despesasIndividuais.length + (totalSalarios > 0 ? 1 : 0)) !== 1 ? 's' : ''}
                           </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-400">
                            {formatarValor(totalGeral)}
                          </div>
                          <div className="text-gray-400 text-sm">total</div>
                        </div>
                      </div>
                      
                                             <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10">
                         <div className="text-center">
                           <div className="text-lg font-semibold text-orange-400">
                             {despesasPeriodicas.length + (totalSalarios > 0 ? 1 : 0)}
                           </div>
                           <div className="text-gray-400 text-sm">Periódicas</div>
                           <div className="text-orange-400 text-sm font-medium">
                             {formatarValor(totalPeriodicas + totalSalarios)}
                           </div>
                         </div>
                         <div className="text-center">
                           <div className="text-lg font-semibold text-blue-400">
                             {despesasIndividuais.length}
                           </div>
                           <div className="text-gray-400 text-sm">Individuais</div>
                           <div className="text-blue-400 text-sm font-medium">
                             {formatarValor(totalIndividuais)}
                           </div>
                         </div>
                         <div className="text-center">
                           <div className="text-lg font-semibold text-green-400">
                             {funcionarios.length}
                           </div>
                           <div className="text-gray-400 text-sm">Funcionários</div>
                           <div className="text-green-400 text-sm font-medium">
                             {formatarValor(totalSalarios)}
                           </div>
                         </div>
                       </div>
                    </div>
                  );
                })()}
              </div>

              {/* Lista de Despesas */}
              <div className="space-y-8">
                                 {(() => {
                   const { despesasPeriodicas, despesasIndividuais } = filtrarDespesas();
                   const despesaSalarios = criarDespesaSalarios();
                   const todasPeriodicas = despesaSalarios ? [despesaSalarios, ...despesasPeriodicas] : despesasPeriodicas;
                   
                   return (
                     <>
                       {/* Despesas Periódicas */}
                       {todasPeriodicas.length > 0 && (
                        <div>
                                                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                             <FaSync className="text-orange-400" />
                             Despesas Periódicas
                             <span className="text-orange-400 text-sm font-normal">
                               ({todasPeriodicas.length})
                             </span>
                           </h3>
                                                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                             {todasPeriodicas.map((despesa) => (
                                                             <div
                                 key={despesa._id}
                                 className={`bg-white/5 rounded-lg p-4 border hover:bg-white/10 transition-all duration-300 ${
                                   (despesa as any).isSalarios 
                                     ? 'border-green-400/20' 
                                     : 'border-orange-400/20'
                                 }`}
                               >
                                 <div className="flex items-start justify-between mb-3">
                                   <div className="flex items-center gap-3">
                                     <FaMoneyBillWave className={`text-2xl ${
                                       (despesa as any).isSalarios 
                                         ? 'text-green-400' 
                                         : 'text-orange-400'
                                     }`} />
                                     <h3 className="text-white font-semibold text-lg">
                                       {despesa.nome}
                                     </h3>
                                   </div>
                                 </div>

                                                                 <div className="space-y-3">
                                   {/* Valor */}
                                   <div className="flex items-center gap-2">
                                     <FaMoneyBillWave className={(despesa as any).isSalarios ? 'text-green-400' : 'text-orange-400'} />
                                     <div>
                                       <p className="text-gray-300 text-sm">Valor</p>
                                       <p className={`font-medium ${(despesa as any).isSalarios ? 'text-green-400' : 'text-orange-400'}`}>
                                         {formatarValor(despesa.valor)}
                                       </p>
                                     </div>
                                   </div>

                                   {/* Data Periódica ou Info dos Funcionários */}
                                   {(despesa as any).isSalarios ? (
                                     <div className="flex items-center gap-2">
                                       <FaUserTie className="text-green-400" />
                                       <div>
                                         <p className="text-gray-300 text-sm">Funcionários</p>
                                         <p className="text-green-400 font-medium">
                                           {funcionarios.length} funcionário{funcionarios.length !== 1 ? 's' : ''}
                                         </p>
                                       </div>
                                     </div>
                                   ) : (
                                     <div className="flex items-center gap-2">
                                       <FaCalendarAlt className="text-orange-400" />
                                       <div>
                                         <p className="text-gray-300 text-sm">Dia do Mês</p>
                                         <p className="text-orange-400 font-medium">
                                           {formatarDataPeriodica(despesa.data)}
                                         </p>
                                       </div>
                                     </div>
                                   )}
                                 </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Despesas Individuais */}
                      {despesasIndividuais.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-400" />
                            Despesas Individuais do Mês
                            <span className="text-blue-400 text-sm font-normal">
                              ({despesasIndividuais.length})
                            </span>
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {despesasIndividuais.map((despesa) => (
                              <div
                                key={despesa._id}
                                className="bg-white/5 rounded-lg p-4 border border-blue-400/20 hover:bg-white/10 transition-all duration-300"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <FaMoneyBillWave className="text-2xl text-blue-400" />
                                    <h3 className="text-white font-semibold text-lg">
                                      {despesa.nome}
                                    </h3>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {/* Valor */}
                                  <div className="flex items-center gap-2">
                                    <FaMoneyBillWave className="text-blue-400" />
                                    <div>
                                      <p className="text-gray-300 text-sm">Valor</p>
                                      <p className="text-blue-400 font-medium">
                                        {formatarValor(despesa.valor)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Data Individual */}
                                  <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-blue-400" />
                                    <div>
                                      <p className="text-gray-300 text-sm">Data</p>
                                      <p className="text-white font-medium">
                                        {formatarData(despesa.data)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                                             {/* Mensagem quando não há despesas */}
                       {todasPeriodicas.length === 0 && despesasIndividuais.length === 0 && (
                        <div className="text-center py-8">
                          <div className="text-gray-400 text-lg">Nenhuma despesa ativa este mês</div>
                          <p className="text-gray-500 text-sm mt-2">
                            Não há despesas periódicas ou individuais para o mês atual
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Modal Adicionar Despesa */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl w-full max-w-md max-h-[600px] animate-fade-in flex flex-col">
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
                <h2 className="text-2xl font-bold text-white">Adicionar Despesa</h2>
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
                    Nome da Despesa
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="Ex: Aluguel, Energia, Internet..."
                    required
                  />
                </div>

                {/* Valor */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                {/* Recorrência */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Recorrência
                  </label>
                  <select
                    name="recorrencia"
                    value={formData.recorrencia}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                    required
                  >
                    <option value="individual">Individual</option>
                    <option value="periodica">Periódica</option>
                  </select>
                </div>

                {/* Data */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    name="data"
                    value={formData.data}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
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

        {/* Modal Remover Despesa */}
        {isModalRemoverOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl w-full max-w-md animate-fade-in">
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white">Remover Despesa</h2>
                <button
                  onClick={handleCloseModalRemover}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6">
                {despesas.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg">Nenhuma despesa para remover</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300 text-sm">
                      Selecione a despesa que deseja remover:
                    </p>
                    
                    {/* Lista de Despesas */}
                    <div className="max-h-60 overflow-y-auto border border-white/20 rounded-lg">
                                             {(() => {
                         const { despesasPeriodicas, despesasIndividuais } = filtrarDespesas();
                         const todasDespesas = [...despesasPeriodicas, ...despesasIndividuais];
                         // Não incluir a despesa de salários no modal de remoção
                        
                        if (todasDespesas.length === 0) {
                          return (
                            <div className="p-4 text-center text-gray-400">
                              Nenhuma despesa ativa para remover
                            </div>
                          );
                        }
                        
                        return todasDespesas.map((despesa) => (
                          <button
                            key={despesa._id}
                            onClick={() => setDespesaSelecionada(despesa._id)}
                            className={`w-full text-left px-4 py-3 border-b border-white/10 last:border-b-0 transition-colors ${
                              despesaSelecionada === despesa._id
                                ? 'bg-blue-600/20 text-white'
                                : 'text-gray-300 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FaMoneyBillWave className={despesa.recorrencia === 'periodica' ? 'text-orange-400' : 'text-blue-400'} />
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{despesa.nome}</span>
                                  <span className={`text-xs ${despesa.recorrencia === 'periodica' ? 'text-orange-400' : 'text-blue-400'}`}>
                                    {despesa.recorrencia === 'periodica' ? 'Periódica' : 'Individual'}
                                  </span>
                                </div>
                              </div>
                              <span className={`font-medium ${despesa.recorrencia === 'periodica' ? 'text-orange-400' : 'text-blue-400'}`}>
                                {formatarValor(despesa.valor)}
                              </span>
                            </div>
                          </button>
                        ));
                      })()}
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
                        onClick={handleRemoverDespesaSubmit}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        disabled={isSubmitting || !despesaSelecionada}
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
    </div>
  );
}
