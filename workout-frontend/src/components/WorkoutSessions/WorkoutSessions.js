import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function WorkoutSessions() {
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/workouts')
            .then(response => {
                console.log('Data received:', response.data); // Check the structure here
                setSessions(response.data);
            })
            .catch(error => {
                console.error('Error fetching workouts:', error);
            });
    }, []);
    
    

    const handleStartWorkout = (sessionTitle) => {
        navigate(`/session/${encodeURIComponent(sessionTitle)}`);
    };

    const handleDeleteSession = (sessionId) => {
        console.log(`Attempting to delete session: ${sessionId}`);
        axios.delete(`/api/workouts/${encodeURIComponent(sessionId)}`)
            .then(() => {
                alert('Session deleted successfully');
                // Update local state to remove the deleted session
                setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
            })
            .catch(error => {
                console.error('Error deleting session:', error);
                alert('Failed to delete session');
            });
    };    

    const handleDeleteWorkout = (workoutId) => {
        axios.delete(`/api/workouts/${workoutId}`)
            .then(() => {
                alert('Workout deleted successfully');
                setSessions(currentSessions => currentSessions.filter(workout => workout.id !== workoutId));
            })
            .catch(error => {
                console.error('Error deleting workout:', error);
                alert('Failed to delete workout');
            });
    };
    
    return (
        <section className="sessions">
            <h2><u>WORKOUT SESSIONS</u></h2>
            {sessions.map((workout, index) => (
                <article key={index}>
                    <h3>{workout.session_title}
                        <button className="start-session-btn" onClick={() => handleStartWorkout(workout.session_title)}>
                            Start This Workout
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteSession(workout.id)}>
                            Delete Session
                        </button>
                    </h3>
                    <ul>
                        <div className="workout_home">
                            <p>{workout.exercise}: Sets: {workout.sets} | Reps: {workout.reps} | Rest: {workout.rest}s</p>
                            <button className="delete-btn" onClick={() => handleDeleteWorkout(workout.id)}>X</button>
                        </div>
                    </ul>
                </article>
            ))}
        </section>
    );
    
}

export default WorkoutSessions;