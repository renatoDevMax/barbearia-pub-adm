'use client';

import { useEffect, useState } from 'react';
import { FaArrowLeft, FaMoneyBillWave, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaUsers, FaChartLine } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Receitas {
  diaria: {
    valor: number;
    quantidade: number;
  };
  semanal: {
    valor: number;
    quantidade: number;
  };
  mensal: {
    valor: number;
    quantidade: number;
  };
}

interface Expectativa {
  diaria: {
    valor: number;
    quantidade: number;
  };
  semanal: {
    valor: number;
    quantidade: number;
  };
  mensal: {
    valor: number;
    quantidade: number;
  };
}

interface DespesasResumo {
  totalPeriodicas: number;
  totalIndividuais: number;
  totalSalarios: number;
  totalMensal: number;
  custoDiario: number;
  diasNoMes: number;
}

interface GraficoData {
  labels: string[];
  dados: number[];
  totalCortes: number;
}

export default function ReceitasTodasPage() {
  const [receitas, setReceitas] = useState<Receitas | null>(null);
  const [expectativa, setExpectativa] = useState<Expectativa | null>(null);
  const [despesasResumo, setDespesasResumo] = useState<DespesasResumo | null>(null);
  const [graficoData, setGraficoData] = useState<GraficoData | null>(null);
  const [mostrarLucroLiquido, setMostrarLucroLiquido] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar receitas agregadas
        const receitasResponse = await fetch('/api/receitas/todos');
        const receitasData = await receitasResponse.json();

        // Buscar resumo de despesas agregadas
        const despesasResponse = await fetch('/api/despesas-resumo/todos');
        const despesasData = await despesasResponse.json();

        // Buscar dados do gráfico agregados
        const graficoResponse = await fetch('/api/grafico-receita/todos');
        const graficoData = await graficoResponse.json();

        if (receitasResponse.ok && despesasResponse.ok && graficoResponse.ok) {
          setReceitas(receitasData.receitas);
          setExpectativa(receitasData.expectativa);
          setDespesasResumo(despesasData);
          setGraficoData(graficoData);
        } else {
          setError('Erro ao carregar dados');
        }
      } catch (error) {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = () => {
    const hoje = new Date();
    return hoje.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDiaSemana = () => {
    const hoje = new Date();
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return dias[hoje.getDay()];
  };

  const getMesAtual = () => {
    const hoje = new Date();
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[hoje.getMonth()];
  };

  // Configuração do gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = mostrarLucroLiquido ? 'Lucro Líquido' : 'Receita';
            return `${label}: ${formatarValor(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        ticks: {
          color: '#fff',
          maxTicksLimit: 10
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        ticks: {
          color: '#fff',
          callback: function(value: any) {
            return `R$ ${value}`;
          }
        }
      }
    }
  };

  const chartData = graficoData ? {
    labels: graficoData.labels,
    datasets: [
      {
        label: mostrarLucroLiquido ? 'Lucro Líquido Diário' : 'Receita Diária',
        data: mostrarLucroLiquido && despesasResumo 
          ? graficoData.dados.map(valor => valor - despesasResumo.custoDiario)
          : graficoData.dados,
        borderColor: mostrarLucroLiquido && despesasResumo 
          ? graficoData.dados.map(valor => {
              const lucro = valor - despesasResumo.custoDiario;
              return lucro >= 0 ? '#10b981' : '#ef4444';
            })
          : '#10b981',
        backgroundColor: mostrarLucroLiquido && despesasResumo 
          ? graficoData.dados.map(valor => {
              const lucro = valor - despesasResumo.custoDiario;
              return lucro >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
            })
          : 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: mostrarLucroLiquido && despesasResumo 
          ? graficoData.dados.map(valor => {
              const lucro = valor - despesasResumo.custoDiario;
              return lucro >= 0 ? '#10b981' : '#ef4444';
            })
          : '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4
      }
    ]
  } : null;

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
              RECEITA DE SERVIÇOS
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
              <div className="text-white text-lg">Carregando receitas...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg">{error}</div>
            </div>
          ) : !receitas ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">Nenhuma receita encontrada</div>
              <p className="text-gray-500 text-sm mt-2">
                Nenhuma barbearia possui receitas registradas
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Data Atual */}
              <div className="text-center mb-8">
                <div className="text-white text-lg font-medium">
                  {getDiaSemana()}, {formatarData()}
                </div>
                <div className="text-gray-400 text-sm">
                  {getMesAtual()} {new Date().getFullYear()}
                </div>
              </div>

              {/* Painel de Receitas Reais Totais */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaMoneyBillWave className="text-green-400" />
                  Receitas Reais Totais
                  <span className="text-green-400 text-sm font-normal">
                    (Cortes Confirmados e Fechados)
                  </span>
                </h3>
                
                <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
                  {/* Receita Diária Total */}
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-400/20 hover:bg-green-500/15 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <FaCalendarDay className="text-2xl text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">Receita Diária</h3>
                          <p className="text-gray-400 text-sm">Hoje - Todas</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Valor Total</span>
                        <span className="text-green-400 font-bold text-xl">
                          {formatarValor(receitas.diaria.valor)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Cortes Realizados</span>
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-green-400" />
                          <span className="text-green-400 font-medium">
                            {receitas.diaria.quantidade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receita Semanal Total */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-400/20 hover:bg-blue-500/15 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <FaCalendarWeek className="text-2xl text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">Receita Semanal</h3>
                          <p className="text-gray-400 text-sm">Esta Semana - Todas</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Valor Total</span>
                        <span className="text-blue-400 font-bold text-xl">
                          {formatarValor(receitas.semanal.valor)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Cortes Realizados</span>
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-blue-400" />
                          <span className="text-blue-400 font-medium">
                            {receitas.semanal.quantidade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receita Mensal Total */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-400/20 hover:bg-purple-500/15 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <FaCalendarAlt className="text-2xl text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">Receita Mensal</h3>
                          <p className="text-gray-400 text-sm">{getMesAtual()} - Todas</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Valor Total</span>
                        <span className="text-purple-400 font-bold text-xl">
                          {formatarValor(receitas.mensal.valor)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Cortes Realizados</span>
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-purple-400" />
                          <span className="text-purple-400 font-medium">
                            {receitas.mensal.quantidade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total de Despesas Mensal */}
                  <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-6 border border-red-400/20 hover:bg-red-500/15 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <FaMoneyBillWave className="text-2xl text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">Despesas Mensal</h3>
                          <p className="text-gray-400 text-sm">Todas as Barbearias</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Total Geral</span>
                        <span className="text-red-400 font-bold text-xl">
                          {despesasResumo ? formatarValor(despesasResumo.totalMensal) : 'R$ 0,00'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Salários</span>
                        <span className="text-red-400 font-medium">
                          {despesasResumo ? formatarValor(despesasResumo.totalSalarios) : 'R$ 0,00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Custo Diário Médio */}
                  <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-400/20 hover:bg-orange-500/15 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <FaCalendarDay className="text-2xl text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">Custo Diário</h3>
                          <p className="text-gray-400 text-sm">Médio - Todas</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Por Dia</span>
                        <span className="text-orange-400 font-bold text-xl">
                          {despesasResumo ? formatarValor(despesasResumo.custoDiario) : 'R$ 0,00'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Dias no Mês</span>
                        <span className="text-orange-400 font-medium">
                          {despesasResumo ? despesasResumo.diasNoMes : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-white/10 mt-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <h3 className="text-white font-semibold text-lg mb-2">Receita Mensal</h3>
                      <div className="text-2xl font-bold text-green-400">
                        {formatarValor(receitas.mensal.valor)}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Cortes confirmados e fechados
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-white font-semibold text-lg mb-2">Despesas Mensal</h3>
                      <div className="text-2xl font-bold text-red-400">
                        {despesasResumo ? formatarValor(despesasResumo.totalMensal) : 'R$ 0,00'}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Inclui salários e despesas
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-white font-semibold text-lg mb-2">Lucro Líquido</h3>
                      <div className={`text-2xl font-bold ${despesasResumo && (receitas.mensal.valor - despesasResumo.totalMensal) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {despesasResumo ? formatarValor(receitas.mensal.valor - despesasResumo.totalMensal) : formatarValor(receitas.mensal.valor)}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Receita - Despesas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
                 </div>

         {/* Gráfico de Receita Diária */}
         {graficoData && chartData && (
           <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6 mt-8">
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <FaChartLine className="text-green-400" />
                   Receita Diária - Últimos 30 Dias (Todas as Barbearias)
                 </h3>
                 <div className="text-right">
                   <div className="text-sm text-gray-400">Total de Cortes</div>
                   <div className="text-lg font-bold text-green-400">{graficoData.totalCortes}</div>
                 </div>
               </div>
               
               <div className="h-80 w-full">
                 <Line data={chartData} options={chartOptions} />
               </div>
               
               <div className="text-center text-gray-400 text-sm">
                 <p>Eixo X: Dias do mês | Eixo Y: {mostrarLucroLiquido ? 'Lucro Líquido' : 'Receita'} em R$</p>
                 <p className="mt-1">Cabelo: R$ 45,00 | Cabelo e Barba: R$ 65,00</p>
               </div>
               
               {/* Checkbox para mostrar lucro líquido */}
               <div className="flex items-center justify-center pt-4 border-t border-white/10">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative">
                     <input
                       type="checkbox"
                       checked={mostrarLucroLiquido}
                       onChange={(e) => setMostrarLucroLiquido(e.target.checked)}
                       className="sr-only"
                     />
                     <div className={`w-6 h-6 rounded-md border-2 transition-all duration-300 ${
                       mostrarLucroLiquido 
                         ? 'bg-green-500 border-green-500' 
                         : 'border-white/30 group-hover:border-white/50'
                     }`}>
                       {mostrarLucroLiquido && (
                         <svg className="w-4 h-4 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                         </svg>
                       )}
                     </div>
                   </div>
                   <span className="text-white font-medium group-hover:text-green-400 transition-colors duration-300">
                     Deduzir despesas diárias (R$ {despesasResumo ? formatarValor(despesasResumo.custoDiario) : '0,00'}/dia)
                   </span>
                 </label>
               </div>
               
               {mostrarLucroLiquido && (
                 <div className="text-center text-sm">
                   <p className="text-green-400">🟢 Dias positivos: Lucro</p>
                   <p className="text-red-400">🔴 Dias negativos: Prejuízo</p>
                 </div>
               )}
             </div>
           </div>
         )}

         {/* Painel de Expectativa de Receita Total - Container Separado */}
         {expectativa && (
           <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6 mt-8">
             <div className="space-y-6">
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <FaMoneyBillWave className="text-yellow-400" />
                 Expectativa de Receita Total
                 <span className="text-yellow-400 text-sm font-normal">
                   (Cortes Agendados)
                 </span>
               </h3>
               
               <div className="grid gap-6 md:grid-cols-3">
                 {/* Expectativa Diária Total */}
                 <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl p-6 border border-yellow-400/20 hover:bg-yellow-500/15 transition-all duration-300">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                         <FaCalendarDay className="text-2xl text-yellow-400" />
                       </div>
                       <div>
                         <h3 className="text-white font-semibold text-lg">Expectativa Diária</h3>
                         <p className="text-gray-400 text-sm">Hoje - Todas</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-gray-300 text-sm">Valor Esperado</span>
                       <span className="text-yellow-400 font-bold text-xl">
                         {formatarValor(expectativa.diaria.valor)}
                       </span>
                     </div>
                     
                     <div className="flex items-center justify-between">
                       <span className="text-gray-300 text-sm">Cortes Agendados</span>
                       <div className="flex items-center gap-2">
                         <FaUsers className="text-yellow-400" />
                         <span className="text-yellow-400 font-medium">
                           {expectativa.diaria.quantidade}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Expectativa Semanal Total */}
                 <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-400/20 hover:bg-orange-500/15 transition-all duration-300">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                         <FaCalendarWeek className="text-2xl text-orange-400" />
                       </div>
                       <div>
                         <h3 className="text-white font-semibold text-lg">Expectativa Semanal</h3>
                         <p className="text-gray-400 text-sm">Esta Semana - Todas</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-gray-300 text-sm">Valor Esperado</span>
                       <span className="text-orange-400 font-bold text-xl">
                         {formatarValor(expectativa.semanal.valor)}
                       </span>
                     </div>
                     
                     <div className="flex items-center justify-between">
                       <span className="text-gray-300 text-sm">Cortes Agendados</span>
                       <div className="flex items-center gap-2">
                         <FaUsers className="text-orange-400" />
                         <span className="text-orange-400 font-medium">
                           {expectativa.semanal.quantidade}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Expectativa Mensal Total */}
                 <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-6 border border-red-400/20 hover:bg-red-500/15 transition-all duration-300">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                         <FaCalendarAlt className="text-2xl text-red-400" />
                       </div>
                       <div>
                         <h3 className="text-white font-semibold text-lg">Expectativa Mensal</h3>
                         <p className="text-gray-400 text-sm">{getMesAtual()} - Todas</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-gray-300 text-sm">Valor Esperado</span>
                       <span className="text-red-400 font-bold text-xl">
                         {formatarValor(expectativa.mensal.valor)}
                       </span>
                     </div>
                     
                     <div className="flex items-center justify-between">
                       <span className="text-gray-300 text-sm">Cortes Agendados</span>
                       <div className="flex items-center gap-2">
                         <FaUsers className="text-red-400" />
                         <span className="text-red-400 font-medium">
                           {expectativa.mensal.quantidade}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 }
