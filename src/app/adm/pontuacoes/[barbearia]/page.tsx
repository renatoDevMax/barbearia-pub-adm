'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';

interface Pontuacao {
  nome: string;
  pontos: number;
}

export default function PontuacoesPage() {
  const params = useParams();
  const barbearia = params.barbearia as string;
  const [pontuacoes, setPontuacoes] = useState<Pontuacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCortes, setTotalCortes] = useState(0);

  useEffect(() => {
    const fetchPontuacoes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/pontuacoes/${barbearia}`);
        const data = await response.json();

        if (response.ok) {
          setPontuacoes(data.pontuacoes);
          setTotalCortes(data.totalCortes);
        } else {
          setError(data.error || 'Erro ao carregar pontuações');
        }
      } catch (error) {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    if (barbearia) {
      fetchPontuacoes();
    }
  }, [barbearia]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
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
              PONTUAÇÕES
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
              <div className="text-white text-lg">Carregando pontuações...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg">{error}</div>
            </div>
          ) : pontuacoes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">Nenhuma pontuação encontrada</div>
              <p className="text-gray-500 text-sm mt-2">
                Ainda não há cortes confirmados nesta barbearia
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Estatísticas */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      Total de Cortes Confirmados
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {pontuacoes.length} cliente{pontuacoes.length !== 1 ? 's' : ''} com pontuação
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{totalCortes}</div>
                    <div className="text-gray-400 text-sm">cortes</div>
                  </div>
                </div>
              </div>

              {/* Lista de Pontuações */}
              <div className="space-y-3">
                {pontuacoes.map((pontuacao, index) => (
                  <div
                    key={pontuacao.nome}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${getPosicaoColor(index)}`}>
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
                        <FaTrophy className="text-yellow-400 text-xl" />
                        <span className="text-2xl font-bold text-white">
                          {pontuacao.pontos}
                        </span>
                        <span className="text-gray-400 text-sm">pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
