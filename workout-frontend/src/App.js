import React from 'react';
import { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header.js';
import Footer from './components/Footer/Footer.js';
import WorkoutForm from './components/WorkoutForm/WorkoutForm.js';
import WorkoutSessions from './components/WorkoutSessions/WorkoutSessions.js';
import WorkoutSessionDetails from './components/WorkoutSessionDetails/WorkoutSessionDetails.js';
import StartPage from './components/StartPage/StartPage.js';
import { Navigate } from 'react-router-dom';

import axios from 'axios';
import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Caught an error in error boundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionGroups, setSessionGroups] = useState({});
  const [isGuest, setIsGuest] = useState(false);  // Add a state to handle guest access

  const logout = () => {
    setIsAuthenticated(false); // Clear the authenticated state
    // Additionally, clear any stored tokens or session data here if applicable
  };

  const handleLoginSuccess = (status) => {
    setIsAuthenticated(status);
  };

const handleGuestLogin = (status) => {
    setIsGuest(status);
  };
  const fetchWorkouts = useCallback(() => {
    axios.get('/api/workouts')
      .then(response => {
        const grouped = groupWorkoutsBySession(response.data);
        setSessionGroups(grouped);
      })
      .catch(error => {
        console.error('Error fetching workouts:', error);
      });
  }, []); // No dependencies since it doesn't depend on external state or props

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]); // Now fetchWorkouts is stable and included in the dependency array

  useEffect(() => {
    // Optionally check if the user is already logged in when the app loads
    axios.get('/api/check-session')
      .then(response => {
        setIsAuthenticated(response.data.isAuthenticated);
      })
      .catch(error => {
        console.error('Session check failed:', error);
        setIsAuthenticated(false);
      });
  }, []);

  const groupWorkoutsBySession = (workouts) => {
    return workouts.reduce((acc, workout) => {
      acc[workout.session_title] = acc[workout.session_title] || [];
      acc[workout.session_title].push(workout);
      return acc;
    }, {});
  };

  const handleAddSuccess = (newWorkout) => {
    console.log('New workout data:', newWorkout);

    if (!newWorkout.session_title) {
      console.error('Session title is missing in the new workout data');
      return; // Early return if session_title is missing
    }

    setSessionGroups(prevGroups => {
      const updatedGroups = {...prevGroups};
      if (!updatedGroups[newWorkout.session_title]) {
        updatedGroups[newWorkout.session_title] = [];
      }
      updatedGroups[newWorkout.session_title].push(newWorkout);
      console.log('Updated session groups:', updatedGroups);
      return updatedGroups;
    });

    
};

return (
  <Router>
    <div className="App">
      <Header />
      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={
              (isAuthenticated || isGuest) ? <Navigate replace to="/home" /> : <StartPage onLogin={handleLoginSuccess} onGuest={handleGuestLogin} />
            } />
            <Route path="/home" element={
              <>
                <div className="main">
                  <WorkoutForm onAddSuccess={handleAddSuccess} />
                  <WorkoutSessions sessionGroups={sessionGroups} />
                </div>
                
              </>
            } />
            <Route path="/session/:sessionId" element={<WorkoutSessionDetails />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer onLogout={logout} />
    </div>
  </Router>
);
}

export default App;
