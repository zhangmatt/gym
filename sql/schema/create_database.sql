-- Drop existing tables to reset (be careful with this in production)
DROP TABLE IF EXISTS WorkoutExercises;
DROP TABLE IF EXISTS Workouts;
DROP TABLE IF EXISTS Exercises;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS workouts;


-- Create Users Table
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- Create Exercises Table
CREATE TABLE Exercises (
    exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Create Workouts Table
CREATE TABLE Workouts (
    workout_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_title VARCHAR(120) NOT NULL,
    date DATE NOT NULL,
    duration INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Create Workout Exercises Table
CREATE TABLE WorkoutExercises (
    workout_exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    weight DECIMAL NOT NULL,
    reps INTEGER NOT NULL,
    sets INTEGER NOT NULL,
    FOREIGN KEY (workout_id) REFERENCES Workouts(workout_id),
    FOREIGN KEY (exercise_id) REFERENCES Exercises(exercise_id)
);


-- Recreate the 'workout' table with a 'user_id' column
CREATE TABLE workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_title VARCHAR(120) NOT NULL,
    exercise_name TEXT NOT NULL,
    sets INTEGER,
    reps INTEGER,
    rest INTEGER,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
