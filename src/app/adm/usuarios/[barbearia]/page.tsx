'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

interface Usuario {
  _id: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userDatas: string[];
  createdAt: string;
}

interface UsuarioPorData {
  data: string;
  usuarios: Usuario[];
}

export default function UsuariosPage() {
  const params = useParams();
  const barbearia = params.barbearia as string;
  const [usuariosPorData, setUsuariosPorData] = useState<UsuarioPorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/usuarios/${barbearia}`);
        const data = await response.json();

        if (response.ok) {
          setUsuariosPorData(data.usuariosPorData);
        } else {
          setError(data.error || 'Erro ao carregar usuários');
        }
      } catch (error) {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    if (barbearia) {
      fetchUsuarios();
    }
  }, [barbearia]);

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

  const formatarTelefone = (telefone?: string) => {
    if (!telefone) return 'Não informado';
    return telefone;
  };

  const getTotalVisitas = (userDatas: string[]) => {
    return userDatas.length;
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
              USUÁRIOS
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
              <div className="text-white text-lg">Carregando usuários...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg">{error}</div>
            </div>
          ) : usuariosPorData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">Nenhum usuário encontrado</div>
            </div>
          ) : (
            <div className="space-y-6">
              {usuariosPorData.map((grupo) => (
                <div key={grupo.data} className="space-y-3">
                  {/* Header da Data */}
                  <div className="border-b border-white/20 pb-2">
                    <h2 className="text-xl font-semibold text-white capitalize">
                      {formatarData(grupo.data)}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {grupo.usuarios.length} usuário{grupo.usuarios.length !== 1 ? 's' : ''} cadastrado{grupo.usuarios.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {/* Lista de Usuários da Data */}
                  <div className="space-y-3 ml-4">
                    {grupo.usuarios.map((usuario) => (
                      <div
                        key={usuario._id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">
                            {usuario.userName}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            {usuario.userEmail}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {formatarTelefone(usuario.userPhone)}
                          </p>
                          <div className="mt-2">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {getTotalVisitas(usuario.userDatas)} visita{getTotalVisitas(usuario.userDatas) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
