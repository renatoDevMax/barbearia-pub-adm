'use client';

import { useEffect, useState } from 'react';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';

interface Pontuacao {
  nome: string;
  pontos: number;
}

interface Barbearia {
  barbearia: string;
  dbName: string;
  pontuacoes: Pontuacao[];
  totalCortes: number;
}

export default function TodasPontuacoesPage() {
  const [barbearias, setBarbearias] = useState<Barbearia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openBarbearias, setOpenBarbearias] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTodasPontuacoes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/pontuacoes/todos');
        const data = await response.json();

        if (response.ok) {
          setBarbearias(data.barbearias);
        } else {
          setError(data.error || 'Erro ao carregar pontuações');
        }
      } catch (error) {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    fetchTodasPontuacoes();
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

  const getPosicao = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}º`;
  };

  const getPosicaoColor = (index: number) => {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-300';
    if (index === 2) return 'text-amber-600';
    return 'text-gray-400';
  };

  const getTotalPontuacoes = (barbearia: Barbearia) => {
    return barbearia.pontuacoes.length;
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
              TODAS AS PONTUAÇÕES
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
              <div className="text-white text-lg">Carregando pontuações...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg">{error}</div>
            </div>
          ) : barbearias.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">Nenhuma pontuação encontrada</div>
              <p className="text-gray-500 text-sm mt-2">
                Ainda não há cortes confirmados em nenhuma barbearia
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {barbearias.map((barbearia) => {
                const isOpen = openBarbearias.has(barbearia.dbName);
                const totalPontuacoes = getTotalPontuacoes(barbearia);
                
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
                          {totalPontuacoes} cliente{totalPontuacoes !== 1 ? 's' : ''} com pontuação
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">
                          {barbearia.totalCortes} cortes
                        </span>
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
                      </div>
                    </button>
                    
                    {/* Conteúdo do Acordeon */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-6">
                        <div className="space-y-3">
                          {barbearia.pontuacoes.map((pontuacao, index) => (
                            <div
                              key={pontuacao.nome}
                              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`text-xl font-bold ${getPosicaoColor(index)}`}>
                                    {getPosicao(index)}
                                  </div>
                                  <div>
                                    <h3 className="text-white font-semibold text-lg">
                                      {pontuacao.nome}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                      {pontuacao.pontos} corte{pontuacao.pontos !== 1 ? 's' : ''} confirmado{pontuacao.pontos !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaTrophy className="text-yellow-400 text-lg" />
                                  <span className="text-xl font-bold text-white">
                                    {pontuacao.pontos}
                                  </span>
                                  <span className="text-gray-400 text-sm">pts</span>
                                </div>
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
