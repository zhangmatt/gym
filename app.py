# Import necessary modules from the Flask framework and its extensions
import os
from flask import Flask, request, render_template, jsonify, redirect, url_for, flash
from werkzeug.utils import secure_filename
from flask_wtf.csrf import CSRFProtect

# Create a Flask application instance
# '__name__' is a special variable that gets as value the name of the Python script
app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = 'poopy123megan'  # Make sure to set a secure secret key

# Configure the maximum upload size (e.g., 16MB) and upload folder
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = 'static/uploads/'

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
            file.save(file_path)
            # Render a template showing the uploaded image
            image_url = url_for('static', filename=os.path.join('uploads', filename))
            return render_template('display_image.html', image_url=image_url)
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
        
        print("Added workout:", workout)  # Print workout to verify data

    return render_template('home.html', workout_sessions=workout_sessions)


@app.route('/start-workout/<session_title>', methods=['GET'])
def start_workout(session_title):
    # Assuming you have all necessary data loaded or calculated
    # Redirect to the workout session page with the session data
    return redirect(url_for('workout_session', session_title=session_title))


@app.route('/workout-session/<session_title>', methods=['GET', 'POST'])
@app.route('/workout-session/<session_title>', methods=['GET', 'POST'])
def workout_session(session_title):
    workouts = workout_sessions.get(session_title, [])
    # Check for additional POST handling if needed
    if request.method == 'POST' and 'file' in request.files:
        file = request.files['file']
        if file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            image_url = url_for('static', filename='uploads/' + filename)
            flash('File successfully uploaded')

    return render_template('workout_session.html', session_title=session_title, workouts=workouts)


@app.route('/delete-session/<session_title>', methods=['POST'])
def delete_session(session_title):
    if session_title in workout_sessions:
        del workout_sessions[session_title]  # Delete the entire session
        flash('Session deleted successfully')
    else:
        flash('Session not found', 'error')
    return redirect(url_for('home'))  # Redirect back to the home page after deletion


@app.route('/delete-workout/<session_title>/<int:workout_index>')
@app.route('/delete-exercise/<session_title>/<int:exercise_index>', methods=['POST'])
def delete_exercise(session_title, exercise_index):
    if session_title in workout_sessions and 0 <= exercise_index < len(workout_sessions[session_title]):
        del workout_sessions[session_title][exercise_index]
        # Optionally, flash a message to confirm deletion
        flash('Exercise deleted successfully', 'success')
    else:
        flash('Exercise could not be found', 'error')
    return redirect(url_for('workout_session', session_title=session_title))



# Check if the script is executed as the main program
# and not being imported from another script
if __name__ == '__main__':
    # Run the application server
    # 'debug=True' enables auto-reloading on code changes and provides a debug interface
    app.run(debug=True)
