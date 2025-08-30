'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarDay, FaUsers, FaUserTie, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { LuWaypoints } from 'react-icons/lu';
import Accordion from '@/components/Accordion';
import SubListItem from '@/components/SubListItem';

export default function AdminPage() {
  const router = useRouter();
  
  // Estados para o acordeon Clientes
  const [isAgendamentosOpen, setIsAgendamentosOpen] = useState(false);
  const [isUsuariosOpen, setIsUsuariosOpen] = useState(false);
  const [isPontuacoesOpen, setIsPontuacoesOpen] = useState(false);
  
  // Estados para o acordeon Gestão
  const [isFuncionariosOpen, setIsFuncionariosOpen] = useState(false);
  const [isDespesasOpen, setIsDespesasOpen] = useState(false);
  const [isReceitasOpen, setIsReceitasOpen] = useState(false);

  // Handlers para Clientes
  const handleBarbeariaAgendamentos = (numero: string) => {
    console.log(`Navegando para agendamentos da Barbearia ${numero}...`);
    router.push(`/adm/agendamento/barbearia${numero}`);
  };

  const handleTodosAgendamentos = () => {
    console.log('Navegando para todos os agendamentos...');
    router.push('/adm/agendamento/todos');
  };

  const handleBarbeariaUsuarios = (numero: string) => {
    console.log(`Navegando para usuários da Barbearia ${numero}...`);
    router.push(`/adm/usuarios/barbearia${numero}`);
  };

  const handleTodosUsuarios = () => {
    console.log('Navegando para todos os usuários...');
    router.push('/adm/usuarios/todos');
  };

  const handleBarbeariaPontuacoes = (numero: string) => {
    console.log(`Navegando para pontuações da Barbearia ${numero}...`);
    router.push(`/adm/pontuacoes/barbearia${numero}`);
  };

  const handleTodosPontuacoes = () => {
    console.log('Navegando para todas as pontuações...');
    router.push('/adm/pontuacoes/todos');
  };

  // Handlers para Gestão
  const handleBarbeariaFuncionarios = (numero: string) => {
    console.log(`Navegando para funcionários da Barbearia ${numero}...`);
    router.push(`/adm/funcionarios/barbearia${numero}`);
  };

  const handleTodosFuncionarios = () => {
    router.push('/adm/funcionarios/todos');
  };

  const handleBarbeariaDespesas = (numero: string) => {
    router.push(`/adm/despesas/barbearia${numero}`);
  };

  const handleTodosDespesas = () => {
    router.push('/adm/despesas/todos');
  };

  const handleBarbeariaReceitas = (numero: string) => {
    router.push(`/adm/receitas/barbearia${numero}`);
  };

  const handleTodosReceitas = () => {
    router.push('/adm/receitas/todos');
  };

  const accordionItems = [
    {
      title: "Clientes",
      content: (
        <div className="space-y-2">
          {/* Agendamentos */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setIsAgendamentosOpen(!isAgendamentosOpen)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <FaCalendarDay className="text-2xl text-white group-hover:text-gray-200 transition-colors" />
                <span className="text-lg font-medium text-white group-hover:text-gray-200 transition-colors">
                  Agendamentos
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  isAgendamentosOpen ? 'rotate-180' : ''
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
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isAgendamentosOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-3">
                <div className="space-y-1">
                  <SubListItem
                    title="Barbearia 01"
                    onClick={() => handleBarbeariaAgendamentos('01')}
                  />
                  <SubListItem
                    title="Barbearia 02"
                    onClick={() => handleBarbeariaAgendamentos('02')}
                  />
                  <SubListItem
                    title="Barbearia 03"
                    onClick={() => handleBarbeariaAgendamentos('03')}
                  />
                  <SubListItem
                    title="Barbearia 04"
                    onClick={() => handleBarbeariaAgendamentos('04')}
                  />
                  <SubListItem
                    title="Barbearia 05"
                    onClick={() => handleBarbeariaAgendamentos('05')}
                  />
                  <SubListItem
                    title="Todos"
                    onClick={handleTodosAgendamentos}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Usuários */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setIsUsuariosOpen(!isUsuariosOpen)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <FaUsers className="text-2xl text-white group-hover:text-gray-200 transition-colors" />
                <span className="text-lg font-medium text-white group-hover:text-gray-200 transition-colors">
                  Usuários
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  isUsuariosOpen ? 'rotate-180' : ''
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
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isUsuariosOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-3">
                <div className="space-y-1">
                  <SubListItem
                    title="Barbearia 01"
                    onClick={() => handleBarbeariaUsuarios('01')}
                  />
                  <SubListItem
                    title="Barbearia 02"
                    onClick={() => handleBarbeariaUsuarios('02')}
                  />
                  <SubListItem
                    title="Barbearia 03"
                    onClick={() => handleBarbeariaUsuarios('03')}
                  />
                  <SubListItem
                    title="Barbearia 04"
                    onClick={() => handleBarbeariaUsuarios('04')}
                  />
                  <SubListItem
                    title="Barbearia 05"
                    onClick={() => handleBarbeariaUsuarios('05')}
                  />
                  <SubListItem
                    title="Todos"
                    onClick={handleTodosUsuarios}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pontuações */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setIsPontuacoesOpen(!isPontuacoesOpen)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <LuWaypoints className="text-2xl text-white group-hover:text-gray-200 transition-colors" />
                <span className="text-lg font-medium text-white group-hover:text-gray-200 transition-colors">
                  Pontuações
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  isPontuacoesOpen ? 'rotate-180' : ''
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
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isPontuacoesOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-3">
                <div className="space-y-1">
                  <SubListItem
                    title="Barbearia 01"
                    onClick={() => handleBarbeariaPontuacoes('01')}
                  />
                  <SubListItem
                    title="Barbearia 02"
                    onClick={() => handleBarbeariaPontuacoes('02')}
                  />
                  <SubListItem
                    title="Barbearia 03"
                    onClick={() => handleBarbeariaPontuacoes('03')}
                  />
                  <SubListItem
                    title="Barbearia 04"
                    onClick={() => handleBarbeariaPontuacoes('04')}
                  />
                  <SubListItem
                    title="Barbearia 05"
                    onClick={() => handleBarbeariaPontuacoes('05')}
                  />
                  <SubListItem
                    title="Todos"
                    onClick={handleTodosPontuacoes}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Gestão",
      content: (
        <div className="space-y-2">
          {/* Funcionários */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setIsFuncionariosOpen(!isFuncionariosOpen)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <FaUserTie className="text-2xl text-white group-hover:text-gray-200 transition-colors" />
                <span className="text-lg font-medium text-white group-hover:text-gray-200 transition-colors">
                  Funcionários
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  isFuncionariosOpen ? 'rotate-180' : ''
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
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isFuncionariosOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-3">
                <div className="space-y-1">
                  <SubListItem
                    title="Barbearia 01"
                    onClick={() => handleBarbeariaFuncionarios('01')}
                  />
                  <SubListItem
                    title="Barbearia 02"
                    onClick={() => handleBarbeariaFuncionarios('02')}
                  />
                  <SubListItem
                    title="Barbearia 03"
                    onClick={() => handleBarbeariaFuncionarios('03')}
                  />
                  <SubListItem
                    title="Barbearia 04"
                    onClick={() => handleBarbeariaFuncionarios('04')}
                  />
                  <SubListItem
                    title="Barbearia 05"
                    onClick={() => handleBarbeariaFuncionarios('05')}
                  />
                  <SubListItem
                    title="Todos"
                    onClick={handleTodosFuncionarios}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Despesas */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setIsDespesasOpen(!isDespesasOpen)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <FaMoneyBillWave className="text-2xl text-white group-hover:text-gray-200 transition-colors" />
                <span className="text-lg font-medium text-white group-hover:text-gray-200 transition-colors">
                  Despesas
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  isDespesasOpen ? 'rotate-180' : ''
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
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isDespesasOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-3">
                <div className="space-y-1">
                  <SubListItem
                    title="Barbearia 01"
                    onClick={() => handleBarbeariaDespesas('01')}
                  />
                  <SubListItem
                    title="Barbearia 02"
                    onClick={() => handleBarbeariaDespesas('02')}
                  />
                  <SubListItem
                    title="Barbearia 03"
                    onClick={() => handleBarbeariaDespesas('03')}
                  />
                  <SubListItem
                    title="Barbearia 04"
                    onClick={() => handleBarbeariaDespesas('04')}
                  />
                  <SubListItem
                    title="Barbearia 05"
                    onClick={() => handleBarbeariaDespesas('05')}
                  />
                  <SubListItem
                    title="Todos"
                    onClick={handleTodosDespesas}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Receitas */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setIsReceitasOpen(!isReceitasOpen)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <FaChartLine className="text-2xl text-white group-hover:text-gray-200 transition-colors" />
                <span className="text-lg font-medium text-white group-hover:text-gray-200 transition-colors">
                  Receitas
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-white transition-transform duration-300 ${
                  isReceitasOpen ? 'rotate-180' : ''
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
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isReceitasOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-3">
                <div className="space-y-1">
                  <SubListItem
                    title="Barbearia 01"
                    onClick={() => handleBarbeariaReceitas('01')}
                  />
                  <SubListItem
                    title="Barbearia 02"
                    onClick={() => handleBarbeariaReceitas('02')}
                  />
                  <SubListItem
                    title="Barbearia 03"
                    onClick={() => handleBarbeariaReceitas('03')}
                  />
                  <SubListItem
                    title="Barbearia 04"
                    onClick={() => handleBarbeariaReceitas('04')}
                  />
                  <SubListItem
                    title="Barbearia 05"
                    onClick={() => handleBarbeariaReceitas('05')}
                  />
                  <SubListItem
                    title="Todos"
                    onClick={handleTodosReceitas}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
            CENTRO ADMINISTRATIVO
          </h1>
          <p className="text-gray-300 text-lg font-light tracking-wide">
            Carlos Souza Barbearia Pub
          </p>
          <div className="w-24 h-1 bg-white mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Accordion */}
        <div className="animate-slide-up">
          <Accordion items={accordionItems} />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in-delayed">
          <p className="text-gray-400 text-sm">
            Sistema de Administração - Versão 1.0
          </p>
        </div>
      </div>
    </div>
  );
}
