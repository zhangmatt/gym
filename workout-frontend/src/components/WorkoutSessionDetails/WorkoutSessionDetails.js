import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function WorkoutSessionDetails() {
    const [workouts, setWorkouts] = useState([]);
    const { sessionId } = useParams(); // Assuming the session id is passed as a URL parameter
    const navigate = useNavigate();
    const intervals = {};

    useEffect(() => {
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
    }, [sessionId]);

    const startTimer = (duration, workoutId, setNumber) => {
        const timerId = `${workoutId}-${setNumber}`;
        const interval = setInterval(() => {
            let seconds = duration;
            const display = document.getElementById(`timer${timerId}`);

            display.textContent = formatTime(seconds);

            if (--seconds < 0) {
                clearInterval(interval);
                display.textContent = "Rest over!";
                document.getElementById(`complete-btn${timerId}`).disabled = false;
            }
        }, 1000);

        intervals[timerId] = interval;
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
            <header>
                <h1>Workout Session: {sessionId}</h1>
            </header>
            <main>
                <section className="workouts">
                    {workouts.map((workout, index) => (
                        <div className="workout" key={index}>
                            <h2>{workout.exercise}: Sets: {workout.sets} | Reps: {workout.reps} | Rest: {workout.rest}s</h2>
                            <div className="sets-container">
                                {[...Array(workout.sets)].map((_, setIdx) => (
                                    <div className="set" key={setIdx}>
                                        <input type="number" id={`weight${index}-${setIdx}`} className="weight-input" placeholder={`Enter weight for set ${setIdx + 1}`} />
                                        <input type="number" id={`reps${index}-${setIdx}`} className="weight-input" placeholder={`Enter reps for set ${setIdx + 1}`} />
                                        <input type="number" id={`rest${index}-${setIdx}`} className="rest-input" defaultValue={workout.rest} hidden />
                                        <button 
                                            id={`complete-btn${index}-${setIdx}`} 
                                            className="complete-btn" 
                                            onClick={() => completeSet(index, setIdx)}>
                                            Complete Set
                                        </button>
                                        <div id={`timer${index}-${setIdx}`} className="timer">Rest Timer: 00:00</div>
                                    </div>
                                ))}
                            </div>
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
