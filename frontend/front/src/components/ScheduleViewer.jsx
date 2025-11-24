import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { scheduleService } from '../services/scheduleService';
import './ScheduleViewer.css';

const ScheduleViewer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [semestre, setSemestre] = useState(1);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editForm, setEditForm] = useState({
    enseignantId: '',
    salleId: '',
    matiereId: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Créneaux horaires standards
  const timeSlots = [
    '08:00-09:30',
    '09:45-11:15', 
    '11:30-13:00',
    '14:00-15:30',
    '15:45-17:15'
  ];

  // Jours de la semaine
  const weekDays = [
    'Lundi',
    'Mardi', 
    'Mercredi',
    'Jeudi',
    'Vendredi'
  ];

  useEffect(() => {
    loadClasses();
    loadResources();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedClass) {
      loadSchedule();
    }
  }, [selectedClass, semestre]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadClasses = async () => {
    try {
      setLoading(true);
      const classesData = await scheduleService.getClasses();
      
      setClasses(classesData);
      
      const classIdParam = searchParams.get('classId');
      const semestreParam = searchParams.get('semestre');
      
      if (classIdParam) {
        setSelectedClass(classIdParam);
      } else if (classesData.length > 0) {
        setSelectedClass(classesData[0].id.toString());
      }
      
      if (semestreParam) {
        setSemestre(parseInt(semestreParam));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des classes:', err);
      setError('Erreur lors du chargement des classes: ' + (err.message || 'Service indisponible'));
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const [teachersData, roomsData, subjectsData] = await Promise.all([
        scheduleService.getTeachers(),
        scheduleService.getRooms(),
        scheduleService.getSubjects()
      ]);
      setTeachers(teachersData);
      setRooms(roomsData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Erreur lors du chargement des ressources:', err);
    }
  };

  const loadSchedule = async () => {
    if (!selectedClass) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer l'emploi du temps de la classe pour le semestre
      const data = await scheduleService.getScheduleByClass(parseInt(selectedClass), semestre);
      setScheduleData(data);
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'emploi du temps:', err);
      // Si aucun emploi du temps n'existe, ce n'est pas vraiment une erreur
      setScheduleData(null);
      setLoading(false);
    }
  };

  const formatScheduleForGrid = (scheduleData) => {
    const grid = {};
    weekDays.forEach(day => {
      grid[day] = {};
      timeSlots.forEach(slot => {
        grid[day][slot] = null;
      });
    });

    if (!scheduleData) return grid;

    // scheduleData est groupé par jour depuis le backend
    Object.entries(scheduleData).forEach(([jour, courses]) => {
      courses.forEach(course => {
        // Trouver le créneau horaire correspondant
        const timeSlot = `${course.heureDebut}-${course.heureFin}`;
        if (grid[jour] && grid[jour][timeSlot] !== undefined) {
          grid[jour][timeSlot] = course;
        }
      });
    });

    return grid;
  };

  const getCourseStyle = (course) => {
    if (!course) return {};
    
    // Générer une couleur basée sur le nom de la matière
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#FFEB3B', '#E91E63'];
    const matiereName = typeof course.matiere === 'object' ? (course.matiere?.nom || '') : (course.matiere || '');
    const colorIndex = matiereName.length % colors.length;
    
    return {
      backgroundColor: colors[colorIndex],
      color: 'white',
      padding: '8px',
      borderRadius: '6px',
      fontSize: '0.8rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    };
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditForm({ enseignantId: '', salleId: '', matiereId: '' });
  };

  const handleSaveEdit = async () => {
    try {
      await scheduleService.updateEmploi(editForm.emploiId, {
        enseignantId: parseInt(editForm.enseignantId),
        salleId: parseInt(editForm.salleId),
        matiereId: parseInt(editForm.matiereId)
      });
      
      setEditingCell(null);
      setEditForm({ enseignantId: '', salleId: '', matiereId: '' });
      await loadSchedule(); // Recharger l'emploi du temps
      
      alert('✅ Emploi du temps modifié avec succès');
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      alert('❌ Erreur lors de la modification: ' + (err.response?.data?.message || err.message));
    }
  };



  if (loading) {
    return (
      <div className="schedule-viewer-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-viewer-error">
        <div className="error-icon">⚠</div>
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/director-dashboard')}>
          Retour au dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="schedule-viewer">
      <header className="schedule-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/director-dashboard')}
          >
            ← Retour
          </button>
          <div>
            <h1>📋 Visualiser Emplois du Temps</h1>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              Connecté en tant que: {user?.prenom} {user?.nom} ({user?.role})
            </p>
          </div>
        </div>
        <div className="header-right">
          <select
            value={semestre}
            onChange={(e) => setSemestre(parseInt(e.target.value))}
            className="semestre-selector"
          >
            <option value={1}>Semestre 1</option>
            <option value={2}>Semestre 2</option>
          </select>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="class-selector"
          >
            {classes.map(classe => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))}
          </select>
          {scheduleData && Object.keys(scheduleData).length > 0 && (
            <button 
              className="modify-btn"
              onClick={() => navigate(`/schedule-builder?classId=${selectedClass}&semestre=${semestre}&mode=edit`)}
            >
              <span className="btn-icon">✏</span> Modifier
            </button>
          )}
          <button 
            className="create-btn"
            onClick={() => navigate('/schedule-builder')}
          >
            <span className="btn-icon">+</span> Nouveau
          </button>
        </div>
      </header>

      <div className="viewer-content">
        {!scheduleData || Object.keys(scheduleData).length === 0 ? (
          <div className="empty-schedule">
            <div className="empty-icon">📋</div>
            <h3>Aucun emploi du temps</h3>
            <p>
              {selectedClass && classes.find(c => c.id.toString() === selectedClass)?.nom}
              {' - Semestre '}{semestre}
            </p>
            <p>Aucun emploi du temps n'a été créé pour cette classe et ce semestre.</p>
            <button 
              className="create-btn"
              onClick={() => navigate('/schedule-builder')}
            >
              <span className="btn-icon">+</span> Créer un emploi du temps
            </button>
          </div>
        ) : (
          <div className="schedule-preview">
            <div className="preview-header">
              <h3>
                📅 {classes.find(c => c.id.toString() === selectedClass)?.nom} - Semestre {semestre}
              </h3>
              <div className="preview-actions">
                <button onClick={() => window.print()}>
                  <span className="btn-icon">🖨</span> Imprimer
                </button>
              </div>
            </div>
            
            <div className="schedule-grid-preview">
              <div className="grid-header">
                <div className="time-header">Créneaux</div>
                {weekDays.map(day => (
                  <div key={day} className="day-header">{day}</div>
                ))}
              </div>
              
              {(() => {
                const grid = formatScheduleForGrid(scheduleData);
                return timeSlots.map(timeSlot => (
                  <div key={timeSlot} className="grid-row">
                    <div className="time-slot">{timeSlot}</div>
                    {weekDays.map(day => (
                      <div key={`${day}-${timeSlot}`} className="schedule-cell-preview">
                        {grid[day]?.[timeSlot] ? (
                          editingCell?.day === day && editingCell?.timeSlot === timeSlot ? (
                            <div className="edit-course-form">
                              <select
                                value={editForm.matiereId}
                                onChange={(e) => setEditForm({...editForm, matiereId: e.target.value})}
                                className="edit-select"
                              >
                                <option value="">Matière...</option>
                                {subjects.map(s => (
                                  <option key={s.id} value={s.id}>{s.nom}</option>
                                ))}
                              </select>
                              <select
                                value={editForm.enseignantId}
                                onChange={(e) => setEditForm({...editForm, enseignantId: e.target.value})}
                                className="edit-select"
                              >
                                <option value="">Enseignant...</option>
                                {teachers.map(t => (
                                  <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>
                                ))}
                              </select>
                              <select
                                value={editForm.salleId}
                                onChange={(e) => setEditForm({...editForm, salleId: e.target.value})}
                                className="edit-select"
                              >
                                <option value="">Salle...</option>
                                {rooms.map(r => (
                                  <option key={r.id} value={r.id}>{r.nom}</option>
                                ))}
                              </select>
                              <div className="edit-actions">
                                <button onClick={handleSaveEdit} className="save-btn">✓</button>
                                <button onClick={handleCancelEdit} className="cancel-btn">✕</button>
                              </div>
                            </div>
                          ) : (
                            <div style={getCourseStyle(grid[day][timeSlot])}>
                              <div className="course-name">
                                {typeof grid[day][timeSlot].matiere === 'object' 
                                  ? grid[day][timeSlot].matiere?.nom 
                                  : grid[day][timeSlot].matiere}
                              </div>
                              <div className="course-teacher">
                                {typeof grid[day][timeSlot].enseignant === 'object'
                                  ? `${grid[day][timeSlot].enseignant?.prenom} ${grid[day][timeSlot].enseignant?.nom}`
                                  : grid[day][timeSlot].enseignant}
                              </div>
                              <div className="course-room">
                                {typeof grid[day][timeSlot].salle === 'object'
                                  ? grid[day][timeSlot].salle?.nom
                                  : grid[day][timeSlot].salle}
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="empty-cell-preview">-</div>
                        )}
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleViewer;