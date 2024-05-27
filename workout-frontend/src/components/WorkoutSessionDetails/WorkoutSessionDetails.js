import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function WorkoutSessionDetails() {
    const [workouts, setWorkouts] = useState({});
    const { sessionId } = useParams(); // Ensure this matches the route parameter name
    const navigate = useNavigate();
    const intervals = useRef({});

    console.log('sessionId:', sessionId); // Debug log

    useEffect(() => {
        if (sessionId) {
            axios.get(`/api/workouts/${sessionId}`)
                .then(response => {
                    const grouped = response.data.reduce((acc, workout) => {
                        acc[workout.session_title] = acc[workout.session_title] || [];
                        acc[workout.session_title].push(workout);
                        return acc;
                    }, {});
                    setWorkouts(grouped);
                })
                .catch(error => {
                    console.error('Error fetching session workouts:', error);
                });
        }
    }, [sessionId]);

    const startTimer = (duration, workoutId, setNumber) => {
        const timerId = `${workoutId}-${setNumber}`;
        let seconds = duration;
        const display = document.getElementById(`timer${timerId}`);

        const interval = setInterval(() => {
            if (seconds <= 0) {
                clearInterval(interval);
                display.textContent = "Rest over!";
                document.getElementById(`complete-btn${timerId}`).disabled = false;
            } else {
                display.textContent = formatTime(seconds);
                seconds--;
            }
        }, 1000);

        intervals.current[timerId] = interval;
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const completeSet = (workoutId, setNumber) => {
        const weightId = `weight${workoutId}-${setNumber}`;
        const weight = document.getElementById(weightId).value;
        const restId = `rest${workoutId}-${setNumber}`;
        const restPeriod = document.getElementById(restId).value;

        if (restPeriod && weight) {
            alert(`Completed set with ${weight}lbs`);
            startTimer(parseInt(restPeriod), workoutId, setNumber);
            document.getElementById(`complete-btn${workoutId}-${setNumber}`).disabled = true;
        } else {
            console.error("Error: Missing elements or values.");
        }
    };

    return (
        <div>
            <h1>
                <h1>Workout Session: {sessionId}</h1>
            </h1>
            <main>
                <section className="workouts">
                    {Object.keys(workouts).map((sessionTitle, index) => (
                        <div className="workout" key={index}>
                            <h2>{sessionTitle}</h2>
                            {workouts[sessionTitle].map((workout, idx) => (
                                <div key={idx}>
                                    <p>{workout.exercise}: Sets: {workout.sets} | Reps: {workout.reps} | Rest: {workout.rest}s</p>
                                    <div className="sets-container">
                                        {[...Array(workout.sets)].map((_, setIdx) => (
                                            <div className="set" key={setIdx}>
                                                <input type="number" id={`weight${idx}-${setIdx}`} className="weight-input" placeholder={`Enter weight for set ${setIdx + 1}`} />
                                                <input type="number" id={`reps${idx}-${setIdx}`} className="weight-input" placeholder={`Enter reps for set ${setIdx + 1}`} />
                                                <input type="number" id={`rest${idx}-${setIdx}`} className="rest-input" defaultValue={workout.rest} hidden />
                                                <button 
                                                    id={`complete-btn${idx}-${setIdx}`} 
                                                    className="complete-btn" 
                                                    onClick={() => completeSet(idx, setIdx)}>
                                                    Complete Set
                                                </button>
                                                <div id={`timer${idx}-${setIdx}`} className="timer">Rest Timer: 00:00</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </section>
            </main>
            <footer>
                <button onClick={() => navigate('/')}>Return to Home</button>
            </footer>
        </div>
    );
}

export default WorkoutSessionDetails;
