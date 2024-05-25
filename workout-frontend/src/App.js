import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header.js';
import Footer from './components/Footer/Footer.js';
import WorkoutForm from './components/WorkoutForm/WorkoutForm.js';
import WorkoutSessions from './components/WorkoutSessions/WorkoutSessions.js';
import WorkoutSessionDetails from './components/WorkoutSessionDetails/WorkoutSessionDetails.js';
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
  const handleAddSuccess = () => {
    console.log("Workout added successfully!");
    // You can add logic here to fetch updated workouts list or navigate, etc.
  };
  
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={
                <>
                  <WorkoutForm onAddSuccess={handleAddSuccess} />
                  <WorkoutSessions />
                </>
              } />
              <Route path="/session/:sessionTitle" element={<WorkoutSessionDetails />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
