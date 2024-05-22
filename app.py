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
        # Check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('home'))  # Redirect or handle as necessary
    return render_template('upload.html')

# Define a route for the homepage, which can handle both GET and POST requests
@app.route('/', methods=['GET', 'POST'])
def home():
    # Check if the current request is a POST request
    if request.method == 'POST':
        # Create a dictionary to hold the workout data received from the form
        # Extract data from form fields sent with the request
        session_title=request.form['session_title'].strip()
        workout = {
            'exercise': request.form['exercise'],  # Get the 'exercise' name from form data
            'sets': int(request.form['sets']),     # Convert number of sets from string to integer
            'reps': int(request.form['reps']),      # Convert number of reps from string to integer
            'rest': int(request.form['rest'])
        }
        if session_title not in workout_sessions:
            workout_sessions[session_title] = []
        # Append the new workout dictionary to the workouts list
        workout_sessions[session_title].append(workout)

    # Render the 'home.html' template, passing the workouts list to it
    # This list is used in the template to display all logged workouts
    return render_template('home.html', files=os.listdir(app.config['UPLOAD_FOLDER']))

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
