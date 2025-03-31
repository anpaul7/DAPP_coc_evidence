from datetime import timedelta
from flask import Flask, request, jsonify
import os
from flask_cors import CORS
import hashlib
from pymongo import MongoClient
from flask_pymongo import PyMongo, ObjectId
from dotenv import load_dotenv
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
from flask import send_from_directory

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

#--- config JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY') # key secret for token with JWT
jwt = JWTManager(app)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=40) # time to expire token
#---------------------------------------------------

#-- Config the upload folder
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER')
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), UPLOAD_FOLDER)

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
@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    #id= data.get('id')
    user= data.get('user')
    password = data.get('password')

    print(f"Token:  {user} - {password}")
    # Check if the user exists
    existing_user = db.users.find_one({'user':user, 'password':hash_password(password)})

    if not existing_user:
        return jsonify({"error": "Invalid credentials"}), 401

    # Get the user role - user role default
    user_role = existing_user.get('role','user')
    
    # Generate token JWT with user role
    access_token = create_access_token(identity=user, additional_claims={'role': user_role})
    print(f"Token:  {access_token}")
    print(f"Role:  {user_role}")
    return jsonify(access_token=access_token, role=user_role), 200

#-------------------------------------------------
@app.route('/upload', methods=['POST'])
@jwt_required() # Protected route and JWT autentication
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"Error": "No file sent"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"Error": "No selected file"}), 401
        
        case_number = request.form.get('caseNumber')
        if not case_number:
            return jsonify({"Error": "No caseNumber provided"}), 401
        try:
            case_number = int(case_number)
        except ValueError:
            return jsonify({"Error": "Invalid caseNumber format"}), 400

        # Generate the hash
        file_hash = generate_file_hash(file)

        # Reset the file cursor to the beginning
        file.seek(0)

        # Verify if the hash already exists in the database
        existing_hash = db.digitalevidence.find_one({
            'caseNumber':case_number, 
            'hashEvidence':file_hash
        })

        if existing_hash:
            return jsonify({"Error": "Evidence already exists in database for this case"}), 402
        
        _, ext = os.path.splitext(file.filename) # Get the file extension
        new_filename = f"case_number_{case_number}_digital_evidence{ext}" # Generate a new filename
        new_filename = replace_whitespace(new_filename)

        # Get the original filename
        original_filepath = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)

        # Generate a unique filename
        unique_filepath = get_unique_filename(original_filepath)
        
        # Save the file in 'uploads'
        file.save(unique_filepath)

        # Print the uploaded file details
        print(f"Digital evidence file uploaded: {unique_filepath}")
        print(f"Generated digital evidence hash: {file_hash}")

        relative_file_path = os.path.join("src", os.getenv('UPLOAD_FOLDER', 'uploads'), new_filename)
        return jsonify({"message": " Digital evidence uploaded and hash generated successfully", 
                        "file_path": relative_file_path,
                        "file_hash": file_hash
            }), 201
    except Exception as e:
        print(f"Error in upload_file: {str(e)}")
        return jsonify({"Error": "Internal Server Error", "Details": str(e)}), 500

#----------------- upload technical report
@app.route('/uploadTechnicalReport', methods=['POST'])
@jwt_required() # Protected route and JWT autentication
def upload_technicalReport():
    try:
        if 'file' not in request.files:
            return jsonify({"Error": "No file sent"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"Error": "No selected file"}), 401

        technicalReport = request.form.get('technicalReportFilename')
        print(f"technicalReportFilename: {technicalReport}")
        
        if not technicalReport:
            return jsonify({"Error": "No technicalReportFilename provided"}), 401
        
        # Save the file in 'uploads'
        upload_folder = os.getenv('UPLOAD_FOLDER', 'uploads')
        save_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), upload_folder)
        os.makedirs(save_directory, exist_ok=True)

        save_path = os.path.join(save_directory, technicalReport)
        file.save(save_path)

        relative_file_path = os.path.join("src", upload_folder, technicalReport)
        
        return jsonify({"message": " Technical report uploaded successfully", 
                        "file_path": relative_file_path,
        }), 201

    except Exception as e:
        print(f"Error in upload_technicalReport: {str(e)}")
        return jsonify({"Error": "Internal Server Error", "Details": str(e)}), 500

