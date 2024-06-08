import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Header from './components/Header/Header.js';
import Footer from './components/Footer/Footer.js';
import WorkoutForm from './components/WorkoutForm/WorkoutForm.js';
import WorkoutSessions from './components/WorkoutSessions/WorkoutSessions.js';
import WorkoutSessionDetails from './components/WorkoutSessionDetails/WorkoutSessionDetails.js';
import StartPage from './components/StartPage/StartPage.js';
import axios from 'axios';
import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught an error in error boundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children; 
  }
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionGroups, setSessionGroups] = useState({});
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate(); // useNavigate should be used within Router context

  const logout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      navigate('/');
      return;
    }
    
    const config = { headers: { Authorization: `Bearer ${token}` } };
  
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    axios.post('/api/logout', {}, config)
      .then(response => {
        console.log(response.data.message);
        navigate('/');
      })
      .catch(error => {
        console.error('Error logging out:', error);
        navigate('/');
      });
  };
  

  const handleLoginSuccess = (status) => {
    setIsAuthenticated(status);
  };

  const handleGuestLogin = (status) => {
    setIsGuest(status);
  };

  const groupWorkoutsBySession = (workouts) => {
    return workouts.reduce((acc, workout) => {
      acc[workout.session_title] = acc[workout.session_title] || [];
      acc[workout.session_title].push(workout);
      return acc;
    }, {});
  };

  const handleAddSuccess = (newWorkout) => {
    if (!newWorkout.session_title) {
      console.error('Session title is missing in the new workout data');
      return;
    }
    setSessionGroups(prevGroups => {
      const updatedGroups = { ...prevGroups };
      if (!updatedGroups[newWorkout.session_title]) {
        updatedGroups[newWorkout.session_title] = [];
      }
      updatedGroups[newWorkout.session_title].push(newWorkout);
      return updatedGroups;
    });
  };

  // Fetch workouts using token for authentication
  const fetchWorkouts = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios.get('/api/workouts', config)
      .then(response => {
        const grouped = groupWorkoutsBySession(response.data);
        setSessionGroups(grouped);
      })
      .catch(error => {
        console.error('Error fetching workouts:', error);
      });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkouts();
    }
  }, [isAuthenticated, fetchWorkouts]);

  useEffect(() => {
    axios.get('/api/check-session')
      .then(response => {
        setIsAuthenticated(response.data.isAuthenticated);
        if (response.data.isAuthenticated) {
          localStorage.setItem('token', response.data.token);
        }
      })
      .catch(error => {
        console.error('Session check failed:', error);
        setIsAuthenticated(false);
      });
  }, []);

  return (
    <AuthProvider>
      <div className="App">
        <Header isAuthenticated={isAuthenticated} onLogout={logout} />
        <main className="main-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={
                isAuthenticated || isGuest ? <Navigate replace to="/home" /> : <StartPage onLogin={handleLoginSuccess} onGuest={handleGuestLogin} />
              } />
              <Route path="/home" element={
                <div className="main">
                  <WorkoutForm onAddSuccess={handleAddSuccess} />
                  <WorkoutSessions sessionGroups={sessionGroups} />
                </div>
              } />
              <Route path="/session/:sessionId" element={<WorkoutSessionDetails />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default AppWrapper;
