from flask import Flask, request, jsonify
import os
from flask_cors import CORS
import hashlib

app = Flask(__name__)

#CORS(app)
CORS(app, origins=["http://localhost:5173"]) 

# Directorio donde se guardarán los archivos
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Asegúrate de que el directorio existe
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
        })

if __name__ == '__main__':
    app.run(debug=True)
