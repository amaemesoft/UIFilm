import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import vertexai
from vertexai.preview.generative_models import GenerativeModel
from datetime import datetime, timedelta
import random
import requests
import time

from config import PROJECT_ID, REGION, GOOGLE_APPLICATION_CREDENTIALS

# Configura las credenciales
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

# Inicializa Vertex AI
vertexai.init(project=PROJECT_ID, location=REGION)

# Inicializa el modelo de IA
gemini_pro_last = GenerativeModel(model_name="gemini-1.5-pro-preview-0409")

app = Flask(__name__)
CORS(app)  # Esto permitirá todas las solicitudes CORS

# Lista para almacenar el historial del chat
chat_history = []
mode = {"current_mode": "guionizado"}  # Estado inicial del modo
prompt = ""  # Almacena el prompt actual
script = []  # Almacena el guion cargado
script_index = 0  # Índice para rastrear el progreso del guion

# Directorio para guardar los archivos de media (audio e imágenes)
MEDIA_DIR = os.path.join(os.getcwd(), 'media')
AUDIO_DIR = os.path.join(MEDIA_DIR, 'audio')
IMAGE_DIR = os.path.join(MEDIA_DIR, 'images')

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    audio = request.files['audio']
    
    if audio:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        audio_filename = f"{timestamp}.webm"
        
        # Asegúrate de que la carpeta audio exista
        if not os.path.exists(AUDIO_DIR):
            os.makedirs(AUDIO_DIR)

        audio_path = os.path.join(AUDIO_DIR, audio_filename)
        print(f"Saving audio to: {audio_path}")  # Mensaje de depuración
        audio.save(audio_path)
        
        # Verificar si el archivo fue guardado
        if os.path.exists(audio_path):
            print(f"Audio saved successfully: {audio_path}")
        else:
            print(f"Failed to save audio: {audio_path}")
        
        chat_entry = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "character": "Ama",
            "message": "",
            "audio_url": f"/audio/{audio_filename}"
        }
        chat_history.append(chat_entry)
        
        # Procesar el guion si está en modo guionizado
        if mode['current_mode'] == 'guionizado' and script:
            process_script()

        return jsonify({'status': 'success', 'audio_url': f"/audio/{audio_filename}"}), 200
    return jsonify({'error': 'Failed to save audio'}), 500

@app.route('/audio/<filename>')
def get_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)

# Endpoint para subir imágenes
@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    image = request.files['image']
    if image:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        image_filename = f"{timestamp}.jpg"
        
        # Asegúrate de que la carpeta images exista
        if not os.path.exists(IMAGE_DIR):
            os.makedirs(IMAGE_DIR)

        image_path = os.path.join(IMAGE_DIR, image_filename)
        print(f"Saving image to: {image_path}")  # Mensaje de depuración
        image.save(image_path)
        
        # Verificar si el archivo fue guardado
        if os.path.exists(image_path):
            print(f"Image saved successfully: {image_path}")
        else:
            print(f"Failed to save image: {image_path}")
        
        chat_entry = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "character": "Ama",
            "message": "",
            "image_url": f"/images/{image_filename}"
        }
        chat_history.append(chat_entry)
        
        # Procesar el guion si está en modo guionizado
        if mode['current_mode'] == 'guionizado' and script:
            process_script()

        return jsonify({'status': 'success', 'image_url': f"/images/{image_filename}"}), 200
    return jsonify({'error': 'Failed to save image'}), 500

@app.route('/images/<filename>')
def get_image(filename):
    return send_from_directory(IMAGE_DIR, filename)

@app.route('/chat', methods=['POST'])
def chat():
    if request.is_json:
        user_input = request.json.get('user_input')
        if not user_input:
            return jsonify({'error': 'No input provided'}), 400
        chat_entry = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "character": "Ama",
            "message": user_input
        }
        chat_history.append(chat_entry)

        # Procesar el guion si está en modo guionizado
        if mode['current_mode'] == 'guionizado' and script:
            process_script()

        return jsonify({'response': 'Mensaje recibido'})
    else:
        return jsonify({'error': 'Request must be JSON'}), 400

