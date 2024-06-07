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
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const intervals = useRef({});
    const [chartData, setChartData] = useState({
        labels: [], // Initializes the labels array
        datasets: [ 
            {
              label: 'Weight',
              data: [], // This will be populated dynamically
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              pointBackgroundColor: 'white', // Make points clearly visible
              pointBorderColor: 'rgb(75, 192, 192)',
              pointRadius: 5, // Increase radius for visibility
              fill: false
            },
            {
              label: 'Reps',
              data: [], // This will be populated dynamically
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              pointBackgroundColor: 'white',
              pointBorderColor: 'rgb(255, 99, 132)',
              pointRadius: 5,
              fill: false
            }
          ]
      });

    
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


    const WorkoutChart = ({ chartData }) => {
        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white' // Changes the legend text to white
                    }
                },
                title: {
                    display: true,
                    text: 'Workout Progress',
                    color: 'white' // Changes the title text to white
                }
            },
            scales: {
                x: {
                    type: 'category',
                    labels: chartData.labels,  // Ensure labels are dynamically updated
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
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }            
        };
    
        return <Line options={options} data={chartData} />;
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

    const containerStyle = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start'
      };
      
      const sectionStyle = {
        flex: 1,
        margin: '10px'
      };
      
      const chartContainerStyle = {
        flex: 1,
        margin: '10px'
      };

    const updateChartData = (weight, reps, setNumber) => {
        setChartData(prevChartData => {
          let labels = [...prevChartData.labels];
          labels.push(`Set ${setNumber}`); // Ensure new set labels are added
      
          let datasets = prevChartData.datasets.map((dataset, index) => {
            let newData = [...dataset.data];
            if (index === 0) {
              newData.push(parseInt(weight));
            } else {
              newData.push(parseInt(reps));
            }
            return {...dataset, data: newData};
          });
          console.log(`Adding weight: ${weight}, reps: ${reps} for set ${setNumber}`);
          return { labels, datasets };
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
          updateChartData(weight, reps, setNumber + 1); // Increment setNumber for display purposes
        } else {
          console.error("Error: Missing elements or values. Check if all inputs are filled.");
        }
      };

      return (
        <div>
          <h1>Workout Session: {sessionId}</h1>
          <main style={containerStyle}>
            <section style={sectionStyle} className="workouts">
              {Object.keys(workouts).map((sessionTitle, index) => (
                <div className="workout" key={index}>
                  {workouts[sessionTitle].map((workout, idx) => (
                    <div key={idx}>
                      <h3>{workout.exercise}: Sets: {workout.sets} | Reps: {workout.reps} | Rest: {workout.rest}s</h3>
                      <div className="sets-container">
                        {[...Array(workout.sets)].map((_, setIdx) => (
                          <div className="set" key={setIdx}>
                            <input type="number" id={`weight${idx}-${setIdx}`} className="weight-input" placeholder={`Enter weight for set ${setIdx + 1}`} />
                            <input type="number" id={`reps${idx}-${setIdx}`} className="reps-input" placeholder={`Enter reps for set ${setIdx + 1}`} />
                            <input type="number" id={`rest${idx}-${setIdx}`} className="rest-input" defaultValue={workout.rest} hidden />
                            <button id={`complete-btn${idx}-${setIdx}`} className="complete-btn" onClick={() => completeSet(idx, setIdx)}>
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
            <section style={chartContainerStyle} className="charts">
              <WorkoutChart chartData={chartData} />
            </section>
          </main>
          <footer>
            <button onClick={() => navigate('/home')}>Return to Home</button>
          </footer>
        </div>
      );
      
}

export default WorkoutSessionDetails;
