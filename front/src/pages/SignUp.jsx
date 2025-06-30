import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    alert(`Sign up with: ${email}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Criar conta</h2>
        <p>Comece sua jornada conosco</p>
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
            placeholder="Crie uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        
        <div className="input-group">
          <input
            type="password"
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        
        <button onClick={handleSubmit} className="auth-button primary">
          Criar conta
        </button>
      </div>
      
      <div className="auth-footer">
        <p>Já tem uma conta?</p>
        <button 
          onClick={() => navigate('/login')}
          className="auth-button secondary"
        >
          Fazer login
        </button>
      </div>
    </div>
  );
};

export default SignUp;