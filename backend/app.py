from flask import Flask, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, current_user, login_user, logout_user, login_required
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['UPLOAD_FOLDER'] = 'static/uploads/'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Change this to a random string

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

db = SQLAlchemy(app)
CORS(app)  # Enable CORS
jwt = JWTManager(app)

login_manager = LoginManager()
login_manager.init_app(app)

# Define the User model
from flask_login import UserMixin

class User(db.Model, UserMixin):  # Make sure UserMixin is included here
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_active(self):
        return True

# Define the Workout model
class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Link to User model
    session_title = db.Column(db.String(120), nullable=False)
    exercise = db.Column(db.String(120), nullable=False)
    sets = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    rest = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_title': self.session_title,
            'exercise': self.exercise,
            'sets': self.sets,
            'reps': self.reps,
            'rest': self.rest
        }

    def __repr__(self):
        return f'<Workout {self.exercise}>'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def root():
    return jsonify({"message": "Welcome to the Workout API!"}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    if user:
        return jsonify({'message': 'Username already exists'}), 400
    
    new_user = User(username=data['username'], email=data['email'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=new_user.id)
    return jsonify({'message': 'User registered successfully', 'token': access_token}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({'message': 'Logged in successfully', 'token': access_token}), 200
    
    return jsonify({'message': 'Invalid username or password'}), 401

@app.cli.command('db_migrate')
def db_migrate():
    with app.app_context():
        db.drop_all()
        db.create_all()
    print("Database migrated.")


@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200


@app.route('/api/check-session', methods=['GET'])
@jwt_required(optional=True)
def check_session():
    if get_jwt_identity():
        user = User.query.get(get_jwt_identity())
        return jsonify({
            'isAuthenticated': True,
            'token': create_access_token(identity=user.id),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    return jsonify({'isAuthenticated': False}), 200

@app.route('/api/workouts', methods=['GET', 'POST'])
@jwt_required()
def manage_workouts():
    current_user_id = get_jwt_identity()
    if request.method == 'POST':
        data = request.get_json()
        new_workout = Workout(
            user_id=current_user_id,  # Assign current user's ID to the workout
            session_title=data['session_title'],
            exercise=data['exercise'],
            sets=data['sets'],
            reps=data['reps'],
            rest=data['rest']
        )
        db.session.add(new_workout)
        db.session.commit()
        return jsonify(new_workout.to_dict()), 201

    workouts = Workout.query.filter_by(user_id=current_user_id).all()
    return jsonify([workout.to_dict() for workout in workouts]), 200

@app.route('/api/workouts/session/<string:session_title>', methods=['DELETE'])
@jwt_required()
def delete_session(session_title):
    current_user_id = get_jwt_identity()
    workouts = Workout.query.filter_by(session_title=session_title, user_id=current_user_id).all()
    if not workouts:
        return jsonify({'error': 'Session not found'}), 404

    for workout in workouts:
        db.session.delete(workout)
    db.session.commit()
    return jsonify({'message': 'Session deleted successfully'}), 200

@app.route('/api/workouts/<int:workout_id>', methods=['DELETE'])
@jwt_required()
def delete_workout(workout_id):
    current_user_id = get_jwt_identity()
    workout = Workout.query.filter_by(id=workout_id, user_id=current_user_id).first()
    if workout is None:
        return jsonify({'error': 'Workout not found'}), 404

    db.session.delete(workout)
    db.session.commit()
    return jsonify({'message': 'Workout deleted successfully'}), 200

@app.route('/api/workouts/<string:sessionTitle>', methods=['GET'])
@jwt_required()
def get_session_workouts(sessionTitle):
    current_user_id = get_jwt_identity()
    workouts = Workout.query.filter_by(session_title=sessionTitle, user_id=current_user_id).all()
    if not workouts:
        return jsonify({'error': 'Session not found'}), 404
    return jsonify([workout.to_dict() for workout in workouts])

@app.cli.command('db_create')
def db_create():
    db.create_all()
    print("Database created.")

# File Upload Endpoint
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        return jsonify({'message': 'File successfully uploaded', 'url': url_for('static', filename=os.path.join('uploads', filename), _external=True)}), 201

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi'}

if __name__ == '__main__':
    app.run(debug=True)
