import React, { useState, useEffect, useRef } from 'react';
import '../styles/Home.css';

const Home = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [membros, setMembros] = useState([]);
  const [currentMemberInput, setCurrentMemberInput] = useState('');
  const [currentMemberRole, setCurrentMemberRole] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const suggestionsRef = useRef(null);
  
  // Mock data - replace with API calls
  const mockProjects = [
    { id: 1, nome: 'Sistema de Gestão', role: 'Admin', membersCount: 5 },
    { id: 2, nome: 'App Mobile', role: 'Developer', membersCount: 8 },
    { id: 3, nome: 'Dashboard Analytics', role: 'Designer', membersCount: 3 },
  ];
  
  const mockUsers = [
    { id: 1, email: 'john.doe@example.com', name: 'John Doe' },
    { id: 2, email: 'jane.smith@example.com', name: 'Jane Smith' },
    { id: 3, email: 'mike.wilson@example.com', name: 'Mike Wilson' },
    { id: 4, email: 'sarah.jones@example.com', name: 'Sarah Jones' },
    { id: 5, email: 'alex.brown@example.com', name: 'Alex Brown' },
  ];

  const getSuggestions = (input) => {
    if (!input) return [];
    const lowercased = input.toLowerCase();
    return mockUsers.filter(user => 
      user.email.toLowerCase().includes(lowercased) || 
      user.name.toLowerCase().includes(lowercased)
    ).slice(0, 5);
  };

  const suggestions = getSuggestions(currentMemberInput);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddMember = (user) => {
    if (membros.find(m => m.email === user.email)) {
      alert('Este membro já foi adicionado');
      return;
    }
    
    const role = currentMemberRole || 'Developer';
    
    setMembros([...membros, { ...user, funcao: role }]);
    setCurrentMemberInput('');
    setCurrentMemberRole('');
    setShowSuggestions(false);
  };

  const removeMembro = (email) => {
    setMembros(membros.filter(m => m.email !== email));
  };

  const handleSubmit = () => {
    if (!nome || !descricao) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    // TODO: Implement backend integration
    console.log('Creating project:', { nome, descricao, membros });
    
    // Simulate project creation
    alert('Projeto criado com sucesso!');
    
    // Reset form
    setNome('');
    setDescricao('');
    setMembros([]);
    setShowCreateModal(false);
    
    // TODO: Navigate to dashboard
    // navigate(`/dashboard/${newProjectId}`);
  };

  const handleProjectClick = (projectId) => {
    // TODO: Navigate to project dashboard
    console.log('Navigate to project:', projectId);
    // navigate(`/dashboard/${projectId}`);
  };

  return (
    <div className="home-layout">
      {/* Sidebar */}
      <div className="home-sidebar">
        <div className="sidebar-header">
          <h1>Projetos</h1>
          <button 
            className="create-project-btn"
            onClick={() => setShowCreateModal(true)}
            title="Criar novo projeto"
          >
            +
          </button>
        </div>
        
        <div className="projects-list">
          {mockProjects.map(project => (
            <div 
              key={project.id}
              className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedProject(project);
                handleProjectClick(project.id);
              }}
            >
              <div className="project-icon">
                {project.nome.charAt(0).toUpperCase()}
              </div>
              <div className="project-info">
                <h3>{project.nome}</h3>
                <p>{project.role} • {project.membersCount} membros</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="home-main">
        <div className="welcome-section">
          <h2>Bem-vindo!</h2>
          <p>Selecione um projeto na barra lateral ou crie um novo projeto para começar.</p>
          
          <div className="quick-actions">
            <div className="action-card" onClick={() => setShowCreateModal(true)}>
              <div className="action-icon">📁</div>
              <h3>Criar Projeto</h3>
              <p>Inicie um novo projeto e convide sua equipe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="project-modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Criar novo projeto</h2>
            
            <div className="project-form">
              <div className="form-group">
                <label>Nome do projeto</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Sistema de Vendas"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  className="form-textarea"
                  placeholder="Descreva os objetivos e escopo do projeto..."
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Adicionar membros</label>
                <p style={{ fontSize: '0.9rem', color: '#eebbc3', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
                  Digite o nome ou email e selecione da lista
                </p>
                <div className="member-input-group" ref={suggestionsRef}>
                  <input
                    type="text"
                    className="form-input member-input"
                    placeholder="Digite o nome ou email"
                    value={currentMemberInput}
                    onChange={e => {
                      setCurrentMemberInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  <select 
                    className="role-select"
                    value={currentMemberRole}
                    onChange={e => setCurrentMemberRole(e.target.value)}
                  >
                    <option value="">Função (padrão: Developer)</option>
                    <option value="Admin">Admin</option>
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Tester">Tester</option>
                  </select>
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {suggestions.map(user => (
                        <div 
                          key={user.id}
                          className="suggestion-item"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur
                            handleAddMember(user);
                          }}
                        >
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {membros.length > 0 && (
                  <div className="members-list">
                    {membros.map((membro, idx) => (
                      <div key={idx} className="member-tag">
                        <div className="member-info">
                          <strong>{membro.name}</strong>
                          <span>{membro.funcao}</span>
                        </div>
                        <button 
                          type="button"
                          className="remove-member"
                          onClick={() => removeMembro(membro.email)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Criar Projeto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;