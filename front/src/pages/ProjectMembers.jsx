import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ProjectMembers.css';

// Roles available in the system (from Home.jsx)
const ROLES = [
  'Admin',
  'Membro',
];

const ProjectMembers = () => {
  const { id_projeto } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('Membro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserFuncao, setCurrentUserFuncao] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem('id_usuario');
    setCurrentUserId(userId);
    fetchMembers();
  }, [id_projeto]);

  // Use the new endpoint to fetch members and their roles
  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/projetos/membros-funcoes/${id_projeto}`);
      const data = await res.json();
      setMembers(data);
      // Get current user's funcao in this project
      const userId = localStorage.getItem('id_usuario');
      const funcaoRes = await fetch(`http://localhost:3000/projetos/listar-projetos/${userId}`);
      const projetos = await funcaoRes.json();
      const thisProject = projetos.find(p => p.id === Number(id_projeto));
      setCurrentUserFuncao(thisProject?.funcao || '');
    } catch {
      setError('Erro ao carregar membros.');
    }
    setLoading(false);
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

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/projetos/adicionar-Membro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_projeto: Number(id_projeto),
          id_usuario_admin: Number(currentUserId),
          email,
          funcao,
        }),
      });
      const data = await res.json();
      if (data.message && !data.id) setError(data.message);
      else {
        setSuccess('Membro adicionado com sucesso!');
        setEmail('');
        setFuncao('Membro');
        fetchMembers();
      }
    } catch{
      setError('Erro ao adicionar membro.');
    }
    setLoading(false);
  };

  const handleRemoveMember = async (id_usuario) => {
    if (!window.confirm('Tem certeza que deseja remover este membro?')) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/projetos/excluir-membro/${id_projeto}/${currentUserId}/${id_usuario}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.message && data.message !== 'OK') setError(data.message);
      else {
        setSuccess('Membro removido com sucesso!');
        fetchMembers();
      }
    } catch {
      setError('Erro ao remover membro.');
    }
    setLoading(false);
  };

  const handleChangeFuncao = async (id_usuario, nova_funcao) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/projetos/alterar-funcao/${id_projeto}/${currentUserId}/${id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nova_funcao }),
      });
      const data = await res.json();
      if (data.message && data.message !== 'Função do membro atualizada com sucesso') setError(data.message);
      else {
        setSuccess('Função alterada com sucesso!');
        fetchMembers();
      }
    } catch {
      setError('Erro ao alterar função.');
    }
    setLoading(false);
  };

  // Add member from suggestion
  const handleSuggestionClick = (user) => {
    setEmail(user.email);
    setShowSuggestions(false);
    setUserSuggestions([]);
  };

  if (currentUserFuncao !== 'Admin') {
    return (
      <div className="pm-container">
        <h2>Gerenciar Membros</h2>
        <p>Você não tem permissão para acessar esta página.</p>
        <button onClick={() => navigate(-1)} className="pm-btn">Voltar</button>
      </div>
    );
  }

  return (
    <div className="pm-container">
      <h2>Gerenciar Membros do Projeto</h2>
      {error && <div className="pm-error">{error}</div>}
      {success && <div className="pm-success">{success}</div>}
      <form onSubmit={handleAddMember} className="pm-form" ref={suggestionsRef} style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Email ou nome do novo membro"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            setShowSuggestions(true);
            fetchUserSuggestions(e.target.value);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          required
          className="pm-input"
          autoComplete="off"
        />
        <select value={funcao} onChange={e => setFuncao(e.target.value)} className="pm-input">
          {ROLES.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <button type="submit" className="pm-btn" disabled={loading}>Adicionar</button>
        {showSuggestions && userSuggestions.length > 0 && (
          <div className="suggestions-dropdown" style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #eebbc3', borderRadius: '7px', width: '250px', maxHeight: '180px', overflowY: 'auto', marginTop: '2.5rem' }}>
            {userSuggestions.map(user => (
              <div
                key={user.id}
                className="suggestion-item"
                style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                onMouseDown={() => handleSuggestionClick(user)}
              >
                <strong>{user.nome}</strong>
                <span style={{ marginLeft: 8, color: '#888' }}>{user.email}</span>
              </div>
            ))}
          </div>
        )}
      </form>
      <div className="pm-list">
        <table className="pm-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Função</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td>{m.nome}</td>
                <td>
                  <select
                    value={m.funcao || ROLES[1]}
                    onChange={e => handleChangeFuncao(m.id, e.target.value)}
                    className="pm-input"
                    disabled={m.id === Number(currentUserId)}
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td>
                  {m.id !== Number(currentUserId) && (
                    <button className="pm-btn pm-btn-danger" onClick={() => handleRemoveMember(m.id)} disabled={loading}>
                      Remover
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => navigate(-1)} className="pm-btn pm-btn-back">Voltar</button>
    </div>
  );
};

export default ProjectMembers;