def process_script():
    global script_index
    while script_index < len(script):
        character, message = script[script_index]
        if character == "Marta":
            delay = min(len(message) * 50, 2000)  # Simular un retraso basado en la longitud del mensaje
            timestamp = datetime.now() + timedelta(milliseconds=delay)
            chat_entry = {
                "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "character": character,
                "message": message
            }
            chat_history.append(chat_entry)
            script_index += 1
            break
        script_index += 1

@app.route('/respond', methods=['POST'])
def respond():
    if request.is_json:
        response_text = request.json.get('response_text')
        character = request.json.get('character', 'Marta')
        timestamp = request.json.get('timestamp', datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        if not response_text:
            return jsonify({'error': 'No response provided'}), 400
        try:
            chat_entry = {
                "timestamp": timestamp,
                "character": character,
                "message": response_text
            }
            chat_history.append(chat_entry)
            return jsonify({'status': 'success'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Request must be JSON'}), 400

# Manejar múltiples prompts
@app.route('/generate_conversation', methods=['POST'])
def generate_conversation():
    if request.is_json:
        prompts = request.json.get('prompts', [])
        if not prompts:
            return jsonify({'error': 'No prompts provided'}), 400
        
        generated_conversation = []
        try:
            for prompt in prompts:
                response = gemini_pro_last.generate_content([prompt + "\nAma: \nMarta: \nAma: \nMarta: \nAma: \nMarta:"])
                dialogue_lines = response.text.replace('*', '').split("\n")
                last_timestamp = datetime.now() - timedelta(days=random.randint(1, 10))
                for line in dialogue_lines:
                    if line.startswith("Ama:") or line.startswith("Marta:"):
                        character, message = line.split(": ", 1)
                        timestamp = last_timestamp.strftime("%Y-%m-%d %H:%M:%S")
                        last_timestamp += timedelta(seconds=random.randint(30, 120))  # Incrementar la hora de manera lógica
                        chat_entry = {
                            "timestamp": timestamp,
                            "character": character,
                            "message": message
                        }
                        generated_conversation.append(chat_entry)
            # Order by timestamp ascending
            generated_conversation.sort(key=lambda x: x["timestamp"])
            chat_history[:] = generated_conversation + chat_history  # Insertar la conversación generada al principio del historial
            return jsonify({'conversation': generated_conversation})
        except Exception as e:
            import traceback
            print(traceback.format_exc())  # Log the stack trace for debugging
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Request must be JSON'}), 400

@app.route('/refresh_gui', methods=['GET'])
def refresh_gui():
    try:
        # Simular refresco de la GUI de la app
        response = requests.get(f"http://localhost:8080/chat_history")
        if response.status_code == 200:
            chat_history_data = response.json().get("history", [])
            return jsonify({'status': 'success', 'history': chat_history_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat_history', methods=['GET'])
def get_chat_history():
    return jsonify({'history': chat_history})

@app.route('/set_mode', methods=['POST'])
def set_mode():
    if request.is_json:
        new_mode = request.json.get('mode')
        if new_mode in ['guionizado', 'stream', 'IA']:
            mode['current_mode'] = new_mode
            return jsonify({'status': 'success', 'mode': new_mode})
        else:
            return jsonify({'error': 'Invalid mode'}), 400
    else:
        return jsonify({'error': 'Request must be JSON'}), 400

@app.route('/get_mode', methods=['GET'])
def get_mode():
    return jsonify({'mode': mode['current_mode']})

@app.route('/set_prompt', methods=['POST'])
def set_prompt():
    global prompt
    if request.is_json:
        prompt = request.json.get('prompt')
        return jsonify({'status': 'success'})
    else:
        return jsonify({'error': 'Request must be JSON'}), 400

@app.route('/get_prompt', methods=['GET'])
def get_prompt():
    return jsonify({'prompt': prompt})

@app.route('/load_script', methods=['POST'])
def load_script():
    global script, script_index, chat_history
    if request.is_json:
        script_content = request.json.get('script')
        if not script_content:
            return jsonify({'error': 'No script provided'}), 400

        try:
            # Ejecutar el contenido del script para obtener la lista de diálogos
            script_globals = {}
            exec(script_content, {}, script_globals)
            script = script_globals.get("script", [])
            script_index = 0  # Reiniciar el índice del guion
            chat_history = []  # Limpiar el historial actual
            return jsonify({'status': 'success'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Request must be JSON'}), 400

if __name__ == '__main__':
    app.run(port=8080)
