from flask import Flask, request, jsonify
import os
from flask_cors import CORS
import hashlib
from pymongo import MongoClient
from flask_pymongo import PyMongo, ObjectId
from dotenv import load_dotenv

#-- call env 
load_dotenv()

app = Flask(__name__)

#--- CORS(app)
CORS(app, resources={r"/*": {"origins": os.getenv('CORS_ORIGINS')}})
#CORS(app, supports_credentials=True)
#--- mongodb
client = MongoClient(os.getenv('MONGODB_URI'))
db = client[os.getenv('DB_NAME')]
collection = db[os.getenv('COLLECTION_NAME')]
collection2 = db[os.getenv('COLLECTION_NAME2')]

#---------------------------------------------------

'''
@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response
'''

#-- Config the upload folder
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

#-- Exists theupload folder
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Calculate the SHA-256
def generate_file_hash(file):
    sha256 = hashlib.sha256()
    while chunk := file.read(4096):  # Read 4KB at from the file
        sha256.update(chunk)  # Update the hash with the read data
    return sha256.hexdigest() 

# Generate a unique filename
def get_unique_filename(filepath):
    base, extension = os.path.splitext(filepath)
    counter = 2
    new_filepath = filepath
    while os.path.exists(new_filepath):
        #If the file already exists, add a number to the end
        new_filepath = f"{base}_{counter}{extension}"
        counter += 1
    return new_filepath

# Replace whitespace with "_"
def replace_whitespace(filename):
    return filename.replace(" ", "_")

#-- Generate the hash of the password
def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()

#-------------------------------------------------
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    replace_filename = replace_whitespace(file.filename)

    # Generate the hash
    file_hash = generate_file_hash(file)
    # Reset the file cursor to the beginning
    file.seek(0)

    # Get the original filename
    original_filepath = os.path.join(app.config['UPLOAD_FOLDER'], replace_filename)

    # Generate a unique filename
    unique_filepath = get_unique_filename(original_filepath)
    
    # Save the file in 'uploads'
    file.save(unique_filepath)

    # Imprimir la ruta del archivo en consola
    print(f"Digital evidence file uploaded: {unique_filepath}")
    print(f"Generated digital evidence hash: {file_hash}")

    return jsonify({"message": " Digital evidence uploaded and hash generated successfully", 
                    "file_path": unique_filepath,
                    "file_hash": file_hash
        }), 201

#---------------------------------------------------
@app.route('/users', methods=['POST']) #create user
def registerUser():  
    data = request.get_json() #get data from json

    # Verify if the 'id' field is present
    if not data.get('id'):
        return jsonify({"error": "The 'id' field isn't present"}), 400

    # Verify if the 'id' already exists in the database
    existing_user = collection2.find_one({"_id": data['id']})
    if existing_user:
        return jsonify({"error": "The 'id' already exists"}), 400
    
    user_data = {
        '_id': data.get('id'), # Get the 'id' field as the primary key
        'name': data.get('name'),
        'lastNames': data.get('lastNames'),
        'user': data.get('user'),
        'password': hash_password(data.get('password'))
    }

    #user_data = {"_id":"123", "name":"Pedro","lastNames":"Perez","user":"pedro", "password":"1234"}
    #print(f"Show data user: {user_data}")
    #print(f"Lista de colecciones en la BD: {db.list_collection_names()}")

    result = collection2.insert_one(user_data)

    print(f"Show data user2: {str(result)}")
    response_data = {
        'msg': 'registered user successfully',
    }
    return jsonify(response_data),201

@app.route('/insert', methods=['POST']) #create user
def registerEvidence():

    data = request.get_json() #get data from json

    # Verify if the 'hash' field is present
    if not data.get('fileHash'):
        return jsonify({"error": "The 'fileHash' field isn't present"}), 400

    # Verify if the 'fileHash' already exists in the database
    existing_user = collection.find_one({"_id": data['fileHash']})
    if existing_user:
        return jsonify({"error": "The 'fileHash' already exists"}), 400

    evidence_data = {
        '_id': data.get('fileHash'), # Get the 'id' field as the primary key
        'userType': data.get('userType'),
        'idType': data.get('idType'),
        'id': data.get('id'),
        'names': data.get('names'),
        'lastNames': data.get('lastNames'),
        'filePath': data.get('filePath'),
        'datepicker': data.get('datepicker'),
        'txHash': data.get('txHash'), # get tx registration evidence
        'phase': data.get('phase'),
        'uploadReport': 'Unregistered',
        'reportPath': ''
    }

    #data = {"id":123, "name":"pepito", "password":"123456"}
    print(f"Show data evidence: {evidence_data}")
    result = collection.insert_one(evidence_data)
    response_data = {
        'msg': 'registered data evidence successfully',
        'inserted_id': str(result.inserted_id)
    }
    return jsonify(response_data),201


if __name__ == '__main__':
    app.run(debug=True)
