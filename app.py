# Import necessary modules from the Flask framework and its extensions
import os
from flask import Flask, request, render_template, jsonify, redirect, url_for, flash
from werkzeug.utils import secure_filename

# Create a Flask application instance
# '__name__' is a special variable that gets as value the name of the Python script
app = Flask(__name__)

# Configure the maximum upload size (e.g., 16MB) and upload folder
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = 'uploads/'

# Ensure the upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])
    print(f"Created directory {app.config['UPLOAD_FOLDER']}")

# Allowed extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi'}

# Initialize an empty list to store workout data
workout_sessions = {}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            try:
                file.save(file_path)
            except IOError as e:
                # Log the error and inform the user
                print(f"Error saving file: {e}")
                flash('Error saving file.')
                return redirect(request.url)
            return redirect(url_for('home'))
    return render_template('upload.html')

# Define a route for the homepage, which can handle both GET and POST requests
@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        session_title = request.form['session_title'].strip()
        workout = {
            'exercise': request.form['exercise'],
            'sets': int(request.form['sets']),
            'reps': int(request.form['reps']),
            'rest': int(request.form['rest'])
        }
        if session_title not in workout_sessions:
            workout_sessions[session_title] = []
        workout_sessions[session_title].append(workout)

    # Ensure that 'workout_sessions' is passed to the template
    files = os.listdir(app.config['UPLOAD_FOLDER']) if os.path.exists(app.config['UPLOAD_FOLDER']) else []
    return render_template('home.html', files=files, workout_sessions=workout_sessions)


@app.route('/start-workout/<session_title>', methods=['GET'])

def start_workout(session_title):
    session_workouts=workout_sessions.get(session_title,[])
    return jsonify(session_workouts)

@app.route('/workout-session/<session_title>')
def workout_session(session_title):
    workouts = workout_sessions.get(session_title, [])
    return render_template('workout_session.html', session_title=session_title, workouts=workouts)

@app.route('/delete-session/<session_title>')
def delete_session(session_title):
    if session_title in workout_sessions:
        del workout_sessions[session_title]  # Delete the entire session
    return redirect(url_for('home'))  # Redirect back to the home page after deletion

@app.route('/delete-workout/<session_title>/<int:workout_index>')
def delete_workout(session_title, workout_index):
    if session_title in workout_sessions and workout_index < len(workout_sessions[session_title]):
        workout_sessions[session_title].pop(workout_index)  # Remove the workout by index
    return redirect(url_for('home'))  # Redirect back to the home page after deletion


# Check if the script is executed as the main program
# and not being imported from another script
if __name__ == '__main__':
    # Run the application server
    # 'debug=True' enables auto-reloading on code changes and provides a debug interface
    app.run(debug=True)