#---------------------------------------------------
@app.route('/uploadExecutiveReport', methods=['POST'])
@jwt_required()  # Protected route and JWT authentication
def upload_executiveReport():
    try:
        if 'file' not in request.files:
            return jsonify({"Error": "No file sent"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"Error": "No selected file"}), 401

        executiveReport = request.form.get('executiveReportFilename')
        print(f"executiveReportFilename: {executiveReport}")
        
        if not executiveReport:
            return jsonify({"Error": "No executiveReportFilename provided"}), 401
        
        # Save the file in 'uploads'
        upload_folder = os.getenv('UPLOAD_FOLDER', 'uploads')
        save_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), upload_folder)
        os.makedirs(save_directory, exist_ok=True)

        save_path = os.path.join(save_directory, executiveReport)
        file.save(save_path)

        relative_file_path = os.path.join("src", upload_folder, executiveReport)
        
        return jsonify({
            "message": "Executive report uploaded successfully", 
            "file_path": relative_file_path,
        }), 201

    except Exception as e:
        print(f"Error in upload_executiveReport: {str(e)}")
        return jsonify({"Error": "Internal Server Error", "Details": str(e)}), 500

#---------------------------------------------------
@app.route('/download/<path:filename>', methods=['GET'])
@jwt_required() 
def download_file(filename):
    full_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    print(f"Filename: {filename}")
    print(f"Full file path: {full_path}")
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True) 

#---------------------------------------------------
@app.route('/download2/<path:filename>', methods=['GET'])
@jwt_required() 
def download_file2(filename):
    full_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    print(f"Filename: {filename}")
    print(f"Full file path: {full_path}")
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True) 

#---------------------------------------------------
@app.route('/download3/<path:filename>', methods=['GET'])
@jwt_required() 
def download_file3(filename):
    full_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    print(f"Filename: {filename}")
    print(f"Full file path: {full_path}")
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True) 

#---------------------------------------------------
@app.route('/users', methods=['POST']) #create user
@jwt_required() # Protected route and JWT autentication
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

#------------- insert evidence in db
@app.route('/insert', methods=['POST']) #register evidence in db
@jwt_required() # Protected route and JWT autentication
def registerEvidence():

    data = request.get_json() #get data from json

    # Verify if the 'hash' field is present
    if not data.get('hashEvidence'):
        return jsonify({"error": "The 'hashEvidence' field isn't present"}), 400

    if not data.get('caseNumber'):
        return jsonify({"error": "The 'caseNumber' field isn't present"}), 400

    # Verify if the 'hashEvidence' already exists in the database
    existing_data = collection.find_one({ "caseNumber": int(data['caseNumber']),"hashEvidence": data['hashEvidence']})
    if existing_data:
        return jsonify({"error": "The 'hashEvidence' already exists"}), 400

    evidence_data = {  
        '_id': data.get('currentId'),# Get the 'id' field as the primary key
        'caseNumber': data.get('caseNumber'),
        'location': data.get('location'),
        'device': data.get('device'),
        'evidenceType': data.get('evidenceType'),
        'hashEvidence': data.get('hashEvidence'),
        'filePath': data.get('filePath'),
        'registrationDate': data.get('registrationDate'), 
        'methodAdquisition': data.get('methodAdquisition'),
        'noteEvidence': data.get('noteEvidence'),
        'userId': data.get('userId'),
        'names': data.get('names'),
        'lastNames': data.get('lastNames'),
        'userType': data.get('userType'),
        'technicalReport': 'noFile',
        'executiveReport': 'noFile',

        'transactions': [
            {   
                'txId': 0,
                'blockchainTxHash': data.get('blockchainTxHash'),
                'phase': 'Preservation',
                'state': 'Custody',
                'txDate': data.get('registrationDate'), 
                'userId': data.get('userId'),
                'names': data.get('names'),
                'lastNames': data.get('lastNames'),
                'userType': data.get('userType'),
                'nameUser': data.get('nameUser')
            }
        ]
    }

    #data = {"id":123, "name":"pepito", "password":"123456"}
    print(f"Show data evidence: {evidence_data}")
    result = collection.insert_one(evidence_data)
    response_data = {
        'msg': 'Successfully recorded digital evidence',
        'inserted_id': str(result.inserted_id)
    }
    return jsonify(response_data),201

