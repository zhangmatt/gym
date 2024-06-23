import React, { useState } from 'react';
import axios from 'axios';


function WorkoutForm({ onAddSuccess }) {  // Added a prop to handle successful addition
    const API_URL = 'https://workout-backend-tma6.onrender.com';
    const [sessionTitle, setSessionTitle] = useState('');
    const [exercise, setExercise] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [rest, setRest] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        const workoutData = {
            session_title: sessionTitle,
            exercise,
            sets,
            reps,
            rest
        };

        // Fetch token from local storage
        const token = localStorage.getItem('token');

        // Set headers for authorization if the token exists
        const config = token ? {
            headers: { Authorization: `Bearer ${token}` }
        } : {};

        console.log('Submitting workout data:', workoutData);

        axios.post(`${API_URL}/api/workouts`, workoutData, config)
        .then(response => {
            console.log('Received workout data from server:', response.data);
            onAddSuccess(response.data);
            setSessionTitle('');
            setExercise('');
            setSets('');
            setReps('');
            setRest('');
            window.location.reload();
            // Optionally, use state update instead of reloading the page
        })
        .catch(error => {
            console.error('Error adding workout:', error);
            alert('Failed to add workout');
        });
    };
    
    

    return (
        <div className="form-section">
            <h3>ADD WORKOUTS: </h3>
            <form onSubmit={handleSubmit} className="workout-form">
                <div className="form-group">
                    <label>Session Title:</label>
                    <input type="text" value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Exercise:</label>
                    <input type="text" value={exercise} onChange={e => setExercise(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Sets:</label>
                    <input type="number" value={sets} onChange={e => setSets(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Reps:</label>
                    <input type="number" value={reps} onChange={e => setReps(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Rest Time (s):</label>
                    <input type="number" value={rest} onChange={e => setRest(e.target.value)} required />
                </div>
                <button type="submit" className="btn">Add Workout</button>
            </form>
        </div>
    );
}

export default WorkoutForm;
