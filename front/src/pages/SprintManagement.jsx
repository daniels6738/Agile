import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/SprintManagement.css';

const SprintManagement = () => {
  const navigate = useNavigate();
  const { id_projeto } = useParams();
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [membros, setMembros] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const projectId = id_projeto || Number(localStorage.getItem('id_projeto'));

  // Carregar colunas do projeto baseado nos status das tasks
  const carregarColunas = useCallback(() => {
    console.log('Carregando colunas com tasks:', sprintTasks); // Debug log
    
    // Sempre começar com as colunas padrão para garantir que todas sejam mostradas
    const colunasDefault = [
      { id: 1, name: 'A Fazer' },
      { id: 2, name: 'Em Andamento' },
      { id: 3, name: 'Em Revisão' },
      { id: 4, name: 'Concluído' }
    ];

    if (sprintTasks.length > 0) {
      // Obter todos os status únicos das tasks
      const statusUnicos = [...new Set(sprintTasks.map(task => task.status))].filter(Boolean);
      console.log('Status únicos encontrados:', statusUnicos); // Debug log
      
      // Criar um conjunto de todas as colunas (padrão + customizadas)
      const todasColunas = [...colunasDefault];
      
      // Adicionar colunas para status que não estão nas padrão
      statusUnicos.forEach(status => {
        const jaExiste = todasColunas.some(col => col.name === status);
        if (!jaExiste) {
          todasColunas.push({
            id: todasColunas.length + 1,
            name: status
          });
        }
      });
      
      console.log('Todas as colunas:', todasColunas); // Debug log
      setColumns(todasColunas);
    } else {
      // Se não há tasks, usar apenas as colunas padrão
      setColumns(colunasDefault);
    }
  }, [sprintTasks]);

  // Carregar sprints do projeto
  const carregarSprints = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/sprints/buscar-sprints-projeto/${projectId}`);
      if (!response.ok) throw new Error('Erro ao carregar sprints');
      const data = await response.json();
      setSprints(data);
      
      // Se há sprints, buscar a sprint atual
      if (data.length > 0) {
        const sprintAtualResponse = await fetch(`http://localhost:3000/sprints/buscar-sprint-atual/${projectId}`);
        if (sprintAtualResponse.ok) {
          const sprintAtual = await sprintAtualResponse.json();
          if (sprintAtual) {
            setSelectedSprint(sprintAtual);
          } else {
            // Se não há sprint atual, selecionar a primeira sprint
            setSelectedSprint(data[0]);
          }
        } else {
          setSelectedSprint(data[0]);
        }
      }
    } catch (err) {
      setError('Erro ao carregar sprints: ' + err.message);
    }
  }, [projectId]);

  // Carregar membros do projeto
  const carregarMembros = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/projetos/listar-membros/${projectId}`);
      if (!response.ok) throw new Error('Erro ao carregar membros');
      const data = await response.json();
      setMembros(data);
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
    }
  }, [projectId]);

  // Carregar tasks da sprint selecionada
  const carregarTasksDaSprint = useCallback(async (sprintId) => {
    if (!sprintId) {
      setSprintTasks([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/tasks/buscar-tasks-sprint/${sprintId}/${projectId}`);
      if (!response.ok) throw new Error('Erro ao carregar tasks');
      const data = await response.json();
      console.log('Tasks carregadas:', data); // Debug log
      console.log('Status das tasks:', data.map(task => task.status)); // Debug status values
      setSprintTasks(data);
    } catch (err) {
      setError('Erro ao carregar tasks: ' + err.message);
    }
  }, [projectId]);

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      await Promise.all([carregarSprints(), carregarMembros()]);
      setLoading(false);
    };
    initPage();
  }, [projectId, carregarSprints, carregarMembros]);

  useEffect(() => {
    if (selectedSprint) {
      carregarTasksDaSprint(selectedSprint.id);
    }
  }, [selectedSprint, carregarTasksDaSprint]);

  // Carregar colunas após as tasks serem carregadas
  useEffect(() => {
    carregarColunas();
  }, [carregarColunas]);

  // Obter nome do responsável
  const getNomeResponsavel = (id_responsavel) => {
    const membro = membros.find(m => m.id === id_responsavel);
    return membro ? membro.nome : 'Não atribuído';
  };

  // Formatear data
  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Verificar se a sprint está ativa
  const isSprintAtiva = (sprint) => {
    const hoje = new Date();
    const inicio = new Date(sprint.data_inicio);
    const fim = new Date(sprint.data_fim);
    return hoje >= inicio && hoje <= fim;
  };

  // Agrupar tasks por status usando as colunas reais
  const tasksPorStatus = {};
  columns.forEach(column => {
    const tasksNaColuna = sprintTasks.filter(task => task.status === column.name);
    tasksPorStatus[column.name] = tasksNaColuna;
    console.log(`Coluna "${column.name}": ${tasksNaColuna.length} tasks`, tasksNaColuna); // Debug log
  });
  
  // Debug log
  console.log('Columns:', columns);
  console.log('Sprint tasks:', sprintTasks);
  console.log('Tasks por status:', tasksPorStatus);

  if (loading) {
    return (
      <div className="sprint-container">
        <div className="sprint-loading">Carregando sprints...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sprint-container">
        <div className="sprint-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="sprint-container">
      <div className="sprint-header">
        <button 
          className="sprint-back-btn"
          onClick={() => navigate('/dashboard')}
        >
          ← Voltar ao Dashboard
        </button>
        <h1 className="sprint-title">Gerenciamento de Sprints</h1>
      </div>

      <div className="sprint-content">
        {/* Seletor de Sprint */}
        <div className="sprint-selector">
          <h2>Selecionar Sprint</h2>
          {sprints.length === 0 ? (
            <div className="no-sprints">
              <p>Nenhuma sprint encontrada para este projeto.</p>
              <button 
                className="create-sprint-btn"
                onClick={() => navigate('/dashboard')}
              >
                Criar Sprint no Dashboard
              </button>
            </div>
          ) : (
            <div className="sprint-list">
              {sprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className={`sprint-card ${selectedSprint?.id === sprint.id ? 'selected' : ''} ${isSprintAtiva(sprint) ? 'active' : ''}`}
                  onClick={() => setSelectedSprint(sprint)}
                >
                  <div className="sprint-card-header">
                    <h3>{sprint.nome}</h3>
                    {isSprintAtiva(sprint) && <span className="sprint-badge active">Ativa</span>}
                  </div>
                  <div className="sprint-card-dates">
                    <span>{formatarData(sprint.data_inicio)} - {formatarData(sprint.data_fim)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visualização das Tasks */}
        {selectedSprint && sprintTasks.length > 0 && (
          <div className="sprint-tasks-section">
            <div className="sprint-info">
              <h2>{selectedSprint.nome}</h2>
              <p className="sprint-dates">
                {formatarData(selectedSprint.data_inicio)} - {formatarData(selectedSprint.data_fim)}
              </p>
              <div className="sprint-stats">
                <span className="stat-item">
                  <strong>{sprintTasks.length}</strong> Total de tasks
                </span>
                <span className="stat-item">
                  <strong>{tasksPorStatus['Concluído']?.length || 0}</strong> Concluídas
                </span>
                <span className="stat-item">
                  <strong>{sprintTasks.reduce((sum, task) => sum + (Number(task.pontuacao) || 0), 0)}</strong> Total de pontos
                </span>
              </div>
            </div>

            <div className="sprint-board">
              {columns.map((column) => (
                <div key={column.id} className="status-column">
                  <div className="status-header">
                    <h3>{column.name}</h3>
                    <span className="task-count">{tasksPorStatus[column.name]?.length || 0}</span>
                  </div>
                  <div className="status-tasks">
                    {(tasksPorStatus[column.name] || []).map((task) => (
                      <div key={task.id} className="task-card">
                        <div className="task-title">{task.titulo}</div>
                        {task.descricao && (
                          <div className="task-description">{task.descricao}</div>
                        )}
                        <div className="task-meta">
                          <div className="task-responsavel">
                            {getNomeResponsavel(task.id_responsavel)}
                          </div>
                          {task.pontuacao && (
                            <div className="task-pontuacao">
                              {task.pontuacao} pts
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!tasksPorStatus[column.name] || tasksPorStatus[column.name].length === 0) && (
                      <div className="no-tasks">Nenhuma task neste status</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSprint && sprintTasks.length === 0 && (
          <div className="empty-sprint">
            <h2>{selectedSprint.nome}</h2>
            <p>Esta sprint não possui tasks associadas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintManagement;
