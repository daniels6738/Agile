import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialColumns = [
  { id: 1, name: 'A Fazer', tickets: [] },
  { id: 2, name: 'Em Andamento', tickets: [] },
  { id: 3, name: 'Em Revisão', tickets: [] },
  { id: 4, name: 'Concluído', tickets: [] },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState(initialColumns);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showCriarSprint, setShowCriarSprint] = useState(false);
  const [showBurnDown, setShowBurnDown] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);  
  const [quantidadeVotos, setQuantidadeVotos] = useState(0);


  const [burndownImg, setBurndownImg] = useState(null);
  const [membros, setMembros] = useState([]);
  const [sprints, setSprints] = useState([]);
  const id_projeto = Number(localStorage.getItem('id_projeto'));
  const id_usuario_logado = Number(localStorage.getItem('id_usuario'));
  const [modalFields, setModalFields] = useState({
    id_sprint: null,
    titulo: '',
    descricao: '',
    id_responsavel: null,
    pontuacao: '',
    status: "A Fazer",
    nome_sprint: '',
    data_inicio: '',
    data_fim: ''

  });
  
  // Adiciona o item de gerenciamento de membros para Admins
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    // Checa se o usuário logado é admin neste projeto
    const id_usuario = Number(localStorage.getItem('id_usuario'));
    fetch(`http://localhost:3000/projetos/listar-projetos/${id_usuario}`)
      .then(res => res.json())
      .then(projetos => {
        const thisProject = projetos.find(p => p.id === id_projeto);
        setIsAdmin(thisProject?.funcao === 'Admin');
      });
  }, [id_projeto]);

  const sidebarItems = [
    { icon: '🏠', label: 'Dashboard' },
    { icon: '📝', label: 'Projetos', path: '/home' },
    { icon: '🏃‍♂️', label: 'Sprints', path: `/projeto/${id_projeto}/sprints` },
    ...(isAdmin ? [{ icon: '👥', label: 'Gerenciar Membros', path: `/projeto/${id_projeto}/membros` }] : []),
    { icon: '📅', label: 'NikoNiko Calendar', path: `/projeto/${id_projeto}/niko-niko` },
  ];

  const handleAddColumn = () => {
    if (newColumnName.trim() === '') return;
    setColumns([
      ...columns,
      { id: Date.now(), name: newColumnName, tickets: [] },
    ]);
    setNewColumnName('');
    setShowColumnModal(false);
  };

  const openTicketModal = () => {
    carregarMembros();
    carregarSprints();
    setShowTicketModal(true);
  }

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setModalFields({ 
      id_sprint: '',
      titulo: '', 
      descricao: '', 
      id_responsavel: '', 
      pontuacao: '',
    });
  };

  const openCriarSprint = () => setShowCriarSprint(true);
  
  const closeCriarSprint = () => {
    setShowCriarSprint(false);
    setModalFields({ 
      nome_sprint: '',
      data_inicio: '',
      data_fim: ''
    });
  };

  const openColumnModal = () => setShowColumnModal(true);

  const closeColumnModal = () => {
    setShowColumnModal(false);
    setNewColumnName('');
  };

  const openBurnDown = () => setShowBurnDown(true);

  const closeBurnDown = () => {
    setShowBurnDown(false);
    setBurndownImg(null);
    setModalFields({
      id_sprint: null
    });
  };

  const abrirModalEdicao = (ticket) => {
  setSelectedTicket(ticket);
  setModalFields({
    id_sprint: ticket.id_sprint || null,
    titulo: ticket.titulo || '',
    descricao: ticket.descricao || '',
    id_responsavel: ticket.id_responsavel || null,
    pontuacao: ticket.pontuacao || '',
    status: ticket.status || 'A Fazer',
  });
  setShowEditModal(true);
  carregarVotos(ticket.id);

  };

