import React, { useState, useEffect, useRef } from 'react';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [membros, setMembros] = useState([]);
  const [currentMemberInput, setCurrentMemberInput] = useState('');
  const [currentMemberRole, setCurrentMemberRole] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const suggestionsRef = useRef(null);
  const [projetos, setProjetos] = useState([]);
  const navigate = useNavigate();

  const carregarProjetos = async () => {
    const idUsuario = localStorage.getItem('id_usuario');

    if (!idUsuario) {
      console.warn('ID do usuário não encontrado no localStorage.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/projetos/listar-projetos/${idUsuario}`);
      const data = await response.json();
      setProjetos(data);
    } catch (error) {
      console.error('Erro ao buscar projetos do usuário:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    carregarProjetos();

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const removeMembro = (email) => {
    setMembros(membros.filter(m => m.email !== email));
  };

  const handleSubmit = async () => {
    if (!nome || !descricao) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    const id_usuario = localStorage.getItem('id_usuario');
    if (!id_usuario) {
      alert('Usuário não logado');
      return;
    }
    try {
      // 1. Cria o projeto
      const res = await fetch('http://localhost:3000/projetos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: Number(id_usuario),
          nome,
          descricao,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Erro ao criar projeto');
        return;
      }
      const projetoCriado = await res.json();
      const id_projeto = projetoCriado.idProjeto || projetoCriado.id;
      // 2. Adiciona os membros se houver
      for (const membro of membros) {
        await fetch('http://localhost:3000/projetos/adicionar-Membro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_projeto,
            id_usuario_admin: Number(id_usuario),
            email: membro.email,
            funcao: membro.funcao || 'Membro',
          }),
        });
      }
      alert('Projeto criado com sucesso!');
      setNome('');
      setDescricao('');
      setMembros([]);
      setShowCreateModal(false);
      // Atualiza a lista de projetos para incluir o novo
      const projetosAtualizados = await fetch(`http://localhost:3000/projetos/listar-projetos/${id_usuario}`);
      const data = await projetosAtualizados.json();
      setProjetos(data);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro de comunicação com o servidor');
    }
  };

  const handleProjectClick = (projeto) => {
   // Salva os dados do projeto no localStorage, se necessário:
  localStorage.setItem('id_projeto', projeto.id);
  localStorage.setItem('nome_projeto', projeto.nome);
  localStorage.setItem('cargo', projeto.funcao); // ou o nome da sua coluna real

  // Navega para a página de dashboard
  navigate('/dashboard');
  };

  // Fetch user suggestions from backend
  const fetchUserSuggestions = async (query) => {
    if (!query) {
      setUserSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/usuarios/buscar-por-nome-ou-email/${encodeURIComponent(query)}`);
      const data = await res.json();
      setUserSuggestions(data);
    } catch {
      setUserSuggestions([]);
    }
  };

  // Add member from suggestion
  const handleAddMember = (user) => {
    if (membros.find(m => m.email === user.email)) {
      alert('Este membro já foi adicionado');
      return;
    }
    setMembros([...membros, { ...user, funcao: currentMemberRole || 'Membro' }]);
    setCurrentMemberInput('');
    setCurrentMemberRole('');
    setShowSuggestions(false);
    setUserSuggestions([]);
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
          {projetos.map(project  => (
            <div 
              key={project.id}
              className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedProject(project);
                handleProjectClick(project);
              }}
            >
              <div className="project-icon">
                {project.nome.charAt(0).toUpperCase()}
              </div>
              <div className="project-info">
                <h3>{project.nome}</h3>
                <p>{project.funcao} • {project.membersCount} membros</p>
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
                      fetchUserSuggestions(e.target.value);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  <select 
                    className="role-select"
                    value={currentMemberRole}
                    onChange={e => setCurrentMemberRole(e.target.value)}
                  >
                    <option value="">Função (padrão: Membro)</option>
                    <option value="Admin">Admin</option>
                    <option value="Membro">Membro</option>
                  </select>
                  
                  {showSuggestions && userSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {userSuggestions.map(user => (
                        <div
                          key={user.id}
                          className="suggestion-item"
                          onMouseDown={() => handleAddMember(user)}
                        >
                          <strong>{user.nome}</strong>
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