'use client';

import { useEffect, useState } from 'react';
import { FaArrowLeft, FaMoneyBillWave, FaCalendarAlt, FaSync, FaUserTie } from 'react-icons/fa';

interface Despesa {
  _id: string;
  nome: string;
  valor: number;
  recorrencia: 'individual' | 'periodica';
  data: string;
  barbearia: string;
  barbeariaNumero: number;
}

interface Funcionario {
  _id: string;
  nome: string;
  salarioBruto: number;
  barbearia: string;
  barbeariaNumero: number;
}

export default function DespesasTodasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [totalSalarios, setTotalSalarios] = useState<number>(0);
  const [totalPeriodicas, setTotalPeriodicas] = useState<number>(0);
  const [totalIndividuais, setTotalIndividuais] = useState<number>(0);
  const [totalMensal, setTotalMensal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDespesas = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/despesas/todos');
        const data = await response.json();

        if (response.ok) {
          setDespesas(data.despesas);
          setFuncionarios(data.funcionarios || []);
          setTotalSalarios(data.totalSalarios || 0);
          setTotalPeriodicas(data.totalPeriodicas || 0);
          setTotalIndividuais(data.totalIndividuais || 0);
          setTotalMensal(data.totalMensal || 0);
        } else {
          setError(data.error || 'Erro ao carregar despesas');
        }
      } catch (error) {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    fetchDespesas();
  }, []);

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
        isSalarios: true,
        barbearia: 'Todas as Barbearias',
        barbeariaNumero: 0
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

  const getCorBarbearia = (numero: number) => {
    const cores = [
      'text-red-400',
      'text-blue-400', 
      'text-green-400',
      'text-yellow-400',
      'text-purple-400'
    ];
    return cores[(numero - 1) % cores.length];
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
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
              DESPESAS
            </h1>
            <p className="text-gray-300 text-lg font-light tracking-wide">
              TODAS AS BARBEARIAS
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
                Nenhuma barbearia possui despesas cadastradas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Estatísticas */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                {(() => {
                  const { despesasPeriodicas, despesasIndividuais } = filtrarDespesas();
                  const despesaSalarios = criarDespesaSalarios();

                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            Despesas do Mês - Todas as Barbearias
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {despesasPeriodicas.length + despesasIndividuais.length + (totalSalarios > 0 ? 1 : 0)} despesa{(despesasPeriodicas.length + despesasIndividuais.length + (totalSalarios > 0 ? 1 : 0)) !== 1 ? 's' : ''} ativa{(despesasPeriodicas.length + despesasIndividuais.length + (totalSalarios > 0 ? 1 : 0)) !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-400">
                            {formatarValor(totalMensal)}
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

                  
                  return (
                    <>
                      {/* Despesas Periódicas */}
                      {(despesasPeriodicas.length + (totalSalarios > 0 ? 1 : 0)) > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FaSync className="text-orange-400" />
                            Despesas Periódicas
                            <span className="text-orange-400 text-sm font-normal">
                              ({despesasPeriodicas.length + (totalSalarios > 0 ? 1 : 0)})
                            </span>
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {(despesaSalarios ? [despesaSalarios, ...despesasPeriodicas] : despesasPeriodicas).map((despesa) => (
                              <div
                                key={despesa._id}
                                                                 className={`bg-white/5 rounded-lg p-4 border hover:bg-white/10 transition-all duration-300 ${
                                   (despesa as Despesa & { isSalarios?: boolean }).isSalarios 
                                     ? 'border-green-400/20' 
                                     : 'border-orange-400/20'
                                 }`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <FaMoneyBillWave className={`text-2xl ${
                                      (despesa as Despesa & { isSalarios?: boolean }).isSalarios 
                                        ? 'text-green-400' 
                                        : 'text-orange-400'
                                    }`} />
                                    <div>
                                      <h3 className="text-white font-semibold text-lg">
                                        {despesa.nome}
                                      </h3>
                                      <p className={`text-sm font-medium ${
                                        (despesa as Despesa & { isSalarios?: boolean }).isSalarios 
                                          ? 'text-green-400' 
                                          : getCorBarbearia(despesa.barbeariaNumero)
                                      }`}>
                                        {despesa.barbearia}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {/* Valor */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-sm">Valor:</span>
                                    <span className={`font-bold text-lg ${
                                      (despesa as Despesa & { isSalarios?: boolean }).isSalarios 
                                        ? 'text-green-400' 
                                        : 'text-orange-400'
                                    }`}>
                                      {formatarValor(despesa.valor)}
                                    </span>
                                  </div>

                                  {/* Recorrência */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-sm">Tipo:</span>
                                    <span className={`font-medium ${getRecorrenciaColor(despesa.recorrencia)}`}>
                                      {getRecorrenciaText(despesa.recorrencia)}
                                    </span>
                                  </div>

                                  {/* Data */}
                                  <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-gray-400" />
                                    <span className="text-gray-300 text-sm">
                                      {formatarDataPeriodica(despesa.data)}
                                    </span>
                                  </div>
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
                            <FaMoneyBillWave className="text-blue-400" />
                            Despesas Individuais
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
                                    <div>
                                      <h3 className="text-white font-semibold text-lg">
                                        {despesa.nome}
                                      </h3>
                                      <p className={`text-sm font-medium ${getCorBarbearia(despesa.barbeariaNumero)}`}>
                                        {despesa.barbearia}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {/* Valor */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-sm">Valor:</span>
                                    <span className="font-bold text-lg text-blue-400">
                                      {formatarValor(despesa.valor)}
                                    </span>
                                  </div>

                                  {/* Recorrência */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-sm">Tipo:</span>
                                    <span className="font-medium text-blue-400">
                                      {getRecorrenciaText(despesa.recorrencia)}
                                    </span>
                                  </div>

                                  {/* Data */}
                                  <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-gray-400" />
                                    <span className="text-gray-300 text-sm">
                                      {formatarData(despesa.data)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Funcionários */}
                      {funcionarios.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FaUserTie className="text-green-400" />
                            Funcionários
                            <span className="text-green-400 text-sm font-normal">
                              ({funcionarios.length})
                            </span>
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {funcionarios.map((funcionario) => (
                              <div
                                key={funcionario._id}
                                className="bg-white/5 rounded-lg p-4 border border-green-400/20 hover:bg-white/10 transition-all duration-300"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <FaUserTie className="text-2xl text-green-400" />
                                    <div>
                                      <h3 className="text-white font-semibold text-lg">
                                        {funcionario.nome}
                                      </h3>
                                      <p className={`text-sm font-medium ${getCorBarbearia(funcionario.barbeariaNumero)}`}>
                                        {funcionario.barbearia}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {/* Salário */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-sm">Salário:</span>
                                    <span className="font-bold text-lg text-green-400">
                                      {formatarValor(funcionario.salarioBruto)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
