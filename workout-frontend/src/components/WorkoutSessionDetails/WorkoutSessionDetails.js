import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend 
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function WorkoutSessionDetails() {
    const [workouts, setWorkouts] = useState({});
    const [chartData, setChartData] = useState({});
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const intervals = useRef({});

    useEffect(() => {
        if (sessionId) {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            axios.get(`/api/workouts/${sessionId}`, config)
                .then(response => {
                    const grouped = response.data.reduce((acc, workout) => {
                        acc[workout.session_title] = acc[workout.session_title] || [];
                        acc[workout.session_title].push(workout);
                        return acc;
                    }, {});
                    setWorkouts(grouped);

                    // Initialize chart data for each workout
                    const initialChartData = {};
                    Object.keys(grouped).forEach(sessionTitle => {
                        grouped[sessionTitle].forEach(workout => {
                            initialChartData[workout.id] = {
                                labels: [],
                                datasets: [
                                    {
                                        label: 'Weight',
                                        data: [],
                                        borderColor: 'rgba(139, 0, 0, 0.5)',
                                        backgroundColor: 'rgba(139, 0, 0, 0.5)',
                                        pointBackgroundColor: 'white',
                                        pointBorderColor: 'rgba(139, 0, 0, 0.5)',
                                        pointRadius: 5,
                                        fill: false
                                    },
                                    {
                                        label: 'Reps',
                                        data: [],
                                        borderColor: 'rgb(255, 140, 15)',
                                        backgroundColor: 'rgba(255, 140, 15, 0.5)',
                                        pointBackgroundColor: 'white',
                                        pointBorderColor: 'rgb(255, 140, 15)',
                                        pointRadius: 5,
                                        fill: false
                                    }
                                ]
                            };
                        });
                    });
                    setChartData(initialChartData);
                })
                .catch(error => {
                    console.error('Error fetching session workouts:', error);
                });
        }
    }, [sessionId]);

    const WorkoutChart = ({ data, workoutTitle }) => {
        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white'
                    }
                },
                title: {
                    display: true,
                    text: `Workout Progress for ${workoutTitle}`,
                    color: 'white'
                }
            },
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Set Number',
                        color: 'white'
                    },
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    type: 'linear',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value',
                        color: 'white'
                    },
                    ticks: {
                        color: 'white',
                        stepSize: 1 // Ensure the y-axis only displays integers
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        };

        return <Line options={options} data={data} />;
    };

    const startTimer = (duration, workoutId, setNumber) => {
        const timerId = `${workoutId}-${setNumber}`;
        let seconds = duration;
        const display = document.getElementById(`timer${timerId}`);

        if (!display) {
            console.error("Display element not found for timer:", timerId);
            return;
        }

        const interval = setInterval(() => {
            if (seconds <= 0) {
                clearInterval(interval);
                display.textContent = "Rest over!";
                const completeBtn = document.getElementById(`complete-btn${timerId}`);
                if (completeBtn) {
                    completeBtn.disabled = false;
                }
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

    const updateChartData = (workoutId, weight, reps, setNumber) => {
        setChartData(prevChartData => {
            const updatedChartData = { ...prevChartData };
            if (updatedChartData[workoutId]) {
                let labels = [...updatedChartData[workoutId].labels];
                labels.push(`Set ${setNumber}`);
                let datasets = updatedChartData[workoutId].datasets.map((dataset, index) => {
                    let newData = [...dataset.data];
                    if (index === 0) {
                        newData.push(parseInt(weight));
                    } else {
                        newData.push(parseInt(reps));
                    }
                    return { ...dataset, data: newData };
                });
                updatedChartData[workoutId] = { labels, datasets };
            }
            return updatedChartData;
        });
    };

    const completeSet = (workoutId, setNumber) => {
        const weightId = `weight${workoutId}-${setNumber}`;
        const repsId = `reps${workoutId}-${setNumber}`;
        const weight = document.getElementById(weightId)?.value;
        const reps = document.getElementById(repsId)?.value;
        const restId = `rest${workoutId}-${setNumber}`;
        const restPeriod = document.getElementById(restId)?.value;

        if (restPeriod && weight && reps) {
            alert(`Completed set ${setNumber + 1} with ${weight} lbs and ${reps} reps`);
            startTimer(parseInt(restPeriod), workoutId, setNumber);
            document.getElementById(`complete-btn${workoutId}-${setNumber}`).disabled = true;
            updateChartData(workoutId, weight, reps, setNumber + 1);
        } else {
            console.error("Error: Missing elements or values. Check if all inputs are filled.");
        }
    };

    return (
        <div>
            <h1><u>SESSION TITLE: {sessionId}</u></h1>
            <main style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                <section style={{ flex: 1, margin: '10px' }} className="workouts">
                    {Object.keys(workouts).map((sessionTitle, index) => (
                        <div className="workout" key={index}>
                            {workouts[sessionTitle].map((workout, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'row' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3>{workout.exercise}: Sets: {workout.sets} | Reps: {workout.reps} | Rest: {workout.rest}s</h3>
                                        <div className="sets-container">
                                            {[...Array(workout.sets)].map((_, setIdx) => (
                                                <div className="set" key={setIdx}>
                                                    <input type="number" id={`weight${workout.id}-${setIdx}`} className="weight-input" placeholder={`Enter weight for set ${setIdx + 1}`} />
                                                    <input type="number" id={`reps${workout.id}-${setIdx}`} className="reps-input" placeholder={`Enter reps for set ${setIdx + 1}`} />
                                                    <input type="number" id={`rest${workout.id}-${setIdx}`} className="rest-input" defaultValue={workout.rest} hidden />
                                                    <button id={`complete-btn${workout.id}-${setIdx}`} className="complete-btn" onClick={() => completeSet(workout.id, setIdx)}>
                                                        Complete Set
                                                    </button>
                                                    <div id={`timer${workout.id}-${setIdx}`} className="timer">Rest Timer: 00:00</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <WorkoutChart data={chartData[workout.id] || { labels: [], datasets: [] }} workoutTitle={workout.exercise} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </section>
            </main>
            <footer>
                <button className="complete-btn" onClick={() => navigate('/home')}>Return to Home</button>
            </footer>
        </div>
    );
}

export default WorkoutSessionDetails;
