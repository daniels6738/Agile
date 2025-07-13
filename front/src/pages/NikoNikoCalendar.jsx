import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NikoNikoCalendar.css';

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const moods = [
  { type: 'Feliz', icon: '😊' },
  { type: 'Normal', icon: '😐' },
  { type: 'Triste', icon: '😢' },
];

const NikoNikoCalendar = () => {
  const navigate = useNavigate();
  const id_projeto = Number(localStorage.getItem('id_projeto'));
  const id_usuario_logado = Number(localStorage.getItem('id_usuario'));
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState({});
  const [draggedMood, setDraggedMood] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`http://localhost:3000/nikoNiko`);
      if (!response.ok) throw new Error('Failed to fetch entries');
      
      const data = await response.json();
      const filtered = data.filter(e => e.id_projeto === id_projeto);
      
      const map = {};
      filtered.forEach(e => {
        const userId = Number(e.id_usuario);
        if (!map[userId]) map[userId] = {};
        const normalizedDate = e.entry_date.split('T')[0];
        map[userId][normalizedDate] = { mood: e.mood, id: e.id };
      });
      setEntries(map);
    } catch {
      setError('Erro ao carregar entradas');
    }
  };

  useEffect(() => {
    fetch(`http://localhost:3000/projetos/membros-funcoes/${id_projeto}`)
      .then(res => res.json())
      .then(data => {
        const normalizedMembers = data.map(m => ({
          ...m,
          id: Number(m.id)
        }));
        setMembers(normalizedMembers);
      })
      .catch(() => setError('Erro ao carregar membros'));
    
    fetchEntries();
  }, [id_projeto]);

  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d.toISOString().slice(0, 10);
  });

  const handleDragStart = mood => setDraggedMood(mood);

  const handleDrop = async (memberId, dayIdx) => {
    memberId = Number(memberId);
    
    if (memberId !== id_usuario_logado || !draggedMood) return;

    setLoading(true);
    setError('');
    
    const entry_date = weekDates[dayIdx];
    const mood = draggedMood.type;
    const existingEntry = entries[memberId]?.[entry_date];

    try {
      if (existingEntry && existingEntry.id) {
        const response = await fetch(`http://localhost:3000/nikoNiko/${existingEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_usuario: memberId,
            id_projeto,
            mood,
            entry_date,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Update failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
      } else {
        const response = await fetch(`http://localhost:3000/nikoNiko`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_usuario: memberId,
            id_projeto,
            mood,
            entry_date,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 500 && errorText.includes('Duplicate entry')) {
            await fetchEntries();
            const existingId = entries[memberId]?.[entry_date]?.id;
            if (existingId) {
              const updateResponse = await fetch(`http://localhost:3000/nikoNiko/${existingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id_usuario: memberId,
                  id_projeto,
                  mood,
                  entry_date,
                }),
              });
              if (!updateResponse.ok) {
                throw new Error('Failed to update after duplicate');
              }
            }
          } else {
            throw new Error(`Create failed: ${response.status} ${response.statusText} - ${errorText}`);
          }
        }
      }
      
      await fetchEntries();
      
    } catch (err) {
      setError(`Erro ao salvar entrada: ${err.message}`);
    } finally {
      setLoading(false);
      setDraggedMood(null);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="niko-container">
      <div className="niko-content">
        <h2 className="niko-title">Calendário NikoNiko</h2>
        
        {error && (
          <div className="niko-error">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="niko-loading">
            Salvando...
          </div>
        )}
        
        <div className="niko-mood-selector">
          <div className="niko-moods">
            {moods.map(m => (
              <span
                key={m.type}
                draggable
                onDragStart={() => handleDragStart(m)}
                className="niko-mood-item"
              >
                {m.icon}
              </span>
            ))}
          </div>
          <span className="niko-instruction">
            Arraste um humor para o seu calendário
          </span>
        </div>
        
        <div className="niko-table-wrapper">
          <table className="niko-calendar-table">
            <thead>
              <tr>
                <th className="niko-member-header">Membro</th>
                {weekDates.map((date, idx) => (
                  <th key={date} className="niko-day-header">
                    <div className="niko-day-name">{daysOfWeek[idx]}</div>
                    <div className="niko-day-date">
                      {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => {
                const isCurrentUser = Number(m.id) === id_usuario_logado;
                return (
                  <tr key={m.id} className={isCurrentUser ? 'niko-current-user-row' : ''}>
                    <td className="niko-member-cell">
                      <div className="niko-member-name">
                        {m.nome}
                        {isCurrentUser && <span className="niko-you-label"> (você)</span>}
                      </div>
                    </td>
                    {weekDates.map((date, idx) => {
                      const entry = entries[Number(m.id)]?.[date];
                      const moodIcon = entry?.mood && moods.find(mood => mood.type === entry.mood)?.icon;
                      
                      return (
                        <td
                          key={date}
                          className={`niko-day-cell ${isCurrentUser ? 'niko-droppable' : ''}`}
                          onDragOver={isCurrentUser ? handleDragOver : undefined}
                          onDrop={isCurrentUser ? () => handleDrop(m.id, idx) : undefined}
                        >
                          <div className="niko-mood-display">
                            {moodIcon || ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <button className="niko-back-btn" onClick={() => navigate(-1)}>
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};

export default NikoNikoCalendar;