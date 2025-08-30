'use client';

import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

interface Agendamento {
  _id: string;
  nome: string;
  data: string;
  status: string;
  horario: string;
  barbeiro: string;
  service: string;
}

interface AgendamentoPorData {
  data: string;
  agendamentos: Agendamento[];
}

interface Barbearia {
  barbearia: string;
  dbName: string;
  agendamentosPorData: AgendamentoPorData[];
}

export default function TodosAgendamentosPage() {
  const [barbearias, setBarbearias] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openBarbearias, setOpenBarbearias] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTodosAgendamentos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/agendamentos/todos');
        const data = await response.json();

        if (response.ok) {
          setBarbearias(data.barbearias);
        } else {
          setError(data.error || 'Erro ao carregar agendamentos');
        }
      } catch (error) {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    fetchTodosAgendamentos();
  }, []);

  const toggleBarbearia = (dbName: string) => {
    const newOpenBarbearias = new Set(openBarbearias);
    if (newOpenBarbearias.has(dbName)) {
      newOpenBarbearias.delete(dbName);
    } else {
      newOpenBarbearias.add(dbName);
    }
    setOpenBarbearias(newOpenBarbearias);
  };

  const formatarData = (dataString: string) => {
    // A data já vem no formato YYYY-MM-DD da API, então vamos criar uma data UTC
    const [year, month, day] = dataString.split('-').map(Number);
    const data = new Date(Date.UTC(year, month - 1, day)); // month - 1 porque Date usa 0-11
    
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Força usar UTC para evitar conversão de fuso horário
    });
  };

  const formatarHorario = (horario: string) => {
    return horario;
  };

  const getTotalAgendamentos = (barbearia: Barbearia) => {
    return barbearia.agendamentosPorData.reduce((total, grupo) => total + grupo.agendamentos.length, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Voltar</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
              TODOS OS AGENDAMENTOS
            </h1>
            <p className="text-gray-300 text-lg font-light tracking-wide">
              Todas as Barbearias
            </p>
            <div className="w-24 h-1 bg-white mx-auto mt-4 rounded-full"></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-white text-lg">Carregando agendamentos...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg">{error}</div>
            </div>
          ) : barbearias.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">Nenhum agendamento encontrado</div>
            </div>
          ) : (
            <div className="space-y-4">
              {barbearias.map((barbearia) => {
                const isOpen = openBarbearias.has(barbearia.dbName);
                const totalAgendamentos = getTotalAgendamentos(barbearia);
                
                return (
                  <div key={barbearia.dbName} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                    {/* Header da Barbearia - Botão do Acordeon */}
                    <button
                      onClick={() => toggleBarbearia(barbearia.dbName)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white group-hover:text-gray-200 transition-colors">
                          {barbearia.barbearia}
                        </h2>
                        <span className="text-gray-400 text-sm">
                          {totalAgendamentos} agendamento{totalAgendamentos !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <svg
                        className={`w-6 h-6 text-white transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    
                    {/* Conteúdo do Acordeon */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-6">
                        <div className="space-y-6">
                          {barbearia.agendamentosPorData.map((grupo) => (
                            <div key={grupo.data} className="space-y-3">
                              {/* Header da Data */}
                              <div className="border-b border-white/10 pb-2">
                                <h3 className="text-lg font-semibold text-white capitalize">
                                  {formatarData(grupo.data)}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                  {grupo.agendamentos.length} agendamento{grupo.agendamentos.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              
                              {/* Lista de Agendamentos da Data */}
                              <div className="space-y-3 ml-4">
                                {grupo.agendamentos.map((agendamento) => (
                                  <div
                                    key={agendamento._id}
                                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="text-white font-semibold text-lg">
                                          {agendamento.nome}
                                        </h4>
                                        <p className="text-gray-300 text-sm">
                                          {formatarHorario(agendamento.horario)} • {agendamento.barbeiro}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                          {agendamento.service}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
