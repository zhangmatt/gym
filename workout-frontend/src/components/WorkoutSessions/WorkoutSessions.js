import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function WorkoutSessions() {
    const [sessionGroups, setSessionGroups] = useState({});
    const navigate = useNavigate();
    
    const fetchWorkouts = useCallback(() => {
        const token = localStorage.getItem('token'); // Assuming you store the token in local storage
        axios.get('/api/workouts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          const grouped = groupWorkoutsBySession(response.data);
          setSessionGroups(grouped);
        })
        .catch(error => {
          console.error('Error fetching workouts:', error);
        });
      }, []); // No dependencies, this function doesn't depend on any external values

    useEffect(() => {
        fetchWorkouts();
    }, [fetchWorkouts]); // Now fetchWorkouts is stable across renders
    
    useEffect(() => {
        console.log('Session Groups updated:', sessionGroups);
    }, [sessionGroups]);

    const groupWorkoutsBySession = (workouts) => {
        const newGroups = {};
        workouts.forEach((workout) => {
            if (!newGroups[workout.session_title]) {
                newGroups[workout.session_title] = [];
            }
            newGroups[workout.session_title].push(workout);
        });
        return newGroups;
    };
    

    const handleStartWorkout = (sessionTitle) => {
        navigate(`/session/${encodeURIComponent(sessionTitle)}`);
    };

    const handleDeleteSession = (sessionTitle) => {
        const encodedTitle = encodeURIComponent(sessionTitle);
        console.log('Deleting session:', encodedTitle);
        
        axios.delete(`/api/workouts/session/${encodedTitle}`)
            .then(() => {
                alert('Session deleted successfully');
                fetchWorkouts();  // Refetch to update the list after deletion
            })
            .catch(error => {
                console.error('Error deleting session:', error);
                alert(`Failed to delete session: ${error.response ? error.response.data.error : 'Server error'}`);
            });
    };
    
    const handleDeleteWorkout = (workoutId) => {
        axios.delete(`/api/workouts/${workoutId}`)
            .then(() => {
                alert('Workout deleted successfully');
                fetchWorkouts();  // Refetch to update the list after deletion
            })
            .catch(error => {
                console.error('Error deleting workout:', error);
                alert('Failed to delete workout');
            });
    };

    return (
        <section className="sessions">
            <h2><u>WORKOUT SESSIONS</u></h2>
            {Object.keys(sessionGroups).map((sessionTitle, index) => (
                <div key={sessionTitle}>
                <article key={index}>
                    <h3>{sessionTitle}
                        <button className="start-session-btn" onClick={() => handleStartWorkout(sessionTitle)}>
                            Start This Workout
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteSession(sessionTitle)}>
                            Delete Session
                        </button>
                    </h3>
                    <ul>
                        {sessionGroups[sessionTitle].map((workout) => (
                            <div className="workout_home" key={workout.id}>
                                <p>{workout.exercise}: Sets: {workout.sets} | Reps: {workout.reps} | Rest: {workout.rest}s</p>
                                <button className="delete-btn" onClick={() => handleDeleteWorkout(workout.id)}>X</button>
                            </div>
                        ))}
                    </ul>
                </article>
                </div>
            ))}
        </section>
    );
}

export default WorkoutSessions;
