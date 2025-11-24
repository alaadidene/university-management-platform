import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { scheduleService } from '../services/scheduleService';
import MarquerAbsences from './Enseignant/MarquerAbsences';
import attendanceService from '../services/attendanceService';
import { X, Check, XCircle, Users, Calendar, Clock, MapPin } from 'lucide-react';
import './ScheduleViewer.css';

const MySchedule = () => {
  const { user } = useAuth();
  
  const [scheduleData, setScheduleData] = useState(null);
  const [semestre, setSemestre] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMarquerAbsences, setShowMarquerAbsences] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState(null);

  // États pour le modal de présence
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

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
    loadMySchedule();
  }, [semestre]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMySchedule = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await scheduleService.getMySchedule(user, semestre);
      setScheduleData(data);
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'emploi du temps:', err);
      setScheduleData(null);
      setError(err.response?.data?.message || 'Aucun emploi du temps disponible');
      setLoading(false);
    }
  };

  // Gestion du clic sur un cours (uniquement pour les enseignants)
  const handleCourseClick = async (course, day, timeSlot) => {
    console.log('🎯 Clic sur cours:', { course, day, timeSlot, userRole: user.role });
    
    // Vérifier que l'utilisateur est un enseignant
    if (user.role !== 'enseignant' && user.role !== 'directeur_departement') {
      console.log('⚠️ Accès refusé - rôle non autorisé');
      return;
    }
    
    setSelectedCourse({ ...course, jour: day, horaire: timeSlot });
    setShowAttendanceModal(true);
    setLoadingStudents(true);
    
    try {
      // Récupérer la liste des étudiants
      const classeId = typeof course.classe === 'object' ? course.classe.id : course.classe;
      const matiereId = typeof course.matiere === 'object' ? course.matiere.id : course.matiere;
      
      console.log('📚 IDs extraits:', { classeId, matiereId });
      console.log('🔑 Token:', localStorage.getItem('token') ? 'Présent' : 'Absent');
      
      const studentsList = await attendanceService.getStudentsByClass(classeId, matiereId);
      console.log('✅ Étudiants chargés:', studentsList);
      
      setStudents(studentsList);
      
      // Initialiser l'état de présence pour tous les étudiants (par défaut: présent)
      const initialAttendance = {};
      studentsList.forEach(student => {
        initialAttendance[student.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (err) {
      console.error("❌ Erreur détaillée:", err);
      console.error("❌ Response:", err.response);
      alert(`Erreur lors du chargement de la liste des étudiants: ${err.response?.data?.message || err.message}`);
      setShowAttendanceModal(false);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Basculer entre présent et absent pour un étudiant
  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  // Enregistrer les présences
  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    
    const classeId = typeof selectedCourse.classe === 'object' 
      ? selectedCourse.classe.id 
      : selectedCourse.classe;
    const matiereId = typeof selectedCourse.matiere === 'object' 
      ? selectedCourse.matiere.id 
      : selectedCourse.matiere;
    
    const attendanceData = {
      cours: {
        matiere: matiereId,
        classe: classeId,
        jour: selectedCourse.jour,
        horaire: selectedCourse.horaire
      },
      date: new Date().toISOString().split('T')[0],
      presences: Object.entries(attendance).map(([studentId, status]) => ({
        etudiantId: parseInt(studentId),
        statut: status
      }))
    };
    
    console.log('💾 Données à envoyer:', attendanceData);
    
    try {
      const result = await attendanceService.saveAttendance(attendanceData);
      console.log('✅ Résultat:', result);
      
      if (result.success) {
        alert("✅ Présences enregistrées avec succès!");
        setShowAttendanceModal(false);
      } else {
        alert("❌ " + (result.message || "Erreur lors de l'enregistrement"));
      }
    } catch (err) {
      console.error("❌ Erreur lors de l'enregistrement:", err);
      console.error("❌ Response:", err.response);
      alert(`❌ Erreur lors de l'enregistrement des présences: ${err.response?.data?.message || err.message}`);
    } finally {
      setSavingAttendance(false);
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

    Object.entries(scheduleData).forEach(([jour, courses]) => {
      courses.forEach(course => {
        const timeSlot = `${course.heureDebut}-${course.heureFin}`;
        if (grid[jour] && timeSlots.includes(timeSlot)) {
          grid[jour][timeSlot] = course;
        }
      });
    });

    return grid;
  };

  const getCourseStyle = (course) => {
    if (!course) return {};
    
    const isTeacher = user.role === 'enseignant' || user.role === 'directeur_departement';
    
    return {
      backgroundColor: '#667eea',
      color: 'white',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '0.85rem',
      height: '100%',
      cursor: isTeacher ? 'pointer' : 'default',
      transition: 'all 0.2s'
    };
  };

  if (loading) {
    return (
      <div className="schedule-viewer-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de votre emploi du temps...</p>
      </div>
    );
  }

  const schedule = formatScheduleForGrid(scheduleData);
  
  // Calcul des statistiques de présence
  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = students.length - presentCount;

  return (
    <div className="my-schedule-page" style={{ padding: '24px', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header simplifié sans bouton retour */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
            Mon Emploi du Temps
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
            {user?.prenom} {user?.nom}
          </p>
        </div>
        
        <select
          value={semestre}
          onChange={(e) => setSemestre(parseInt(e.target.value))}
          className="semestre-selector"
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#1f2937',
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          <option value={1}>Semestre 1</option>
          <option value={2}>Semestre 2</option>
        </select>
      </div>

      {error && (
        <div className="error-message" style={{
          padding: '16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <p className="error-icon" style={{ fontSize: '24px', margin: 0 }}>ℹ️</p>
          <p style={{ margin: 0, color: '#991b1b', fontSize: '14px' }}>{error}</p>
        </div>
      )}

      {!error && (
        <div className="schedule-grid-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="schedule-grid">
            <div className="grid-header">
              <div className="time-header">Horaires</div>
              {weekDays.map(day => (
                <div key={day} className="day-header">{day}</div>
              ))}
            </div>
            
            {timeSlots.map(timeSlot => (
              <div key={timeSlot} className="grid-row">
                <div className="time-slot">{timeSlot}</div>
                {weekDays.map(day => (
                  <div
                    key={`${day}-${timeSlot}`}
                    className="schedule-cell"
                  >
                    {schedule[day]?.[timeSlot] ? (
                      <div 
                        className="course-info"
                        style={getCourseStyle(schedule[day][timeSlot])}
                        onClick={() => handleCourseClick(schedule[day][timeSlot], day, timeSlot)}
                      >
                        <div className="course-name">
                          <strong>
                            {(() => {
                              const course = schedule[day][timeSlot];
                              if (typeof course.matiere === 'object' && course.matiere?.nom) {
                                return course.matiere.nom;
                              } else if (typeof course.matiere === 'string') {
                                return course.matiere;
                              }
                              return 'Matière';
                            })()}
                          </strong>
                        </div>
                        {user.role === 'etudiant' && (
                          <div className="course-teacher">
                            👨‍🏫 {(() => {
                              const course = schedule[day][timeSlot];
                              if (typeof course.enseignant === 'object') {
                                return course.enseignant?.prenom && course.enseignant?.nom
                                  ? `${course.enseignant.prenom} ${course.enseignant.nom}`
                                  : 'Enseignant';
                              }
                              return course.enseignant || 'Enseignant';
                            })()}
                          </div>
                        )}
                        {(user.role === 'enseignant' || user.role === 'directeur_departement') && (
                          <>
                            <div className="course-class">
                              🎓 {(() => {
                                const course = schedule[day][timeSlot];
                                if (typeof course.classe === 'object' && course.classe?.nom) {
                                  return course.classe.nom;
                                } else if (typeof course.classe === 'string') {
                                  return course.classe;
                                }
                                return 'Classe';
                              })()}
                            </div>
                            <button
                              onClick={() => {
                                const course = schedule[day][timeSlot];
                                setSelectedSeance({
                                  ...course,
                                  day,
                                  timeSlot,
                                  date: new Date().toISOString().split('T')[0]
                                });
                                setShowMarquerAbsences(true);
                              }}
                              style={{
                                marginTop: '8px',
                                padding: '4px 8px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                            >
                              ✓ Faire l'appel
                            </button>
                          </>
                        )}
                        <div className="course-room">
                          🏢 {(() => {
                            const course = schedule[day][timeSlot];
                            if (typeof course.salle === 'object' && course.salle?.nom) {
                              return course.salle.nom;
                            } else if (typeof course.salle === 'string') {
                              return course.salle;
                            }
                            return 'Salle';
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-cell">
                        <span className="empty-icon">-</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal pour marquer les absences (ancien système) */}
      {showMarquerAbsences && selectedSeance && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '900px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowMarquerAbsences(false);
                setSelectedSeance(null);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                zIndex: 1001
              }}
            >
              ×
            </button>
            <MarquerAbsences
              seanceId={selectedSeance.id}
              classeId={typeof selectedSeance.classe === 'object' ? selectedSeance.classe?.id : null}
              matiereId={typeof selectedSeance.matiere === 'object' ? selectedSeance.matiere?.id : null}
              classeNom={typeof selectedSeance.classe === 'object' ? selectedSeance.classe?.nom : selectedSeance.classe}
              matiereNom={typeof selectedSeance.matiere === 'object' ? selectedSeance.matiere?.nom : selectedSeance.matiere}
              seanceDate={selectedSeance.date}
              heureDebut={selectedSeance.timeSlot?.split('-')[0]}
              heureFin={selectedSeance.timeSlot?.split('-')[1]}
              token={localStorage.getItem('token')}
            />
          </div>
        </div>
      )}

      {/* Modal de gestion des présences (nouveau système) */}
      {showAttendanceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Header du modal */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              color: 'white',
              borderRadius: '16px 16px 0 0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                    {typeof selectedCourse?.matiere === 'object' 
                      ? selectedCourse.matiere.nom 
                      : selectedCourse?.matiere}
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    fontSize: '14px',
                    opacity: 0.95
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={16} />
                      {typeof selectedCourse?.classe === 'object' 
                        ? selectedCourse.classe.nom 
                        : selectedCourse?.classe}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} />
                      {selectedCourse?.jour}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} />
                      {selectedCourse?.horaire}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} />
                      {typeof selectedCourse?.salle === 'object' 
                        ? selectedCourse.salle.nom 
                        : selectedCourse?.salle}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Statistiques */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginTop: '16px'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{students.length}</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Total</div>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{presentCount}</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Présents</div>
                </div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{absentCount}</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Absents</div>
                </div>
              </div>
            </div>

            {/* Corps du modal - Liste des étudiants */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px'
            }}>
              {loadingStudents ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
                  <p style={{ color: '#6b7280' }}>Chargement des étudiants...</p>
                </div>
              ) : students.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p>Aucun étudiant inscrit à ce cours</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {students.map((student, index) => (
                    <div
                      key={student.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        backgroundColor: attendance[student.id] === 'present' ? '#f0fdf4' : '#fef2f2',
                        border: `2px solid ${attendance[student.id] === 'present' ? '#86efac' : '#fecaca'}`,
                        borderRadius: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flex: 1
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '2px'
                          }}>
                            {student.prenom} {student.nom}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280'
                          }}>
                            CIN: {student.cin}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setAttendance(prev => ({
                            ...prev,
                            [student.id]: 'present'
                          }))}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: attendance[student.id] === 'present' ? '#10b981' : '#e5e7eb',
                            color: attendance[student.id] === 'present' ? 'white' : '#6b7280',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Check size={16} />
                          Présent
                        </button>
                        <button
                          onClick={() => setAttendance(prev => ({
                            ...prev,
                            [student.id]: 'absent'
                          }))}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: attendance[student.id] === 'absent' ? '#ef4444' : '#e5e7eb',
                            color: attendance[student.id] === 'absent' ? 'white' : '#6b7280',
                            transition: 'all 0.2s'
                          }}
                        >
                          <XCircle size={16} />
                          Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer du modal */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowAttendanceModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAttendance}
                disabled={savingAttendance || students.length === 0}
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: savingAttendance || students.length === 0 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: savingAttendance || students.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {savingAttendance ? 'Enregistrement...' : 'Enregistrer les présences'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySchedule;