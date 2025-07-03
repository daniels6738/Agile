import React, { useState } from 'react';

const initialColumns = [
  { id: 1, name: 'A Fazer', tickets: [] },
  { id: 2, name: 'Em Progresso', tickets: [] },
  { id: 3, name: 'Concluído', tickets: [] },
];

const Dashboard = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [modalFields, setModalFields] = useState({
    titulo: '',
    descricao: '',
    id_responsavel: '',
    pontuacao: '',
    id_projeto: 1, // Default project ID since we don't have project management yet
  });

  const sidebarItems = [
    { icon: '🏠', label: 'Dashboard' },
    { icon: '📝', label: 'Projetos' },
    { icon: '👤', label: 'Perfil' },
    { icon: '⚙️', label: 'Configurações' },
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

  const openTicketModal = () => setShowTicketModal(true);
  const closeTicketModal = () => {
    setShowTicketModal(false);
    setModalFields({ 
      titulo: '', 
      descricao: '', 
      id_responsavel: '', 
      pontuacao: '',
      id_projeto: 1
    });
  };
  const openColumnModal = () => setShowColumnModal(true);
  const closeColumnModal = () => {
    setShowColumnModal(false);
    setNewColumnName('');
  };

  const handleCreateTicket = () => {
    if (!modalFields.titulo.trim()) return;
    
    const newTicket = {
      id: Date.now(),
      titulo: modalFields.titulo,
      descricao: modalFields.descricao,
      id_responsavel: modalFields.id_responsavel,
      pontuacao: modalFields.pontuacao ? parseInt(modalFields.pontuacao) : null,
      id_projeto: modalFields.id_projeto,
      status: 'A Fazer',
    };
    
    setColumns(columns =>
      columns.map(col =>
        col.name === 'A Fazer'
          ? { ...col, tickets: [...col.tickets, newTicket] }
          : col
      )
    );
    closeTicketModal();
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

  const handleTicketDrop = (colId, colName) => {
    if (!draggedTicket) return;
    
    const updatedTicket = { ...draggedTicket, status: colName };
    delete updatedTicket.fromColId;
    
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
  };

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
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#393e6e'}
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
                ID do Responsável
                <input
                  type="text"
                  placeholder="ID do usuário responsável"
                  value={modalFields.id_responsavel}
                  onChange={e => setModalFields(f => ({ ...f, id_responsavel: e.target.value }))}
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
    </div>
  );
};

export default Dashboard;