import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
   // alert(`Login with: ${email}`);

    try {
    const response = await fetch('http://localhost:3000/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data && data.id) {
        localStorage.setItem('id_usuario', data.id);
      }
      alert('Login realizado com sucesso!');
      navigate('/home');
    } else {
    
      alert(data.message || 'Erro ao fazer login');
    }
  } catch (error) {
    console.error('Erro ao conectar com a API:', error);
    alert('Erro na conexão com o servidor.');
  }
    
  };


  

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Bem-vindo de volta</h2>
        <p>Entre na sua conta para continuar</p>
      </div>
      
      <div className="auth-form">
        <div className="input-group">
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        
        <div className="input-group">
          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        
        <button onClick={handleSubmit} className="auth-button primary">
          Entrar
        </button>
      </div>
      
      <div className="auth-footer">
        <p>Ainda não está cadastrado?</p>
        <button 
          onClick={() => navigate('/signup')}
          className="auth-button secondary"
        >
          Criar conta
        </button>
      </div>
    </div>
  );
};

export default Login;