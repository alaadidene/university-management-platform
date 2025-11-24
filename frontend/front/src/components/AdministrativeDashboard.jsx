import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, BookOpen, Building2, UserCheck, FileText, Bell, Menu, X, TrendingUp, AlertCircle, Plus, Edit, Trash2, Search, Loader, LogOut, User, Mail, Send, Inbox, Archive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { departementService, enseignantService, etudiantService, classeService, salleService, matiereService, specialiteService, evenementService } from '../services/adminServices';
import AddStudentModal from './AddStudentModal';
import AddTeacherModal from './AddTeacherModal';
import AddDepartmentModal from './AddDepartmentModal';
import AddClasseModal from './AddClasseModal';
import EditStudentModal from './EditStudentModal';
import EditTeacherModal from './EditTeacherModal';
import EditDepartmentModal from './EditDepartmentModal';
import EditClasseModal from './EditClasseModal';
import AddSalleModal from './AddSalleModal';
import EditSalleModal from './EditSalleModal';
import AddMatiereModal from './AddMatiereModal';
import EditMatiereModal from './EditMatiereModal';
import AddEventModal from './AddEventModal';
import EditEventModal from './EditEventModal';
import { BarChart, PieChart, LineChart, StatCard } from './Charts';

const AdminDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // États pour les modaux
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddClasseModal, setShowAddClasseModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  
  // États pour les modaux de modification
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [showEditClasseModal, setShowEditClasseModal] = useState(false);
  const [showAddSalleModal, setShowAddSalleModal] = useState(false);
  const [showEditSalleModal, setShowEditSalleModal] = useState(false);
  const [selectedSalle, setSelectedSalle] = useState(null);
  const [showAddMatiereModal, setShowAddMatiereModal] = useState(false);
  const [showEditMatiereModal, setShowEditMatiereModal] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  
  // États pour les éléments sélectionnés
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedClasse, setSelectedClasse] = useState(null);

  // États pour les données
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    departments: 0,
    classes: 0,
    salles: 0,
    matieres: 0
  });
  const [studentsData, setStudentsData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [specialitesData, setSpecialitesData] = useState([]);
  const [sallesData, setSallesData] = useState([]);
  const [matieresData, setMatieresData] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('');
  const [selectedClasseFilter, setSelectedClasseFilter] = useState('');
  const [matieresViewMode, setMatieresViewMode] = useState('list'); // 'list' or 'grouped'
  const [selectedDepartementForMatiere, setSelectedDepartementForMatiere] = useState('');
  const [selectedSpecialiteFilter, setSelectedSpecialiteFilter] = useState('');
  const [selectedNiveauFilter, setSelectedNiveauFilter] = useState('');
  const [classesViewMode, setClassesViewMode] = useState('list'); // 'list' | 'grouped'
  const [classSearchTerm, setClassSearchTerm] = useState('');

  // États pour les notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // États pour la messagerie
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageFilter, setMessageFilter] = useState('all'); // all, received, sent

  // États pour les événements
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventSearchTerm, setEventSearchTerm] = useState('');

  // États pour le profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    cin: user?.cin || '',
    role: user?.role || 'Administrateur'
  });

  // État pour les activités récentes
  const [recentActivities, setRecentActivities] = useState([]);

  // Mettre à jour profileData quand user change
  useEffect(() => {
    if (user) {
      setProfileData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        cin: user.cin || '',
        role: user.role || 'Administrateur'
      });
    }
  }, [user]);

  
  // Fonction pour charger les activités récentes
  const loadRecentActivities = () => {
    try {
      const savedActivities = localStorage.getItem('recentActivities');
      if (savedActivities) {
        const activities = JSON.parse(savedActivities);
        // Garder seulement les 10 dernières activités
        setRecentActivities(activities.slice(0, 10));
      } else {
        // Activités par défaut si aucune n'est enregistrée
        const defaultActivities = [
          { type: 'user', message: 'Système initialisé', time: getRelativeTime(new Date()) }
        ];
        setRecentActivities(defaultActivities);
        localStorage.setItem('recentActivities', JSON.stringify(defaultActivities));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
    }
  };

  // Handlers for salle/matiere CRUD UI
  const handleOpenAddSalle = () => setShowAddSalleModal(true);
  const handleCloseAddSalle = () => setShowAddSalleModal(false);
  const handleOpenEditSalle = (salle) => { setSelectedSalle(salle); setShowEditSalleModal(true); };
  const handleCloseEditSalle = () => { setSelectedSalle(null); setShowEditSalleModal(false); };

  const handleSavedSalle = (salle) => {
    loadSalles();
    loadDashboardStats();
    addActivity('alert', `Salle enregistrée: ${salle.nom}`);
  };

  const handleDeleteSalle = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;
    const res = await salleService.delete(id);
    if (res.success) {
      loadSalles();
      loadDashboardStats();
      addActivity('alert', `Salle supprimée (id:${id})`);
      alert('Salle supprimée');
    } else {
      alert('Erreur: ' + (res.message || 'Impossible de supprimer'));
    }
  };

  const handleOpenAddMatiere = () => setShowAddMatiereModal(true);
  const handleCloseAddMatiere = () => setShowAddMatiereModal(false);
  const handleOpenEditMatiere = (m) => { setSelectedMatiere(m); setShowEditMatiereModal(true); };
  const handleCloseEditMatiere = () => { setSelectedMatiere(null); setShowEditMatiereModal(false); };

  const handleSavedMatiere = (m) => {
    loadMatieres();
    loadDashboardStats();
    addActivity('alert', `Matière enregistrée: ${m.nom}`);
  };

  const handleDeleteMatiere = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) return;
    const res = await matiereService.delete(id);
    if (res.success) {
      loadMatieres();
      loadDashboardStats();
      addActivity('alert', `Matière supprimée (id:${id})`);
      alert('Matière supprimée');
    } else {
      alert('Erreur: ' + (res.message || 'Impossible de supprimer'));
    }
  };

  // Fonctions pour les événements
  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await evenementService.getAll();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      setError('Erreur lors du chargement des événements');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleAddEvent = () => {
    setShowAddEventModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEditEventModal(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      await evenementService.delete(id);
      loadEvents();
      addActivity('alert', 'Événement supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de l\'événement');
    }
  };

  const handleEventSaved = () => {
    loadEvents();
    setShowAddEventModal(false);
    setShowEditEventModal(false);
    setSelectedEvent(null);
    addActivity('alert', 'Événement enregistré');
  };

  // Fonction pour ajouter une nouvelle activité
  const addActivity = (type, message) => {
    try {
      const newActivity = {
        type,
        message,
        time: getRelativeTime(new Date()),
        timestamp: new Date().toISOString()
      };
      
      const savedActivities = localStorage.getItem('recentActivities');
      const activities = savedActivities ? JSON.parse(savedActivities) : [];
      
      // Ajouter la nouvelle activité en premier
      const updatedActivities = [newActivity, ...activities].slice(0, 10);
      
      localStorage.setItem('recentActivities', JSON.stringify(updatedActivities));
      setRecentActivities(updatedActivities);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
    }
  };

  // Fonction pour obtenir le temps relatif
  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000); // différence en secondes
    
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  // Chargement des statistiques au démarrage
  useEffect(() => {
    loadDashboardStats();
    // Charger départements et classes pour les filtres
    loadDepartments();
    loadClasses();
    loadSpecialites();
    // Charger salles et matières
    loadSalles();
    loadMatieres();
    // Charger les étudiants et enseignants pour la messagerie
    loadStudents();
    loadRecentActivities();
    loadTeachers();
    // Charger les notifications depuis localStorage
    loadNotifications();
    // Charger les messages depuis localStorage
    loadMessages();
    // Charger les événements
    loadEvents();
  }, []);

  // Mettre à jour les temps relatifs toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const savedActivities = localStorage.getItem('recentActivities');
      if (savedActivities) {
        const activities = JSON.parse(savedActivities);
        // Recalculer le temps relatif pour chaque activité
        const updatedActivities = activities.map(activity => ({
          ...activity,
          time: getRelativeTime(activity.timestamp)
        }));
        setRecentActivities(updatedActivities);
      }
    }, 60000); // Toutes les 60 secondes

    return () => clearInterval(interval);
  }, []);

  // Vérifier les nouveaux messages toutes les 30 secondes
  useEffect(() => {
    const messageInterval = setInterval(() => {
      loadMessages();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(messageInterval);
  }, [messages]); // Dépend de messages pour comparer les nouveaux

  // Charger les messages depuis localStorage
  const loadMessages = async () => {
    try {
      const response = await fetch('http://localhost:3002/messages', {
        headers: {
          'x-user-email': user.email,
          'x-user-role': user.role,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const previousUnreadCount = messages.filter(m => m.receiverEmail === user?.email && !m.isRead).length;
        const newUnreadCount = data.filter(m => m.receiverEmail === user?.email && !m.isRead).length;
        
        // Si on a de nouveaux messages non lus, afficher une notification
        if (newUnreadCount > previousUnreadCount && messages.length > 0) {
          const newMessages = data.filter(m => 
            m.receiverEmail === user?.email && 
            !m.isRead && 
            !messages.find(oldMsg => oldMsg.id === m.id)
          );
          
          newMessages.forEach(msg => {
            addNotification(
              `📧 Nouveau message de ${msg.senderEmail}: ${msg.subject}`,
              'info'
            );
          });
        }
        
        setMessages(data);
        setUnreadMessages(newUnreadCount);
      } else {
        console.error('Erreur lors du chargement des messages');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
    }
  };

  // Envoyer un message
  const sendMessage = async (receiverEmail, receiverRole, subject, content) => {
    try {
      const response = await fetch('http://localhost:3002/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
          'x-user-role': user.role,
        },
        body: JSON.stringify({
          receiverEmail,
          receiverRole,
          subject,
          content
        }),
      });

      if (response.ok) {
        addNotification(`Message envoyé à ${receiverEmail}`, 'success');
        loadMessages();
      } else {
        addNotification('Erreur lors de l\'envoi du message', 'error');
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
      addNotification('Erreur de connexion', 'error');
    }
  };

  // Marquer message comme lu
  const markMessageAsRead = async (id) => {
    try {
      await fetch(`http://localhost:3002/messages/${id}/read`, {
        method: 'PATCH',
        headers: {
          'x-user-email': user.email,
          'x-user-role': user.role,
        },
      });
      loadMessages();
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  // Supprimer un message
  const deleteMessage = (id) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    setUnreadMessages(updated.filter(m => m.to === user?.email && !m.read).length);
    localStorage.setItem('messages', JSON.stringify(updated));
    addNotification('Message supprimé', 'info');
  };

  // Charger les notifications depuis localStorage
  const loadNotifications = () => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const notifs = JSON.parse(saved);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    }
  };

  // Ajouter une notification
  const addNotification = (message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      message,
      type, // 'info', 'success', 'warning', 'error'
      time: new Date().toLocaleString('fr-FR'),
      read: false
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  // Marquer comme lu
  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  // Marquer toutes comme lues
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  // Supprimer une notification
  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  // Chargement des données selon le menu actif
  useEffect(() => {
    switch (activeMenu) {
      case 'students':
        loadStudents();
        break;
      case 'teachers':
        loadTeachers();
        break;
      case 'departments':
        loadDepartments();
        break;
      case 'subjects':
        loadClasses();
        break;
      case 'salles':
        loadSalles();
        break;
      case 'matieres':
        loadMatieres();
        break;
      default:
        break;
    }
  }, [activeMenu]);

  // Fonction pour charger les statistiques
  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les données directement
      const [deptsData, ensData, etuData, classesData, sallesDataRes, matieresDataRes] = await Promise.all([
        departementService.getAll().catch(() => []),
        enseignantService.getAll().catch(() => ({ success: false, data: [] })),
        etudiantService.getAll().catch(() => ({ success: false, data: [] })),
        classeService.getAll().catch(() => []),
        salleService.getAll().catch(() => []),
        matiereService.getAll().catch(() => [])
      ]);

      // Gérer le format { value: [...] } ou tableau direct
      const deptsArray = Array.isArray(deptsData) ? deptsData : (deptsData.value || deptsData.data || []);
      const ensArray = ensData.success ? (ensData.data || []) : (Array.isArray(ensData) ? ensData : (ensData.value || []));
      const etuArray = etuData.success ? (etuData.data || []) : (Array.isArray(etuData) ? etuData : (etuData.value || []));
      const classesArray = Array.isArray(classesData) ? classesData : (classesData.value || classesData.data || []);

      const sallesArray = Array.isArray(sallesDataRes) ? sallesDataRes : (sallesDataRes.value || []);
      const matieresArray = Array.isArray(matieresDataRes) ? matieresDataRes : (matieresDataRes.value || []);

      setStats({
        students: etuArray.length || 0,
        teachers: ensArray.length || 0,
        departments: deptsArray.length || 0,
        classes: classesArray.length || 0,
        salles: sallesArray.length || 0,
        matieres: matieresArray.length || 0
      });
      
      console.log('📊 Statistiques chargées:', {
        students: etuArray.length,
        teachers: ensArray.length,
        departments: deptsArray.length,
        classes: classesArray.length,
        salles: sallesArray.length,
        matieres: matieresArray.length
      });
    } catch (err) {
      console.error('❌ Erreur chargement stats:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les étudiants
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des étudiants...');
      const previousIds = studentsData.map(s => s.id);
      const result = await etudiantService.getAll();
      console.log('📥 Résultat étudiants:', result);
      if (result.success) {
        setStudentsData(result.data || []);
        console.log('✅ Étudiants chargés:', result.data?.length || 0);
        if (result.data?.length > 0) {
          console.log('🔍 Structure du premier étudiant:', result.data[0]);
          console.log('🔍 Classe du premier étudiant:', result.data[0]?.classe);
        }
        
        // Si un nouvel étudiant a été ajouté, créer une activité
        if (previousIds.length > 0 && result.data) {
          const newStudents = result.data.filter(s => !previousIds.includes(s.id));
          newStudents.forEach(newStudent => {
            addActivity('user', `Nouveau étudiant inscrit: ${newStudent.nom} ${newStudent.prenom}`);
          });
        }
      } else {
        setError(result.message);
        console.error('❌ Erreur:', result.message);
      }
    } catch (err) {
      console.error('❌ Erreur chargement étudiants:', err);
      setError('Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les enseignants
  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des enseignants...');
      const previousIds = teachersData.map(t => t.id);
      const result = await enseignantService.getAll();
      console.log('📥 Résultat enseignants:', result);
      if (result.success) {
        setTeachersData(result.data || []);
        console.log('✅ Enseignants chargés:', result.data?.length || 0);
        
        // Si un nouvel enseignant a été ajouté, créer une activité
        if (previousIds.length > 0 && result.data) {
          const newTeachers = result.data.filter(t => !previousIds.includes(t.id));
          newTeachers.forEach(newTeacher => {
            addActivity('user', `Nouvel enseignant ajouté: ${newTeacher.nom} ${newTeacher.prenom}`);
          });
        }
      } else {
        setError(result.message);
        console.error('❌ Erreur:', result.message);
      }
    } catch (err) {
      console.error('❌ Erreur chargement enseignants:', err);
      setError('Erreur lors du chargement des enseignants');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les départements
  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des départements...');
      const previousIds = departmentsData.map(d => d.id);
      const data = await departementService.getAll();
      console.log('📥 Résultat départements:', data);
      // L'API retourne soit un tableau, soit { value: [...] }
      const departmentsArray = Array.isArray(data) ? data : (data.value || []);
      setDepartmentsData(departmentsArray);
      console.log('✅ Départements chargés:', departmentsArray.length);
      
      // Si un nouveau département a été ajouté, créer une activité
      if (previousIds.length > 0) {
        const newDepts = departmentsArray.filter(d => !previousIds.includes(d.id));
        newDepts.forEach(newDept => {
          addActivity('alert', `Nouveau département créé: ${newDept.nom}`);
        });
      }
    } catch (err) {
      console.error('❌ Erreur chargement départements:', err);
      setError('Erreur lors du chargement des départements');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les classes
  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des classes...');
      const previousIds = classesData.map(c => c.id);
      const data = await classeService.getAll();
      console.log('📥 Résultat classes:', data);
      // L'API retourne soit un tableau, soit { value: [...] }
      const classesArray = Array.isArray(data) ? data : (data.value || []);
      setClassesData(classesArray);
      console.log('✅ Classes chargées:', classesArray.length);
      if (classesArray.length > 0) {
        console.log('🔍 Structure de la première classe:', classesArray[0]);
        console.log('🔍 Specialite:', classesArray[0]?.specialite);
        console.log('🔍 Departement:', classesArray[0]?.specialite?.departement);
      }
      
      // Si une nouvelle classe a été ajoutée, créer une activité
      if (previousIds.length > 0) {
        const newClasses = classesArray.filter(c => !previousIds.includes(c.id));
        newClasses.forEach(newClasse => {
          addActivity('alert', `Nouvelle classe créée: ${newClasse.nom}`);
        });
      }
    } catch (err) {
      console.error('❌ Erreur chargement classes:', err);
      setError('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les spécialités (utiliser l'endpoint /specialite)
  const loadSpecialites = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des spécialités...');
      const data = await specialiteService.getAll();
      const arr = Array.isArray(data) ? data : (data.value || data.data || []);
      setSpecialitesData(arr);
      console.log('✅ Spécialités chargées:', arr.length);
    } catch (err) {
      console.error('❌ Erreur chargement spécialités:', err);
      setError('Erreur lors du chargement des spécialités');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les salles
  const loadSalles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des salles...');
      const previousIds = sallesData.map(s => s.id);
      const data = await salleService.getAll();
      console.log('📥 Résultat salles:', data);
      const sallesArray = Array.isArray(data) ? data : (data.value || []);
      setSallesData(sallesArray);
      console.log('✅ Salles chargées:', sallesArray.length);
      if (previousIds.length > 0) {
        const newSalles = sallesArray.filter(s => !previousIds.includes(s.id));
        newSalles.forEach(ns => addActivity('alert', `Nouvelle salle: ${ns.nom}`));
      }
    } catch (err) {
      console.error('❌ Erreur chargement salles:', err);
      setError('Erreur lors du chargement des salles');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les matières
  const loadMatieres = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des matières...');
      const previousIds = matieresData.map(m => m.id);
      const data = await matiereService.getAll();
      console.log('📥 Résultat matieres:', data);
      const matieresArray = Array.isArray(data) ? data : (data.value || []);
      setMatieresData(matieresArray);
      console.log('✅ Matières chargées:', matieresArray.length);
      if (previousIds.length > 0) {
        const newMatieres = matieresArray.filter(m => !previousIds.includes(m.id));
        newMatieres.forEach(nm => addActivity('alert', `Nouvelle matière: ${nm.nom}`));
      }
    } catch (err) {
      console.error('❌ Erreur chargement matières:', err);
      setError('Erreur lors du chargement des matières');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un étudiant
  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) return;
    
    try {
      const student = studentsData.find(s => s.id === id);
      const result = await etudiantService.delete(id);
      if (result.success) {
        loadStudents();
        loadDashboardStats();
        addNotification(`✅ Étudiant ${student?.prenom} ${student?.nom} supprimé avec succès`, 'success');
        addActivity('alert', `Étudiant supprimé: ${student?.nom} ${student?.prenom}`);
        alert('✅ Étudiant supprimé avec succès');
      } else {
        addNotification(`❌ Erreur lors de la suppression de l'étudiant`, 'error');
        alert(`❌ ${result.message}`);
      }
    } catch (err) {
      addNotification(`❌ Erreur lors de la suppression de l'étudiant`, 'error');
      alert('❌ Erreur lors de la suppression');
    }
  };

  // Fonction pour modifier un étudiant
  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowEditStudentModal(true);
  };

  // Fonction pour supprimer un enseignant
  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) return;
    
    try {
      const teacher = teachersData.find(t => t.id === id);
      const result = await enseignantService.delete(id);
      if (result.success) {
        loadTeachers();
        loadDashboardStats();
        addActivity('alert', `Enseignant supprimé: ${teacher?.nom} ${teacher?.prenom}`);
        alert('✅ Enseignant supprimé avec succès');
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (err) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  // Fonction pour modifier un enseignant
  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowEditTeacherModal(true);
  };

  // Fonction pour supprimer un département
  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) return;
    
    try {
      const dept = departmentsData.find(d => d.id === id);
      const result = await departementService.delete(id);
      if (result.success) {
        loadDepartments();
        loadDashboardStats();
        addActivity('alert', `Département supprimé: ${dept?.nom}`);
        alert('✅ Département supprimé avec succès');
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (err) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  // Fonction pour modifier un département
  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setShowEditDepartmentModal(true);
  };

  // Fonction pour supprimer une classe
  const handleDeleteClasse = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) return;
    
    try {
      const classe = classesData.find(c => c.id === id);
      const result = await classeService.delete(id);
      if (result.success) {
        loadClasses();
        loadDashboardStats();
        addActivity('alert', `Classe supprimée: ${classe?.nom}`);
        alert('✅ Classe supprimée avec succès');
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (err) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  // Fonction pour modifier une classe
  const handleEditClasse = (classe) => {
    setSelectedClasse(classe);
    setShowEditClasseModal(true);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'students', label: 'Étudiants', icon: Users },
    { id: 'teachers', label: 'Enseignants', icon: UserCheck },
    { id: 'departments', label: 'Départements', icon: Building2 },
    { id: 'subjects', label: 'Classes', icon: BookOpen },
    { id: 'matieres', label: 'Matières', icon: BookOpen },
    { id: 'salles', label: 'Salles', icon: Building2 },
    { id: 'events', label: 'Événements', icon: FileText },
    { id: 'reports', label: 'Rapports', icon: FileText },
    { id: 'messages', label: 'Messagerie', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Mon Profil', icon: User }
  ];

  // Filtrer les données selon la recherche
  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = 
      student.nom?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.prenom?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.cin?.toLowerCase().includes(studentSearchTerm.toLowerCase());
    
    // Filtrer par classe
    let matchesClasse = true;
    if (selectedClasseFilter) {
      const classeId = typeof student.classe === 'object' ? student.classe?.id : student.classe;
      matchesClasse = String(classeId) === String(selectedClasseFilter);
    }
    
    return matchesSearch && matchesClasse;
  });

  const filteredTeachers = teachersData.filter(teacher => 
    teacher.nom?.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.prenom?.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.cin?.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.telephone?.toLowerCase().includes(teacherSearchTerm.toLowerCase())
  );

  const filteredDepartments = departmentsData.filter(dept => 
    dept.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Deriver la liste des spécialités disponibles (depuis `classesData`)
  const specialitesList = (() => {
    // Prefer using the dedicated spécialité endpoint when available
    if (specialitesData && specialitesData.length) return specialitesData;

    const map = new Map();
    // Prefer specialités provenant des classes si présentes
    classesData.forEach(c => {
      const s = c.specialite || (c.specialite === undefined ? null : c.specialite);
      if (s && s.id && !map.has(s.id)) map.set(s.id, s);
    });
    // Fallback: extraire les spécialités référencées par les matières (si classes n'ont pas été peuplées avec specialite)
    matieresData.forEach(m => {
      const s = m.specialite || (m.classe && m.classe.specialite) || null;
      if (s && s.id && !map.has(s.id)) map.set(s.id, s);
    });
    return Array.from(map.values());
  })();

  // Liste des niveaux dérivée
  const niveauxList = (() => {
    const map = new Map();
    // essayer matieresData puis classesData
    matieresData.forEach(m => {
      const n = m.niveau || m.classe?.niveau;
      if (n && n.id && !map.has(n.id)) map.set(n.id, n);
    });
    classesData.forEach(c => {
      const n = c.niveau;
      if (n && n.id && !map.has(n.id)) map.set(n.id, n);
    });
    return Array.from(map.values());
  })();

  // Map classeId -> specialite/niveau inferred from matieres (fallback when classe.specialite/niveau are null)
  const classSpecialiteMap = (() => {
    const m = new Map();
    matieresData.forEach(mat => {
      const cid = mat.classe?.id || (mat.classe ? (typeof mat.classe === 'number' ? mat.classe : mat.classe.id) : null);
      if (!cid) return;
      const key = String(cid);
      if (mat.specialite) m.set(key, mat.specialite);
      else if (mat.classe?.specialite) m.set(key, mat.classe.specialite);
    });
    return m;
  })();

  const classNiveauMap = (() => {
    const m = new Map();
    matieresData.forEach(mat => {
      const cid = mat.classe?.id || (mat.classe ? (typeof mat.classe === 'number' ? mat.classe : mat.classe.id) : null);
      if (!cid) return;
      const key = String(cid);
      if (mat.niveau) m.set(key, mat.niveau);
      else if (mat.classe?.niveau) m.set(key, mat.classe.niveau);
    });
    return m;
  })();

  // Also build name-based maps in case matiere.classe references only name or classe.specialite is missing
  const classSpecialiteMapByName = (() => {
    const m = new Map();
    matieresData.forEach(mat => {
      const cname = mat.classe?.nom || (mat.classe && typeof mat.classe === 'string' ? mat.classe : null);
      const spec = mat.specialite || mat.classe?.specialite || null;
      if (!cname || !spec) return;
      const key = String(cname).trim();
      if (!m.has(key)) m.set(key, spec);
    });
    return m;
  })();

  const classNiveauMapByName = (() => {
    const m = new Map();
    matieresData.forEach(mat => {
      const cname = mat.classe?.nom || (mat.classe && typeof mat.classe === 'string' ? mat.classe : null);
      const niv = mat.niveau || mat.classe?.niveau || null;
      if (!cname || !niv) return;
      const key = String(cname).trim();
      if (!m.has(key)) m.set(key, niv);
    });
    return m;
  })();

  // Filtrer les matières selon la recherche, la classe, le département et la spécialité sélectionnés
  const filteredMatieres = matieresData.filter(m => {
    const q = searchTerm?.toLowerCase() || '';
    const matchesSearch = !q || (m.nom && m.nom.toLowerCase().includes(q)) || (m.code && m.code.toLowerCase().includes(q));

    // (Ne pas filtrer par classe ici — le filtre de classe est utilisé pour les étudiants seulement)
    const matchesClasse = true;

    // Filtre département
    let matchesDept = true;
    if (selectedDepartementForMatiere) {
      const deptId = m.departement?.id || (m.classe?.specialite?.departement?.id) || (m.specialite?.departement?.id);
      matchesDept = String(deptId) === String(selectedDepartementForMatiere);
    }

    // Filtre spécialité
    let matchesSpec = true;
    if (selectedSpecialiteFilter) {
      const specId = m.specialite?.id || m.classe?.specialite?.id;
      matchesSpec = String(specId) === String(selectedSpecialiteFilter);
    }

    // Filtre niveau
    let matchesNiv = true;
    if (selectedNiveauFilter) {
      const nivId = m.niveau?.id || m.classe?.niveau?.id;
      matchesNiv = String(nivId) === String(selectedNiveauFilter);
    }

    return matchesSearch && matchesClasse && matchesDept && matchesSpec && matchesNiv;
  });

  // Rendu du Dashboard
  // helper to pluralize 'matière'
  const s = (n) => (n > 1 ? 's' : '');
  const renderDashboard = () => {
    // Données pour les graphiques
    const statsBarData = [
      { label: 'Étudiants', value: stats.students },
      { label: 'Enseignants', value: stats.teachers },
      { label: 'Départements', value: stats.departments },
      { label: 'Classes', value: stats.classes },
      { label: 'Salles', value: stats.salles },
      { label: 'Matières', value: stats.matieres }
    ];

    // Étudiants par département
    const _studentsByDeptData = departmentsData.map(dept => ({
      label: dept.nom,
      value: studentsData.filter(s => {
        // Trouver la classe de l'étudiant et son département via spécialité
        const classe = classesData.find(c => {
          const classeId = typeof s.classe === 'object' ? s.classe?.id : s.classe;
          return String(c.id) === String(classeId);
        });
        if (!classe) return false;
        const specialite = classe.specialite;
        if (!specialite) return false;
        const deptId = typeof specialite.departement === 'object' ? specialite.departement?.id : specialite.departement;
        return String(deptId) === String(dept.id);
      }).length
    })).filter(item => item.value > 0);

    // Classes par département
    const _classesByDeptData = departmentsData.map(dept => ({
      label: dept.nom,
      value: classesData.filter(c => {
        const specialite = c.specialite;
        if (!specialite) return false;
        const deptId = typeof specialite.departement === 'object' ? specialite.departement?.id : specialite.departement;
        return String(deptId) === String(dept.id);
      }).length
    })).filter(item => item.value > 0);

    const teachersByDeptData = departmentsData.map(dept => ({
      label: dept.nom,
      value: teachersData.filter(t => {
        const deptId = typeof t.departement === 'object' ? t.departement?.id : t.departement;
        return String(deptId) === String(dept.id);
      }).length
    })).filter(item => item.value > 0);

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Étudiants"
            value={stats.students}
            icon={Users}
            color="blue"
            subtitle="Total inscrits"
          />
          <StatCard
            title="Enseignants"
            value={stats.teachers}
            icon={UserCheck}
            color="green"
            subtitle="Corps enseignant"
          />
          <StatCard
            title="Départements"
            value={stats.departments}
            icon={Building2}
            color="orange"
            subtitle="Départements actifs"
          />
          <StatCard
            title="Classes"
            value={stats.classes}
            icon={BookOpen}
            color="purple"
            subtitle="Classes ouvertes"
          />
          <StatCard
            title="Salles"
            value={stats.salles}
            icon={Building2}
            color="blue"
            subtitle="Salles disponibles"
          />
          <StatCard
            title="Matières"
            value={stats.matieres}
            icon={FileText}
            color="green"
            subtitle="Matières enregistrées"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <BarChart 
            data={statsBarData} 
            title="Vue d'ensemble de l'établissement"
            height={300}
          />
        </div>

        {/* Salles / Matières breakdown charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Salles par département</h3>
            <BarChart data={
              departmentsData.map(dept => ({
                label: dept.nom,
                value: sallesData.filter(s => {
                  const depId = typeof s.departement === 'object' ? s.departement?.id : s.departement;
                  return String(depId) === String(dept.id);
                }).length
              })).filter(i => i.value > 0)
            } height={260} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Matières par département</h3>
            <PieChart data={
              departmentsData.map(dept => ({
                label: dept.nom,
                value: matieresData.filter(m => {
                  // Matière peut référencer specialite or departement
                  const depIdFromSpecialite = typeof m.specialite === 'object' ? m.specialite?.departement?.id : m.specialite?.departement;
                  const depIdDirect = typeof m.departement === 'object' ? m.departement?.id : m.departement;
                  const depId = depIdFromSpecialite || depIdDirect;
                  return String(depId) === String(dept.id);
                }).length
              })).filter(i => i.value > 0)
            } size={220} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Statistiques par département</h3>
            <button 
              onClick={() => setActiveMenu('departments')} 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tout
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="animate-spin text-blue-600" size={32} />
            </div>
          ) : (
            <div className="space-y-4">
              {departmentsData.slice(0, 4).map((dept, index) => (
                <div key={dept.id || index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{dept.nom}</h4>
                    <span className="text-sm text-gray-500">Code: {dept.code}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-blue-600" />
                      <span className="text-gray-600">Département {dept.code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Activités récentes</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.type === 'user' && <Users size={16} className="text-blue-600" />}
                  {activity.type === 'alert' && <AlertCircle size={16} className="text-orange-600" />}
                  {activity.type === 'document' && <FileText size={16} className="text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 mb-1">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
    );
  };

  // Rendu de la page Étudiants
  const renderStudents = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Gestion des Étudiants</h3>
        <button 
          onClick={() => setShowAddStudentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Ajouter étudiant
        </button>
      </div>
      
      <div className="mb-4 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, prénom, email ou CIN..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={studentSearchTerm}
            onChange={(e) => setStudentSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={selectedClasseFilter}
          onChange={(e) => setSelectedClasseFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
        >
          <option value="">Toutes les classes</option>
          {classesData.map(classe => (
            <option key={classe.id} value={classe.id}>{classe.nom}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4 text-sm text-gray-600">
        Affichage de <span className="font-semibold text-gray-800">{filteredStudents.length}</span> étudiant{filteredStudents.length > 1 ? 's' : ''} sur <span className="font-semibold text-gray-800">{studentsData.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <AlertCircle size={40} className="mx-auto mb-4" />
          <p>{error}</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users size={40} className="mx-auto mb-4 text-gray-300" />
          <p>Aucun étudiant trouvé</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{student.nom}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.prenom}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.classe?.nom || 'Non assigné'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditStudent(student)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Rendu de la page Enseignants
  const renderTeachers = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Gestion des Enseignants</h3>
        <button 
          onClick={() => setShowAddTeacherModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Ajouter enseignant
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, prénom, email, CIN ou téléphone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={teacherSearchTerm}
            onChange={(e) => setTeacherSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <AlertCircle size={40} className="mx-auto mb-4" />
          <p>{error}</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <UserCheck size={40} className="mx-auto mb-4 text-gray-300" />
          <p>Aucun enseignant trouvé</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{teacher.nom}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{teacher.prenom}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{teacher.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{teacher.telephone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{teacher.grade || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditTeacher(teacher)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Rendu de la page Événements
  const renderEvents = () => {
    // Filtrer les événements selon la recherche
    const filteredEvents = events.filter(event => {
      const matchesSearch = 
        event.titre?.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
        event.lieu?.toLowerCase().includes(eventSearchTerm.toLowerCase());
      
      return matchesSearch;
    });

    return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Gestion des Événements</h3>
        <button
          onClick={() => setShowAddEventModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Ajouter événement
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par titre, description ou lieu..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={eventSearchTerm}
            onChange={(e) => setEventSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Affichage de <span className="font-semibold text-gray-800">{filteredEvents.length}</span> événement{filteredEvents.length > 1 ? 's' : ''} sur <span className="font-semibold text-gray-800">{events.length}</span>
      </div>

      {loadingEvents ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <AlertCircle size={40} className="mx-auto mb-4" />
          <p>{error}</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText size={40} className="mx-auto mb-4 text-gray-300" />
          <p>Aucun événement trouvé</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{event.titre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.type === 'conference' ? 'bg-blue-100 text-blue-800' :
                      event.type === 'journee_pedagogique' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.type === 'conference' ? 'Conférence' :
                       event.type === 'journee_pedagogique' ? 'Journée pédagogique' :
                       'Fermeture'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(event.dateDebut).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {event.dateFin ? new Date(event.dateFin).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.lieu || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    );
  };

  // Rendu de la page Départements
  const renderDepartments = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Gestion des Départements</h3>
        <button 
          onClick={() => setShowAddDepartmentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Ajouter département
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <AlertCircle size={40} className="mx-auto mb-4" />
          <p>{error}</p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Building2 size={40} className="mx-auto mb-4 text-gray-300" />
          <p>Aucun département trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDepartments.map((dept) => (
            <div key={dept.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{dept.nom}</h4>
                  <p className="text-sm text-gray-600">Code: {dept.code}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditDepartment(dept)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteDepartment(dept.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Rendu de la page Classes
  const renderSubjects = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Gestion des Classes</h3>
        <button 
          onClick={() => setShowAddClasseModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Ajouter classe
        </button>
      </div>

      {/* Classes listing and filters (mirrors Matières behavior; no debug panel) */}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : classesData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-4 text-gray-300" />
          <p>Aucune classe trouvée</p>
        </div>
      ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 w-full md:w-1/2">
                  <input
                    type="text"
                    placeholder="Rechercher classe ..."
                    value={classSearchTerm}
                    onChange={(e) => setClassSearchTerm(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex bg-gray-50 border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setClassesViewMode('list')}
                      className={`px-3 py-2 text-sm ${classesViewMode === 'list' ? 'bg-white text-gray-800' : 'text-gray-600'}`}
                    >
                      Liste
                    </button>
                    <button
                      onClick={() => setClassesViewMode('grouped')}
                      className={`px-3 py-2 text-sm ${classesViewMode === 'grouped' ? 'bg-white text-gray-800' : 'text-gray-600'}`}
                    >
                      Groupé
                    </button>
                  </div>
                </div>
              </div>

              {/* compute filtered classes */}
              {(() => {
                const q = classSearchTerm?.toLowerCase() || '';

                // Disable department/specialite/niveau filtering for classes: show full classes list
                const visibleClasses = classesData;

                // (filters disabled)

                const filtered = visibleClasses.filter(c => {
                  const matchesSearch = !q || (c.nom && c.nom.toLowerCase().includes(q)) || (c.code && c.code.toLowerCase().includes(q));

                  // Resolve specialite/niveau from classe or fallback maps
                  const _resolvedSpecialite = c.specialite || classSpecialiteMap.get(String(c.id)) || classSpecialiteMapByName.get(String(c.nom || '').trim()) || null;
                  const _resolvedNiveau = c.niveau || classNiveauMap.get(String(c.id)) || classNiveauMapByName.get(String(c.nom || '').trim()) || null;

                  // Filtre département: disabled — always include
                  const matchesDept = true;

                  // Spécialité / niveau filters removed: always include
                  const matchesSpec = true;
                  const matchesNiv = true;

                  return matchesSearch && matchesDept && matchesSpec && matchesNiv;
                });

                if (classesViewMode === 'list') {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filtered.map(classe => {
                        const _resolvedSpecialite = classe.specialite || classSpecialiteMap.get(String(classe.id)) || classSpecialiteMapByName.get(String(classe.nom || '').trim()) || null;
                        const _resolvedNiveau = classe.niveau || classNiveauMap.get(String(classe.id)) || classNiveauMapByName.get(String(classe.nom || '').trim()) || null;
                        return (
                        <div key={classe.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-gray-800 mb-1">{classe.nom}</h4>
                              {/* Spécialité / Niveau / Département intentionally removed per request */}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleEditClasse(classe)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Modifier"><Edit size={18} /></button>
                              <button onClick={() => handleDeleteClasse(classe.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Supprimer"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                  );
                }

                // grouped: group by specialite -> niveau
                const groups = new Map();
                filtered.forEach(c => {
                  const resolvedSpecialite = c.specialite || classSpecialiteMap.get(String(c.id)) || classSpecialiteMapByName.get(String(c.nom || '').trim()) || null;
                  const resolvedNiveau = c.niveau || classNiveauMap.get(String(c.id)) || classNiveauMapByName.get(String(c.nom || '').trim()) || null;
                  const sKey = resolvedSpecialite ? `spec-${resolvedSpecialite.id}` : 'spec-null';
                  if (!groups.has(sKey)) groups.set(sKey, { specialite: resolvedSpecialite, niveaux: new Map() });
                  const g = groups.get(sKey);
                  const nKey = resolvedNiveau ? `niv-${resolvedNiveau.id}` : 'niv-null';
                  if (!g.niveaux.has(nKey)) g.niveaux.set(nKey, { niveau: resolvedNiveau, items: [] });
                  g.niveaux.get(nKey).items.push(c);
                });

                return (
                  <div className="space-y-6">
                    {Array.from(groups.values()).map(g => {
                      // helper to parse a numeric level from niveau name (same logic as matieres)
                      const parseLevel = (name) => {
                        if (!name) return 999;
                        const mnum = name.match(/(\d+)/);
                        if (mnum) return parseInt(mnum[1], 10);
                        const lower = name.toLowerCase();
                        if (lower.includes('prem') || lower.includes('1er') || lower.includes('1re')) return 1;
                        if (lower.includes('deux') || lower.includes('2') || lower.includes('2eme')) return 2;
                        if (lower.includes('trois') || lower.includes('3') || lower.includes('3eme')) return 3;
                        return 999;
                      };

                      const niveauxArr = Array.from(g.niveaux.values());
                      const sortedNiveaux = niveauxArr.sort((a, b) => {
                        const na = parseLevel(a.niveau?.nom);
                        const nb = parseLevel(b.niveau?.nom);
                        if (na !== nb) return na - nb;
                        return (a.niveau?.nom || '').localeCompare(b.niveau?.nom || '');
                      });

                      return (
                        <div key={g.specialite?.id ?? 'spec-null'} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3">{g.specialite?.nom ?? ''}</h4>
                          {sortedNiveaux.map(nObj => (
                            <div key={nObj.niveau?.id ?? 'niv-null'} className="mb-4">
                              <div className="text-sm text-gray-600 font-medium mb-2">{nObj.niveau?.nom ?? 'Classes'} <span className="text-xs text-gray-500">({nObj.items.length})</span></div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {nObj.items
                                  .sort((x, y) => (x.nom || '').localeCompare(y.nom || ''))
                                  .map(cl => (
                                  <div key={cl.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="font-medium text-gray-800">{cl.nom}</div>
                                      <div className="flex gap-2">
                                        <button onClick={() => handleEditClasse(cl)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Modifier"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteClasse(cl.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Supprimer"><Trash2 size={16} /></button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
      )}
    </div>
  );

  // Rendu de la page Matières
  const renderMatieres = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Gestion des Matières</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenAddMatiere()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            Ajouter matière
          </button>
        </div>
      </div>

      {/* Controls: recherche, filtre par classe, mode d'affichage */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <input
            type="text"
            placeholder="Rechercher matière ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDepartementForMatiere}
            onChange={(e) => { setSelectedDepartementForMatiere(e.target.value); setSelectedSpecialiteFilter(''); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous départements</option>
            {departmentsData.map(d => (
              <option key={d.id} value={d.id}>{d.nom}</option>
            ))}
          </select>

          <select
            value={selectedSpecialiteFilter}
            onChange={(e) => setSelectedSpecialiteFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Toutes spécialités</option>
            {(() => {
              const opts = specialitesList
                .filter(s => {
                  if (!selectedDepartementForMatiere) return true;
                  // robust department id extraction: support { departement: {id} } or departementId or departement scalar
                  const sDept = s?.departement;
                  const sDeptId = (sDept && (sDept.id ?? sDept)) ?? (s.departementId ?? s.departement) ?? null;
                  return String(sDeptId) === String(selectedDepartementForMatiere);
                })
                .map(s => ({ id: s?.id ?? s, nom: s?.nom ?? s?.code ?? (`Specialite ${s?.id ?? s}`) }));
              if (opts.length === 0) return <option value="">(Aucune spécialité)</option>;
              return opts.map(s => <option key={s.id} value={s.id}>{s.nom}</option>);
            })()}
          </select>

          <select
            value={selectedNiveauFilter}
            onChange={(e) => setSelectedNiveauFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous niveaux</option>
            {niveauxList.map(n => (
              <option key={n.id} value={n.id}>{n.nom}</option>
            ))}
          </select>

          {/* Classe filter removed for matières (not needed) */}

          <div className="inline-flex bg-gray-50 border border-gray-200 rounded-lg">
            <button
              onClick={() => setMatieresViewMode('list')}
              className={`px-3 py-2 text-sm ${matieresViewMode === 'list' ? 'bg-white text-gray-800' : 'text-gray-500'}`}
              title="Liste"
            >Liste</button>
            <button
              onClick={() => setMatieresViewMode('grouped')}
              className={`px-3 py-2 text-sm ${matieresViewMode === 'grouped' ? 'bg-white text-gray-800' : 'text-gray-500'}`}
              title="Groupé par spécialité"
            >Groupé</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : filteredMatieres.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-4 text-gray-300" />
          <p>Aucune matière trouvée</p>
        </div>
      ) : matieresViewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatieres.map((m) => (
            <div key={m.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">{m.nom}</h4>
                  <p className="text-sm text-gray-600">Spécialité: {m.specialite?.nom || m.classe?.specialite?.nom || '—'}</p>
                  <p className="text-sm text-gray-500">Niveau: {m.niveau?.nom || m.classe?.niveau?.nom || '—'}</p>
                  <p className="text-sm text-gray-500">Département: {m.departement?.nom || '—'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEditMatiere(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Modifier"><Edit size={18} /></button>
                  <button onClick={() => handleDeleteMatiere(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Supprimer"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Grouped view by spécialité
        <div className="space-y-6">
          {(() => {
            const groups = {};
            filteredMatieres.forEach(m => {
              const sname = m.specialite?.nom || m.classe?.specialite?.nom || '';
              const sdept = m.specialite?.departement?.nom || m.classe?.specialite?.departement?.nom || m.departement?.nom || '';
              const key = `${sname}|||${sdept}`;
              if (!groups[key]) groups[key] = { name: sname, dept: sdept, items: [] };
              groups[key].items.push(m);
            });
            return Object.keys(groups).map((key) => {
              const g = groups[key];
              // within each specialty group, group by niveau
              const byNiveau = {};
              g.items.forEach(m => {
                const nivName = m.niveau?.nom || m.classe?.niveau?.nom || 'Sans niveau';
                if (!byNiveau[nivName]) byNiveau[nivName] = [];
                byNiveau[nivName].push(m);
              });

              // helper to parse a numeric level from niveau name (e.g., '1ere annee' -> 1)
              const parseLevel = (name) => {
                if (!name) return 999;
                const mnum = name.match(/(\d+)/);
                if (mnum) return parseInt(mnum[1], 10);
                // match common french words
                const lower = name.toLowerCase();
                if (lower.includes('prem') || lower.includes('1er') || lower.includes('1re')) return 1;
                if (lower.includes('deux') || lower.includes('2') || lower.includes('2eme')) return 2;
                if (lower.includes('trois') || lower.includes('3') || lower.includes('3eme')) return 3;
                return 999;
              };

              const sortedNiveaux = Object.keys(byNiveau).sort((a, b) => {
                const na = parseLevel(a);
                const nb = parseLevel(b);
                if (na !== nb) return na - nb;
                return a.localeCompare(b);
              });

              return (
                <div key={key} className="border border-gray-100 rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Spécialité: {g.name}</h4>
                      {g.dept && <div className="text-sm text-gray-500">Département: {g.dept}</div>}
                    </div>
                    <div className="text-sm text-gray-500">{g.items.length} matière(s)</div>
                  </div>
                  <div className="p-4 space-y-4">
                    {sortedNiveaux.map(niv => (
                      <div key={niv}>
                        <div className="mb-3">
                          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-gray-100 shadow-sm">
                            <div className="text-lg font-bold text-gray-800">Niveau: {niv}</div>
                            <div className="text-sm text-gray-500">{byNiveau[niv].length} matière{s(byNiveau[niv].length)}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {byNiveau[niv]
                            .sort((x, y) => {
                              // sort items by parsed niveau number then name
                              const px = parseLevel(x.niveau?.nom || x.classe?.niveau?.nom);
                              const py = parseLevel(y.niveau?.nom || y.classe?.niveau?.nom);
                              if (px !== py) return px - py;
                              return (x.nom || '').localeCompare(y.nom || '');
                            })
                            .map(m => (
                              <div key={m.id} className="p-3 border border-gray-200 rounded hover:shadow-sm flex items-start justify-between">
                                <div>
                                  <div className="font-medium">{m.nom}</div>
                                  <div className="text-xs text-gray-500">Spécialité: {m.specialite?.nom || m.classe?.specialite?.nom || '—'} — Niveau: {m.niveau?.nom || m.classe?.niveau?.nom || '—'}</div>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleOpenEditMatiere(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Modifier"><Edit size={16} /></button>
                                  <button onClick={() => handleDeleteMatiere(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Supprimer"><Trash2 size={16} /></button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );

  // Rendu de la page Salles
  const renderSalles = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Gestion des Salles</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenAddSalle()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            Ajouter salle
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : sallesData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Building2 size={40} className="mx-auto mb-4 text-gray-300" />
          <p>Aucune salle trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sallesData.map((s) => (
            <div key={s.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">{s.nom}</h4>
                  <p className="text-sm text-gray-600">Code: {s.code}</p>
                  <p className="text-sm text-gray-500">Capacité: {s.capacite || '—'}</p>
                  <p className="text-sm text-gray-500">Département: {s.departement?.nom || '—'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEditSalle(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Modifier"><Edit size={18} /></button>
                  <button onClick={() => handleDeleteSalle(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Supprimer"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Rendu de la page Rapports
  // Fonctions de génération de rapports
  const generateStudentsCSV = () => {
    if (studentsData.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const headers = ['ID', 'Nom', 'Prénom', 'Email', 'CIN', 'Classe'];
    const rows = studentsData.map(s => [
      s.id,
      s.nom,
      s.prenom,
      s.email,
      s.cin || '',
      s.classe?.nom || 'Non assigné'
    ]);

    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_etudiants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addActivity('document', 'Rapport étudiants généré et téléchargé');
  };

  const generateTeachersCSV = () => {
    if (teachersData.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const headers = ['ID', 'Nom', 'Prénom', 'Email', 'CIN', 'Téléphone', 'Spécialité', 'Grade', 'Rôle'];
    const rows = teachersData.map(t => [
      t.id,
      t.nom,
      t.prenom,
      t.email,
      t.cin || '',
      t.telephone || '',
      t.specialite || '',
      t.grade || '',
      t.role || 'enseignant'
    ]);

    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_enseignants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addActivity('document', 'Rapport enseignants généré et téléchargé');
  };

  const generateDepartmentsCSV = () => {
    if (departmentsData.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const headers = ['ID', 'Nom', 'Nombre de classes'];
    const rows = departmentsData.map(d => [
      d.id,
      d.nom,
      classesData.filter(c => c.specialite?.departement?.id === d.id || c.departement?.id === d.id).length
    ]);

    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_departements_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addActivity('document', 'Rapport départements généré et téléchargé');
  };

  const generateInstitutionalReport = () => {
    const report = `RAPPORT INSTITUTIONNEL
Date: ${new Date().toLocaleDateString('fr-FR')}
==========================================

STATISTIQUES GÉNÉRALES:
- Nombre total d'étudiants: ${stats.students}
- Nombre total d'enseignants: ${stats.teachers}
- Nombre de départements: ${stats.departments}
- Nombre de classes: ${stats.classes}

DÉPARTEMENTS:
${departmentsData.map(d => `- ${d.nom}`).join('\n')}

CLASSES:
${classesData.map(c => `- ${c.nom}`).join('\n')}
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_institutionnel_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    addActivity('document', 'Rapport institutionnel généré et téléchargé');
  };

  const renderReports = () => {
    // Étudiants par département
    const _studentsByDeptData = departmentsData.map(dept => ({
      label: dept.nom,
      value: studentsData.filter(s => {
        const classe = classesData.find(c => {
          const classeId = typeof s.classe === 'object' ? s.classe?.id : s.classe;
          return String(c.id) === String(classeId);
        });
        if (!classe) return false;
        const specialite = classe.specialite;
        if (!specialite) return false;
        const deptId = typeof specialite.departement === 'object' ? specialite.departement?.id : specialite.departement;
        return String(deptId) === String(dept.id);
      }).length
    })).filter(item => item.value > 0);

    // Classes par département
    const _classesByDeptData = departmentsData.map(dept => ({
      label: dept.nom,
      value: classesData.filter(c => {
        const specialite = c.specialite;
        if (!specialite) return false;
        const deptId = typeof specialite.departement === 'object' ? specialite.departement?.id : specialite.departement;
        return String(deptId) === String(dept.id);
      }).length
    })).filter(item => item.value > 0);

    const _teachersByGradeData = [
      { label: 'Professeur', value: teachersData.filter(t => t.grade === 'Professeur').length },
      { label: 'Maître Assistant', value: teachersData.filter(t => t.grade === 'Maître Assistant').length },
      { label: 'Assistant', value: teachersData.filter(t => t.grade === 'Assistant').length },
      { label: 'Technicien', value: teachersData.filter(t => t.grade === 'Technicien').length }
    ].filter(item => item.value > 0);

    return (
      <div className="space-y-6">


        {/* Section Exports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Rapports et Exports</h3>
            <p className="text-sm text-gray-600">Téléchargez les données en format CSV</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <FileText size={32} className="text-blue-600 mb-3" />
              <h4 className="text-lg font-bold text-gray-800 mb-2">Rapport Étudiants</h4>
              <p className="text-sm text-gray-600 mb-4">Liste complète des étudiants ({stats.students})</p>
              <button 
                onClick={generateStudentsCSV}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
              >
                Télécharger CSV
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <FileText size={32} className="text-green-600 mb-3" />
              <h4 className="text-lg font-bold text-gray-800 mb-2">Rapport Enseignants</h4>
              <p className="text-sm text-gray-600 mb-4">Liste complète des enseignants ({stats.teachers})</p>
              <button 
                onClick={generateTeachersCSV}
                className="text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
              >
                Télécharger CSV
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <FileText size={32} className="text-purple-600 mb-3" />
              <h4 className="text-lg font-bold text-gray-800 mb-2">Rapport Départements</h4>
              <p className="text-sm text-gray-600 mb-4">Vue d'ensemble des départements ({stats.departments})</p>
              <button 
                onClick={generateDepartmentsCSV}
                className="text-sm bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium"
              >
                Télécharger CSV
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <FileText size={32} className="text-orange-600 mb-3" />
              <h4 className="text-lg font-bold text-gray-800 mb-2">Rapport Institutionnel</h4>
              <p className="text-sm text-gray-600 mb-4">Vue d'ensemble de l'établissement</p>
              <button 
                onClick={generateInstitutionalReport}
                className="text-sm bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 font-medium"
              >
                Télécharger TXT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu de la page Notifications
  const renderNotifications = () => {
    const getNotificationIcon = (type) => {
      switch(type) {
        case 'success': return <Users size={20} className="text-green-600" />;
        case 'warning': return <AlertCircle size={20} className="text-orange-600" />;
        case 'error': return <AlertCircle size={20} className="text-red-600" />;
        default: return <Bell size={20} className="text-blue-600" />;
      }
    };

    const getNotificationBgColor = (type) => {
      switch(type) {
        case 'success': return 'bg-green-50';
        case 'warning': return 'bg-orange-50';
        case 'error': return 'bg-red-50';
        default: return 'bg-blue-50';
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Centre de Notifications</h3>
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications sont lues'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell size={40} className="mx-auto mb-4 text-gray-300" />
            <p>Aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`border rounded-lg p-4 transition-all ${
                  notif.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 ${getNotificationBgColor(notif.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm mb-1 ${notif.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500">{notif.time}</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    {!notif.read && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Marquer lu
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Supprimer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Rendu de la page Messagerie
  const renderMessages = () => {
    const receivedMessages = messages.filter(m => m.receiverEmail === user?.email);
    const sentMessages = messages.filter(m => m.senderEmail === user?.email);
    
    const filteredMessages = messageFilter === 'received' ? receivedMessages :
                            messageFilter === 'sent' ? sentMessages :
                            messages;

    return (
      <div className="space-y-6">
        {/* Header avec bouton composer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Messagerie Interne</h3>
              <p className="text-sm text-gray-600 mt-1">
                {unreadMessages > 0 ? `${unreadMessages} message${unreadMessages > 1 ? 's' : ''} non lu${unreadMessages > 1 ? 's' : ''}` : 'Tous les messages sont lus'}
              </p>
            </div>
            <button
              onClick={() => setShowComposeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send size={20} />
              Nouveau message
            </button>
          </div>

          {/* Filtres */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMessageFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                messageFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Inbox size={16} className="inline mr-2" />
              Tous ({messages.length})
            </button>
            <button
              onClick={() => setMessageFilter('received')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                messageFilter === 'received' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Mail size={16} className="inline mr-2" />
              Reçus ({receivedMessages.length})
            </button>
            <button
              onClick={() => setMessageFilter('sent')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                messageFilter === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Send size={16} className="inline mr-2" />
              Envoyés ({sentMessages.length})
            </button>
          </div>

          {/* Liste des messages */}
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail size={40} className="mx-auto mb-4 text-gray-300" />
              <p>Aucun message</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.receiverEmail === user?.email && !msg.isRead) {
                      markMessageAsRead(msg.id);
                    }
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    msg.receiverEmail === user?.email && !msg.isRead
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {msg.receiverEmail === user?.email && !msg.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {msg.senderEmail === user?.email ? 
                            msg.receiverEmail?.charAt(0).toUpperCase() : 
                            msg.senderEmail?.charAt(0).toUpperCase()
                          }
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {msg.senderEmail === user?.email ? `À: ${msg.receiverEmail}` : `De: ${msg.senderEmail}`}
                          </p>
                          <p className="text-sm text-gray-600">{msg.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 ml-14 line-clamp-2">
                        {msg.content}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Supprimer ce message ?')) {
                          deleteMessage(msg.id);
                          if (selectedMessage?.id === msg.id) {
                            setSelectedMessage(null);
                          }
                        }
                      }}
                      className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de composition de message */}
        {showComposeModal && (
          <ComposeMessageModal
            onClose={() => setShowComposeModal(false)}
            onSend={sendMessage}
            teachers={teachersData}
            students={studentsData}
          />
        )}

        {/* Modal de lecture de message */}
        {selectedMessage && (
          <ViewMessageModal
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
            onReply={(to, toName) => {
              setSelectedMessage(null);
              setShowComposeModal(true);
            }}
            currentUserEmail={user?.email}
          />
        )}
      </div>
    );
  };

  // Rendu de la page Profil
  const renderProfile = () => {
    const handleChange = (e) => {
      const { name, value } = e.target;
      setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
      // Mettre à jour le contexte utilisateur via l'API
      const result = await updateUser(profileData);
      
      if (result.success) {
        setIsEditingProfile(false);
        alert('✅ Profil mis à jour avec succès!');
        console.log('Profil sauvegardé:', result.user);
      } else {
        alert('❌ ' + (result.message || 'Erreur lors de la mise à jour du profil'));
      }
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête du profil */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <User size={48} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{user?.prenom} {user?.nom}</h2>
                <p className="text-blue-100 mt-1">{user?.role || 'Administrateur'}</p>
                <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Contenu du profil */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Informations personnelles</h3>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={18} />
                  Modifier
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={profileData.nom}
                  onChange={handleChange}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditingProfile ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={profileData.prenom}
                  onChange={handleChange}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditingProfile ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditingProfile ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
                <input
                  type="text"
                  name="cin"
                  value={profileData.cin}
                  onChange={handleChange}
                  maxLength="8"
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditingProfile ? 'bg-gray-50 text-gray-600' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <input
                  type="text"
                  name="role"
                  value={profileData.role}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {isEditingProfile && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Enregistrer les modifications
                </button>
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileData({
                      nom: user?.nom || '',
                      prenom: user?.prenom || '',
                      email: user?.email || '',
                      telephone: user?.telephone || '',
                      role: user?.role || 'Administrateur'
                    });
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal de composition de message
  const ComposeMessageModal = ({ onClose, onSend, teachers, students }) => {
    const [to, setTo] = useState('');
    const [_toName, setToName] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [recipientType, setRecipientType] = useState('teacher');

    const handleSend = () => {
      if (!to || !subject || !body) {
        alert('Veuillez remplir tous les champs');
        return;
      }
      const receiverRole = recipientType === 'teacher' ? 'enseignant' : 'etudiant';
      onSend(to, receiverRole, subject, body);
      onClose();
    };

    const recipients = recipientType === 'teacher' ? teachers : students;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Nouveau Message</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de destinataire</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="teacher"
                    checked={recipientType === 'teacher'}
                    onChange={(e) => { setRecipientType(e.target.value); setTo(''); setToName(''); }}
                    className="mr-2"
                  />
                  Enseignant
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="student"
                    checked={recipientType === 'student'}
                    onChange={(e) => { setRecipientType(e.target.value); setTo(''); setToName(''); }}
                    className="mr-2"
                  />
                  Étudiant
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destinataire *</label>
              <select
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  const selected = recipients.find(r => r.email === e.target.value);
                  setToName(selected ? `${selected.prenom} ${selected.nom}` : '');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un destinataire</option>
                {recipients.map(r => (
                  <option key={r.id} value={r.email}>
                    {r.prenom} {r.nom} ({r.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sujet *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Sujet du message"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Écrivez votre message ici..."
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send size={18} />
              Envoyer
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de lecture de message
  const ViewMessageModal = ({ message, onClose, onReply, currentUserEmail }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">{message.subject}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {message.senderEmail === currentUserEmail ? 
                  message.receiverEmail?.charAt(0).toUpperCase() : 
                  message.senderEmail?.charAt(0).toUpperCase()
                }
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {message.senderEmail === currentUserEmail ? 
                    `À: ${message.receiverEmail}` : 
                    `De: ${message.senderEmail}`
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {message.senderEmail === currentUserEmail ? 
                    `Rôle: ${message.receiverRole}` : 
                    `Rôle: ${message.senderRole}`
                  }
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{new Date(message.createdAt).toLocaleDateString('fr-FR')}</p>
                <p>{new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{message.content}</p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
            {message.senderEmail !== currentUserEmail && (
              <button
                onClick={() => onReply(message.senderEmail, message.senderRole)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Send size={18} />
                Répondre
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Fonction pour rendre le contenu selon le menu actif
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return renderDashboard();
      case 'students': return renderStudents();
      case 'teachers': return renderTeachers();
      case 'departments': return renderDepartments();
      case 'subjects': return renderSubjects();
      case 'matieres': return renderMatieres();
      case 'salles': return renderSalles();
      case 'events': return renderEvents();
      case 'reports': return renderReports();
      case 'messages': return renderMessages();
      case 'notifications': return renderNotifications();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-700">
          {sidebarOpen && <h1 className="text-xl font-bold">ISET Tozeur</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-700 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                activeMenu === item.id
                  ? 'bg-blue-700 shadow-lg'
                  : 'hover:bg-blue-800'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              {item.id === 'messages' && unreadMessages > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-700">
          <div className="space-y-3">
            {/* Profil utilisateur */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                {user?.nom ? user.nom.charAt(0).toUpperCase() : 'A'}
                {user?.prenom ? user.prenom.charAt(0).toUpperCase() : 'D'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-blue-300 truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.id === activeMenu)?.label || 'Tableau de bord'}
              </h2>
              <p className="text-sm text-gray-500">Plateforme de gestion universitaire</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveMenu('messages')}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Messagerie"
              >
                <Mail size={20} className="text-gray-600" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveMenu('notifications')}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      {/* Modaux */}
      <AddStudentModal 
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onStudentAdded={() => {
          loadStudents();
          loadDashboardStats();
        }}
      />

      <AddTeacherModal 
        isOpen={showAddTeacherModal}
        onClose={() => setShowAddTeacherModal(false)}
        onTeacherAdded={() => {
          loadTeachers();
          loadDashboardStats();
        }}
      />

      <AddDepartmentModal 
        isOpen={showAddDepartmentModal}
        onClose={() => setShowAddDepartmentModal(false)}
        onDepartmentAdded={() => {
          loadDepartments();
          loadDashboardStats();
        }}
      />

      <AddClasseModal 
        isOpen={showAddClasseModal}
        onClose={() => setShowAddClasseModal(false)}
        onClasseAdded={() => {
          loadClasses();
          loadDashboardStats();
        }}
      />

      {/* Modaux de modification */}
      <EditStudentModal 
        isOpen={showEditStudentModal}
        onClose={() => {
          setShowEditStudentModal(false);
          setSelectedStudent(null);
        }}
        onStudentUpdated={() => {
          loadStudents();
          loadDashboardStats();
        }}
        student={selectedStudent}
      />

      <EditTeacherModal 
        isOpen={showEditTeacherModal}
        onClose={() => {
          setShowEditTeacherModal(false);
          setSelectedTeacher(null);
        }}
        onTeacherUpdated={() => {
          loadTeachers();
          loadDashboardStats();
        }}
        teacher={selectedTeacher}
      />

      <EditDepartmentModal 
        isOpen={showEditDepartmentModal}
        onClose={() => {
          setShowEditDepartmentModal(false);
          setSelectedDepartment(null);
        }}
        onDepartmentUpdated={() => {
          loadDepartments();
          loadDashboardStats();
        }}
        department={selectedDepartment}
      />

      <EditClasseModal 
        isOpen={showEditClasseModal}
        onClose={() => {
          setShowEditClasseModal(false);
          setSelectedClasse(null);
        }}
        onClasseUpdated={() => {
          loadClasses();
          loadDashboardStats();
        }}
        classe={selectedClasse}
      />
      {/* Salles */}
      <AddSalleModal
        isOpen={showAddSalleModal}
        onClose={handleCloseAddSalle}
        onSaved={handleSavedSalle}
        departments={departmentsData}
      />

      <EditSalleModal
        isOpen={showEditSalleModal}
        onClose={handleCloseEditSalle}
        onSaved={handleSavedSalle}
        initial={selectedSalle}
        departments={departmentsData}
      />

      {/* Matières */}
      <AddMatiereModal
        isOpen={showAddMatiereModal}
        onClose={handleCloseAddMatiere}
        onSaved={handleSavedMatiere}
        departments={departmentsData}
        specialites={[]}
        niveaux={[]}
        classes={classesData}
        teachers={teachersData}
      />

      <EditMatiereModal
        isOpen={showEditMatiereModal}
        onClose={handleCloseEditMatiere}
        onSaved={handleSavedMatiere}
        initial={selectedMatiere}
        departments={departmentsData}
        specialites={[]}
        niveaux={[]}
        classes={classesData}
        teachers={teachersData}
      />

      <AddEventModal
        isOpen={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onEventAdded={handleEventSaved}
      />

      <EditEventModal
        isOpen={showEditEventModal}
        onClose={() => setShowEditEventModal(false)}
        onEventUpdated={handleEventSaved}
        event={selectedEvent}
      />
    </div>
  );
};

export default AdminDashboard;