const fecharModalEdicao = () => {
  setSelectedTicket(null);
  setShowEditModal(false);
  carregarTasksDaSprint();
   setModalFields({
    id_sprint: null,
    titulo: '',
    descricao: '',
    id_responsavel: null,
    pontuacao: '',
    status: '',
  });
  };
 
  const handleCreateTicket = async () => {
  if (!modalFields.titulo.trim()) return;   

  const taskPayload = {
    id_projeto,
    id_sprint: modalFields.id_sprint || null,
    id_responsavel: modalFields.id_responsavel || null,
    titulo: modalFields.titulo,
    descricao: modalFields.descricao,
    status: modalFields.status || 'A Fazer',
  };

  try {
    // 1. Criar tarefa

    const response = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Erro ao criar tarefa');
      return;
    }

    // 2. Enviar pontuação 
    if (modalFields.pontuacao) {
      await fetch('http://localhost:3000/planning-poker/votar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_task: data.id,
          id_usuario: id_usuario_logado,
          valor_voto: Number(modalFields.pontuacao),
        }),
      });
    }
    await carregarTasksDaSprint();

    closeTicketModal();
    alert('Tarefa criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    alert('Erro na comunicação com o servidor.');
  }
  };



  const handleCriarBurnDown = async () => {
  if (!modalFields.id_sprint) {
    alert('Por favor, selecione uma sprint');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/burndown/criar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_sprint: Number(modalFields.id_sprint),
        width: 800,
        height: 400,
      }),
    });

    const data = await response.json(); 
    setBurndownImg(data.image);
  } catch (err) {
    console.error('Erro ao gerar gráfico:', err);
    alert('Erro ao gerar gráfico de Burndown');
  }
  };







 const handleCriarSprint = async () => {
  const { nome_sprint, data_inicio, data_fim } = modalFields;

  if (!nome_sprint || !data_inicio || !data_fim) {
    alert('Preencha todos os campos da sprint.');
    return;
  }

  // Convertendo a data para o formato "AAAA/MM/DD"
  const formatarData = (dataStr) => {
    const data = new Date(dataStr);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}/${mes}/${dia}`;
  };

  const payload = {
    id_projeto,
    nome: nome_sprint,
    data_inicio: formatarData(data_inicio),
    data_fim: formatarData(data_fim),
  };

  try {
    const response = await fetch('http://localhost:3000/sprints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      alert(data.message || 'Erro ao criar sprint.');
      return;
    }

    alert('Sprint criada com sucesso!');

    closeCriarSprint();
    
  } catch (error) {
    console.error('Erro ao criar sprint:', error);
    alert('Erro na comunicação com o servidor.');
  }
};


  const handleDragStart = (ticket, colId) => {
    setDraggedTicket({ ...ticket, fromColId: colId });
  };

  const handleColumnDragStart = (column) => {
    setDraggedColumn(column);
  };

  const handleColumnDragOver = (e, targetColumnId) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn.id !== targetColumnId) {
      setDragOverColumn(targetColumnId);
    }
  };

  const handleColumnDrop = (e, targetColumnId) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn.id === targetColumnId) {
      setDragOverColumn(null);
      return;
    }

    const draggedIndex = columns.findIndex(col => col.id === draggedColumn.id);
    const targetIndex = columns.findIndex(col => col.id === targetColumnId);
    
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, movedColumn);
    
    setColumns(newColumns);
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleTicketDrop = async (colId, colName) => {
  if (!draggedTicket) return;

  const updatedTicket = { ...draggedTicket, status: colName };
  delete updatedTicket.fromColId;

  try {
    // Atualiza o status no backend
    const res = await fetch(`http://localhost:3000/tasks/${draggedTicket.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: colName }),
    });

    if (!res.ok) {
      console.error('Erro ao atualizar status da tarefa');
      return;
    }

    // Atualiza no front-end
    setColumns(cols => {
      const newCols = cols.map(col =>
        col.id === draggedTicket.fromColId
          ? { ...col, tickets: col.tickets.filter(t => t.id !== draggedTicket.id) }
          : col
      );
      return newCols.map(col =>
        col.id === colId
          ? { ...col, tickets: [...col.tickets, updatedTicket] }
          : col
      );
    });

    setDraggedTicket(null);
  } catch (err) {
    console.error('Erro na requisição PATCH:', err);
  }
  };

  const handleVotar = async () => {
    try {
      await fetch(`http://localhost:3000/planning-poker/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_task: selectedTicket.id,
          id_usuario: id_usuario_logado, // já tem no localStorage
          valor_voto: Number(modalFields.pontuacao)
        })
      });
      alert('Voto enviado!');
      carregarVotos(selectedTicket.id); // Atualiza a quantidade de votos
    } catch {
      alert('Erro ao votar.');
    }
  };

const handleFinalizarVotacao = async () => {
  try {
    await fetch(`http://localhost:3000/planning-poker/concluir/${selectedTicket.id}`);
    alert('Votação finalizada!');
  } catch{
    alert('Erro ao finalizar votação.');
    }
  };

  const handleAtualizarTask = async () => {
    if (!selectedTicket || !selectedTicket.id) {
      alert('Tarefa não selecionada.');
      return;
    }

    const payload = {
      titulo: modalFields.titulo,
      descricao: modalFields.descricao,
      status: modalFields.status,
      pontuacao: modalFields.pontuacao,
      id_sprint: modalFields.id_sprint,
      id_responsavel: modalFields.id_responsavel,
    };

    try {
      const response = await fetch(`http://localhost:3000/tasks/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const erro = await response.json();
        alert(`Erro ao atualizar: ${erro.message || 'Erro desconhecido'}`);
        return;
      }

      alert('Tarefa atualizada com sucesso!');
      setShowEditModal(false);
      carregarTasksDaSprint();
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      alert('Erro na comunicação com o servidor.');
    }
  };

  const carregarMembros = async () => {
    try {
      const res = await fetch(`http://localhost:3000/projetos/listar-membros/${id_projeto}`);
      const data = await res.json(); // já vem [{ id: 1, nome: 'João' }, ...]
      setMembros(data);
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
    }
  };

  const carregarTasksDaSprint = async () => {
    try {
      const res = await fetch (`http://localhost:3000/sprints/buscar-sprint-atual/${id_projeto}`);
      const sprintAtual = await res.json();
      console.log(id_projeto, sprintAtual.id);

       if (!sprintAtual || !sprintAtual.id) {
        console.warn('Nenhuma sprint atual encontrada');
        return;
       }

      const consulta = await fetch(`http://localhost:3000/tasks/buscar-tasks-sprint/${sprintAtual.id}/${id_projeto}`);
      const tasks = await consulta.json();

      const colunasAtualizadas = initialColumns.map((coluna) => ({
        ...coluna,
        tickets: tasks.filter((task) => task.status === coluna.name),
      }));

      setColumns(colunasAtualizadas);
    } catch (err) {
      console.error('Erro ao carregar tasks:', err);
    }
  };

  const carregarSprints = async () => {
    try {
    
      const res = await fetch(`http://localhost:3000/sprints/buscar-sprints-projeto/${id_projeto}`);
      const data = await res.json(); 
      setSprints(data);
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
    }

  };

  const carregarVotos = async (id_task) => {
    try {
      const res = await fetch(`http://localhost:3000/planning-poker/${id_task}`);
      const data = await res.json();
      setQuantidadeVotos(data.quantidade || 0); 
    } catch (err) {
      console.error("Erro ao buscar votos:", err);
      setQuantidadeVotos(0);
    }
  };


  const [totalTaskLoad, setTotalTaskLoad] = useState(0);

  useEffect(() => {
    // Fetch current sprint for the project
    const fetchCurrentSprintAndLoad = async () => {
      try {
        const sprintRes = await fetch(`http://localhost:3000/sprints/buscar-sprint-atual/${id_projeto}`);
        const sprintData = await sprintRes.json();
        if (sprintData && sprintData.id) {
          // Fetch total task load for user in current sprint
          const loadRes = await fetch(`http://localhost:3000/sprints/estatistica-usuario/${sprintData.id}/${id_usuario_logado}`);
          const loadData = await loadRes.json();
          setTotalTaskLoad(loadData.total || 0);
        } else {
          setTotalTaskLoad(0);
        }
      } catch{
        setTotalTaskLoad(0);
      }
    };
    fetchCurrentSprintAndLoad();
  }, [id_projeto, id_usuario_logado]);

  useEffect(() => {
  carregarMembros();
  carregarTasksDaSprint();
  carregarSprints();
}, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: '#232946',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        minHeight: '100vh'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          letterSpacing: '1px'
        }}>Agile Board</div>
        <nav>
          {sidebarItems.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '0.7rem 0.5rem',
              borderRadius: '8px',
              cursor: item.path ? 'pointer' : 'default',
              transition: 'background 0.2s'
            }}
            onClick={() => item.path && navigate(item.path)}
            onMouseEnter={(e) => item.path && (e.currentTarget.style.background = '#393e6e')}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ fontSize: '1rem' }}>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      <main style={{
        flex: 1,
        padding: '2rem 2rem 2rem 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={openColumnModal} 
              style={{
                padding: '0.5rem 1.2rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: '#eebbc3',
                color: '#232946'
              }}
            >
              Adicionar coluna
            </button>
            <button 
              onClick={openTicketModal} 
              style={{
                padding: '0.5rem 1.2rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: '#232946',
                color: '#fff'
              }}
            >
              Criar ticket
            </button>
            <button 
              onClick={openCriarSprint} 
              style={{
                padding: '0.5rem 1.2rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: '#232946',
                color: '#fff'
              }}
            >
              Criar Sprint
            </button>

              <button 
              onClick={openBurnDown} 
              style={{
                padding: '0.5rem 1.2rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: '#232946',
                color: '#fff'
              }}
            >
              Gerar BurnDown
            </button>
          </div>

          {/* Nova seção no cabeçalho do dashboard */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div className="task-load-info" style={{ background: '#eebbc3', color: '#232946', borderRadius: '8px', padding: '0.7rem 1.2rem', fontWeight: 'bold', minWidth: '180px', textAlign: 'center' }}>
              <span>Total de Pontuação atribuída a você nesta sprint:</span>
              <div style={{ fontSize: '1.3rem', marginTop: '0.3rem' }}>{totalTaskLoad}</div>
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          minWidth: '100%',
          width: 'fit-content',
          minHeight: '70vh'
        }}>
          {columns.map(col => (
            <div
              key={col.id}
              draggable={!draggedTicket}
              onDragStart={(e) => {
                if (draggedTicket) {
                  e.preventDefault();
                  return;
                }
                handleColumnDragStart(col);
              }}
              onDragOver={(e) => handleColumnDragOver(e, col.id)}
              onDrop={(e) => handleColumnDrop(e, col.id)}
              style={{
                background: '#fff',
                borderRadius: '10px',
                boxShadow: dragOverColumn === col.id 
                  ? '0 4px 16px rgba(35, 41, 70, 0.3)' 
                  : '0 2px 8px rgba(0,0,0,0.07)',
                minWidth: '270px',
                maxWidth: '300px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                height: 'fit-content',
                maxHeight: '70vh',
                opacity: draggedColumn?.id === col.id ? 0.5 : 1,
                transform: dragOverColumn === col.id ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
                cursor: 'move'
              }}
            >
              <div style={{
                fontWeight: 'bold',
                fontSize: '1.1rem',
                marginBottom: '1rem',
                color: '#232946',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'move'
              }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>⋮⋮</span>
                {col.name}
              </div>
              
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  overflowY: 'auto',
                  maxHeight: 'calc(70vh - 4rem)',
                  paddingRight: '0.5rem',
                  minHeight: '200px'
                }}
                onDragOver={(e) => {
                  if (draggedTicket) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                onDrop={(e) => {
                  if (draggedTicket) {
                    e.stopPropagation();
                    handleTicketDrop(col.id, col.name);
                  }
                }}
              >
                {col.tickets.map(ticket => (
                  <div
                    key={ticket.id}
                    style={{
                      background: '#eebbc3',
                      color: '#232946',
                      borderRadius: '8px',
                      padding: '0.8rem 0.7rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      cursor: 'grab',
                      transition: 'box-shadow 0.2s'
                    }}
                    draggable
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModalEdicao(ticket); 
                    }}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleDragStart(ticket, col.id);
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.cursor = 'grabbing';
                      e.stopPropagation();
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.cursor = 'grab';
                      e.stopPropagation();
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>
                      {ticket.titulo}
                    </div>
                    <div style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                      {ticket.descricao}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.9rem'
                    }}>
                      <span>👥 {ticket.id_responsavel || 'Não atribuído'}</span>
                      <span>🏷️ {ticket.pontuacao || 0} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>










      {/* Ticket Modal */}
      {showTicketModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeTicketModal}>
          <div style={{
            background: '#232946',
            color: '#fff',
            borderRadius: '14px',
            padding: '2.5rem 2.5rem 2rem 2.5rem',
            minWidth: '340px',
            boxShadow: '0 2px 24px rgba(0,0,0,0.18)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: '#fff',
              letterSpacing: '0.5px'
            }}>Criar Ticket</h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem'
            }}>
              <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                Título
                <input
                  type="text"
                  placeholder="Título da tarefa"
                  value={modalFields.titulo}
                  onChange={e => setModalFields(f => ({ ...f, titulo: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleCreateTicket()}
                  required
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                />
              </label>
              
              <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                Descrição
                <textarea
                  placeholder="Descrição detalhada"
                  value={modalFields.descricao}
                  onChange={e => setModalFields(f => ({ ...f, descricao: e.target.value }))}
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s',
                    minHeight: '60px',
                    resize: 'vertical'
                  }}
                />
              </label>
              
              <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>

                  Atribuir a Sprint
                <label style={{  }}>
                <select
                  value={modalFields.id_sprint || ''}
                  onChange={(e) =>
                    setModalFields((f) => ({
                      ...f,
                      id_sprint: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                >
                  <option value="">Sem Atribuições</option>
                  {sprints.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </label>
              </label>
             <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                 <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                
                  Responsável
                <label style={{ /* seus estilos */ }}>
                <select
                  value={modalFields.id_responsavel || ''}
                  onChange={(e) =>
                    setModalFields((f) => ({
                      ...f,
                      id_responsavel: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                >
                  <option value="">Sem responsável</option>
                  {membros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </label>
              </label>
             <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}></label>


                Status
                <select
                  value={modalFields.status || 'A Fazer'}
                  onChange={e => setModalFields(f => ({ ...f, status: e.target.value }))}
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                >
                  <option value="A Fazer">A Fazer</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Em Revisão">Em Revisão</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </label>
              <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                Pontuação
                <input
                  type="number"
                  placeholder="Story Points"
                  value={modalFields.pontuacao}
                  onChange={e => setModalFields(f => ({ ...f, pontuacao: e.target.value }))}
                  min="1"
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                />
              </label>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '0.5rem'
              }}>
                <button 
                  type="button" 
                  onClick={closeTicketModal} 
                  style={{
                    padding: '0.5rem 1.2rem',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: '#fff',
                    color: '#232946',
                    fontWeight: 'bold'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handleCreateTicket}
                  style={{
                    padding: '0.5rem 1.2rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: '#eebbc3',
                    color: '#232946',
                    fontWeight: 'bold'
                  }}
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

















      {/* Criar Sprint */}
      {showCriarSprint && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeCriarSprint}>
          <div style={{
            background: '#232946',
            color: '#fff',
            borderRadius: '14px',
            padding: '2.5rem 2.5rem 2rem 2.5rem',
            minWidth: '340px',
            boxShadow: '0 2px 24px rgba(0,0,0,0.18)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: '#fff',
              letterSpacing: '0.5px'
            }}>Criar Sprint</h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem'
            }}>
              <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                Nome
                <input
                  type="text"
                  placeholder="Nome da Sprint"
                  value={modalFields.nome_sprint}
                  onChange={e => setModalFields(f => ({ ...f, nome_sprint: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleCriarSprint()}
                  required
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                />
              </label>
              
              <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                Data inicio
                <input
                  type="date"
                  value={modalFields.data_inicio}
                  onChange={(e) => setModalFields({ ...modalFields, data_inicio: e.target.value })}
                  className="form-input"
                />Data Fim
                 <input
                  type="date"
                  value={modalFields.data_fim}
                  onChange={(e) => setModalFields({ ...modalFields, data_fim: e.target.value })}
                  className="form-input"
                />
              </label>
              
              
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '0.5rem'
              }}>
                <button 
                  type="button" 
                  onClick={closeCriarSprint} 
                  style={{
                    padding: '0.5rem 1.2rem',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: '#fff',
                    color: '#232946',
                    fontWeight: 'bold'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handleCriarSprint}
                  style={{
                    padding: '0.5rem 1.2rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: '#eebbc3',
                    color: '#232946',
                    fontWeight: 'bold'
                  }}
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}













{/* Criar BurnDown */}
{showBurnDown && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }} onClick={closeBurnDown}>
    <div style={{
      background: '#232946',
      color: '#fff',
      borderRadius: '14px',
      padding: '2.5rem',
      minWidth: '600px',
      maxWidth: '1000px',
      width: '90%',
      boxShadow: '0 2px 24px rgba(0,0,0,0.18)',
      position: 'relative'
    }} onClick={e => e.stopPropagation()}>
      <h3 style={{
        fontSize: '1.4rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#fff',
        letterSpacing: '0.5px'
      }}>Gerar Burndown</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Seleção de Sprint */}
        <label style={{
          fontSize: '1rem',
          fontWeight: '500',
          color: '#eebbc3',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem'
        }}>
          Sprint
          <select
            value={modalFields.id_sprint || ''}
            onChange={(e) =>
              setModalFields((f) => ({
                ...f,
                id_sprint: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
            style={{
              background: '#fff',
              color: '#232946',
              border: '1.5px solid #eebbc3',
              borderRadius: '7px',
              padding: '0.6rem 1rem',
              fontSize: '1rem',
              marginTop: '0.2rem',
              outline: 'none',
            }}
          >
            <option value="">Selecione a sprint</option>
            {sprints.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>

        {/* Gráfico e Botões - Lado a Lado */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Botões sempre do lado esquerdo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              type="button"
              onClick={closeBurnDown}
              style={{
                padding: '0.5rem 1.2rem',
                border: '1.5px solid #eebbc3',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                background: '#fff',
                color: '#232946',
                fontWeight: 'bold',
                minWidth: '140px'
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCriarBurnDown}
              style={{
                padding: '0.5rem 1.2rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                background: '#eebbc3',
                color: '#232946',
                fontWeight: 'bold',
                minWidth: '140px'
              }}
            >
              Gerar
            </button>
          </div>

          {/* Gráfico grande do lado direito */}
          {burndownImg && (
            <div style={{ flexGrow: 1 }}>
              <h4 style={{ color: '#eebbc3', marginBottom: '0.5rem' }}>Gráfico Gerado:</h4>
              <img
                src={burndownImg.startsWith('data:image') ? burndownImg : `data:image/png;base64,${burndownImg}`}
                alt="Burndown Chart"
                style={{
                  width: '100%',
                  maxWidth: '700px',
                  borderRadius: '8px',
                  border: '2px solid #eebbc3'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}























      {/* Column Modal */}
      {showColumnModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeColumnModal}>
          <div style={{
            background: '#232946',
            color: '#fff',
            borderRadius: '14px',
            padding: '2.5rem 2.5rem 2rem 2.5rem',
            minWidth: '340px',
            boxShadow: '0 2px 24px rgba(0,0,0,0.18)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: '#fff',
              letterSpacing: '0.5px'
            }}>Adicionar Coluna</h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem'
            }}>
              <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                Nome da Coluna
                <input
                  type="text"
                  placeholder="Nome da Coluna"
                  value={newColumnName}
                  onChange={e => setNewColumnName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                  required
                  autoFocus
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                />
              </label>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '0.5rem'
              }}>
                <button 
                  type="button" 
                  onClick={closeColumnModal} 
                  style={{
                    padding: '0.5rem 1.2rem',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: '#fff',
                    color: '#232946',
                    fontWeight: 'bold'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handleAddColumn}
                  style={{
                    padding: '0.5rem 1.2rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: '#eebbc3',
                    color: '#232946',
                    fontWeight: 'bold'
                  }}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}





       {/*Editar Ticket Modal */}
      {showEditModal && selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={fecharModalEdicao}>
          <div style={{
            background: '#232946',
            color: '#fff',
            borderRadius: '14px',
            padding: '2.5rem 2.5rem 2rem 2.5rem',
            minWidth: '340px',
            boxShadow: '0 2px 24px rgba(0,0,0,0.18)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: '#fff',
              letterSpacing: '0.5px'
            }}>Ticket</h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem'
            }}>
              <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                Título
                <input
                  type="text"
                  placeholder="Título da tarefa"
                  value={modalFields.titulo}
                  onChange={e => setModalFields(f => ({ ...f, titulo: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleCreateTicket()}
                  required
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                />
              </label>
              
              <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                Descrição
                <textarea
                  placeholder="Descrição detalhada"
                  value={modalFields.descricao}
                  onChange={e => setModalFields(f => ({ ...f, descricao: e.target.value }))}
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s',
                    minHeight: '60px',
                    resize: 'vertical'
                  }}
                />
              </label>
              
              <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>

                  Atribuir a Sprint
                <label style={{  }}>
                <select
                  value={modalFields.id_sprint || ''}
                  onChange={(e) =>
                    setModalFields((f) => ({
                      ...f,
                      id_sprint: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                >
                  <option value="">Sem Atribuições</option>
                  {sprints.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </label>
              </label>
             <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                 <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                
                  Responsável
                <label style={{}}>
                <select
                  value={modalFields.id_responsavel || ''}
                  onChange={(e) =>
                    setModalFields((f) => ({
                      ...f,
                      id_responsavel: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                >
                  <option value="">Sem responsável</option>
                  {membros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </label>
              </label>
             <label style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.3rem',
                color: '#eebbc3',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}></label>


                Status
                <select
                  value={modalFields.status || 'A Fazer'}
                  onChange={e => setModalFields(f => ({ ...f, status: e.target.value }))}
                  style={{
                    background: '#fff',
                    color: '#232946',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '7px',
                    padding: '0.6rem 1rem',
                    fontSize: '1rem',
                    marginTop: '0.2rem',
                    marginBottom: '0.1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                >
                  <option value="A Fazer">A Fazer</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Em Revisão">Em Revisão</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </label>
              <label style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '0.3rem',
                  color: '#eebbc3',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem'
                }}>
                  Planning Poker
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.7rem'
                  }}>
                    {/* Quantidade de votos */}
                    <div style={{ minWidth: '40px', fontWeight: 'bold', color: '#eebbc3' }}>
                      🗳️ {quantidadeVotos}
                    </div>

                    {/* Input de pontuação */}
                    <input
                      type="number"
                      placeholder="Story Points"
                      value={modalFields.pontuacao}
                      onChange={e => setModalFields(f => ({ ...f, pontuacao: e.target.value }))}
                      min="1"
                      style={{
                        background: '#fff',
                        color: '#232946',
                        border: '1.5px solid #eebbc3',
                        borderRadius: '7px',
                        padding: '0.6rem 1rem',
                        fontSize: '1rem',
                        width: '80px'
                      }}
                    />

                    {/* Botão Votar */}
                    <button
                      type="button"
                      onClick={handleVotar}
                      style={{
                        background: '#eebbc3',
                        color: '#232946',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem 0.8rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Votar
                    </button>

                    {/* Botão Finalizar */}
                    <button
                      type="button"
                      onClick={handleFinalizarVotacao}
                      style={{
                        background: '#232946',
                        color: '#fff',
                        border: '1.5px solid #eebbc3',
                        borderRadius: '6px',
                        padding: '0.4rem 0.8rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Finalizar
                    </button>
                  </div>
                </label>

              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '0.5rem'
              }}>
                <button 
                  type="button" 
                  onClick={fecharModalEdicao} 
                  style={{
                    padding: '0.5rem 1.2rem',
                    border: '1.5px solid #eebbc3',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: '#fff',
                    color: '#232946',
                    fontWeight: 'bold'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handleAtualizarTask}
                  style={{
                    padding: '0.5rem 1.2rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: '#eebbc3',
                    color: '#232946',
                    fontWeight: 'bold'
                  }}
                >
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Dashboard;