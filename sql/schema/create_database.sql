CREATE DATABASE WorkoutTracker;

-- Users Table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- Exercises Table
CREATE TABLE Exercises (
    exercise_id SERIAL PRIMARY KEY,
    exercise_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Workouts Table
CREATE TABLE Workouts (
    workout_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    duration INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Workout Exercises Table
CREATE TABLE WorkoutExercises (
    workout_exercise_id SERIAL PRIMARY KEY,
    workout_id INT NOT NULL,
    exercise_id INT NOT NULL,
    weight DECIMAL NOT NULL,
    reps INT NOT NULL,
    sets INT NOT NULL,
    FOREIGN KEY (workout_id) REFERENCES Workouts(workout_id),
    FOREIGN KEY (exercise_id) REFERENCES Exercises(exercise_id)
);