#------------- update evidence in db
@app.route('/updateEvidence/<int:id>', methods=['PUT']) 
@jwt_required() # Protected route and JWT autentication
def updateEvidence(id):

    data = request.get_json() #get data from json
  
    if data.get('id') is None:
        return jsonify({"error": "The 'id' field isn't present"}), 400
    
    if int(data.get('id')) != id:
        return jsonify({"error": "The id in the URL and in the JSON do not match"}), 401
    
    existing_data = collection.find_one({ "_id": int(data['id'])})
    if not existing_data:
        return jsonify({"error": "The 'id' not exists"}), 402

    update_fields = {
        "phase": data.get("phase"),
        "state": data.get("state"),
        "stateUpdateDate": data.get("stateUpdateDate")
    }
    update_fields = {k: v for k, v in update_fields.items() if v is not None}

    new_transaction = {
        "txId": len(existing_data.get("transactions", [])),
        "blockchainTxHash": data.get("blockchainTxHash"),
        "phase": data.get("phase"),
        "state": data.get("state"),
        "txDate": data.get("stateUpdateDate"),
        "userId": data.get("userId"),
        "names": data.get("names"),
        "lastNames": data.get("lastNames"),
        "userType": data.get("userType"),
        "nameUser": data.get("nameUser")
    }

    result = collection.update_one(
        {"_id": int(data['id'])},
        {
            "$set": update_fields, # Update the specified fields
            "$push": {"transactions": new_transaction} # Add the new transaction
        }
    )

    if result.modified_count == 1:
        response_data = {"msg": "Evidence updated successfully"}
        print(f"Response data: {response_data}")
        return jsonify(response_data), 200
    else:
        return jsonify({"error": "Evidence not found or no changes made"}), 404

#------------- update evidence2 in db
@app.route('/updateEvidence2/<int:id>', methods=['PUT']) 
@jwt_required() # Protected route and JWT autentication
def updateEvidence2(id):

    data = request.get_json() #get data from json

    if data.get('id') is None:
        return jsonify({"error": "The 'id' field isn't present"}), 400
    
    if int(data.get('id')) != id:
        return jsonify({"error": "The id in the URL and in the JSON do not match"}), 401
    
    existing_data = collection.find_one({ "_id": int(data['id'])})
    if not existing_data:
        return jsonify({"error": "The 'id' not exists"}), 402

    update_fields = {
        "phase": data.get("phase"),
        "state": data.get("state"),
        "stateUpdateDate": data.get("stateUpdateDate"),
        "technicalReport": data.get("technicalReport"),
        "executiveReport": data.get("executiveReport")
    }
    update_fields = {k: v for k, v in update_fields.items() if v is not None}

    new_transaction = {
        "txId": len(existing_data.get("transactions", [])),
        "blockchainTxHash": data.get("blockchainTxHash"),
        "phase": data.get("phase"),
        "state": data.get("state"),
        "txDate": data.get("stateUpdateDate"),
        "userId": data.get("userId"),
        "names": data.get("names"),
        "lastNames": data.get("lastNames"),
        "userType": data.get("userType"),
        "nameUser": data.get("nameUser")
    }

    result = collection.update_one(
        {"_id": int(data['id'])},
        {
            "$set": update_fields, # Update the specified fields
            "$push": {"transactions": new_transaction} # Add the new transaction
        }
    )

    if result.modified_count == 1:
        response_data = {"msg": "Evidence updated successfully"}
        print(f"Response data: {response_data}")
        return jsonify(response_data), 200
    else:
        return jsonify({"error": "Evidence not found or no changes made"}), 404
 
 

#------------- verify evidence in blockchain db
@app.route('/verify', methods=['POST']) #verify evidence in db
@jwt_required() # Protected route and JWT autentication
def verifyEvidence():

    data = request.get_json() #get data from json

    # Verify if the '_id' already exists in the database
    existing_evidence = collection.find_one({ "caseNumber": data['caseNumber'],"hashEvidence": data['hashEvidence']})
    
    response_data = {
        'msg': 'Evidence found in database' if existing_evidence else 'Evidence not found in database',
        'status': bool(existing_evidence)  # Return True if the evidence exists, False otherwise
    }

    return jsonify(response_data)# Return the response true or false

@app.route('/verifyHash', methods=['POST']) #verify hash in db
@jwt_required() # Protected route and JWT autentication
def verifyHash():

    data = request.get_json() #get data from json

    # Verify if the '_id' already exists in the database
    existing_evidence = collection.find_one({"_id": data['id']})
    response_data = {
        'msg': 'Evidence found in database' if existing_evidence else 'Evidence not found in database',
        'status': bool(existing_evidence)  # Return True if the evidence exists, False otherwise
    }

@app.route('/getEvidenceData', methods=['GET'])
@jwt_required()  
def get_all_evidences():
    evidences = list(collection.find({}))
    return jsonify(evidences), 200

if __name__ == '__main__':
    app.run(debug=True)
