import subprocess
import time
import os
import requests
import json

# Obtén la ruta absoluta del directorio raíz del proyecto
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def start_backend():
    backend_path = os.path.join(PROJECT_ROOT, "backend", "appmodos.py")
    return subprocess.Popen(["python", backend_path])

def start_streamlit():
    streamlit_path = os.path.join(PROJECT_ROOT, "stream")
    os.chdir(streamlit_path)
    return subprocess.Popen(["streamlit", "run", "streamlitmodos.py"])

def start_react_frontend():
    react_path = os.path.join(PROJECT_ROOT, "frontend-react")
    os.chdir(react_path)
    # Verifica si package.json existe
    if os.path.exists(os.path.join(react_path, 'package.json')):
        return subprocess.Popen(["npm", "start"], shell=True)
    else:
        print(f"No se encontró package.json en {react_path}. Asegúrate de que el directorio es correcto.")
        return None

def wait_for_backend():
    url = "http://localhost:8080/chat_history"
    while True:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                break
        except requests.exceptions.ConnectionError:
            time.sleep(1)

def get_chat_history():
    url = "http://localhost:8080/chat_history"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.json().get("history", [])
    except requests.exceptions.ConnectionError:
        pass
    return []

def refresh_gui():
    url = "http://localhost:8080/refresh_gui"
    try:
        response = requests.get(url)
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        return False

if __name__ == "__main__":
    backend_process = start_backend()
    print("Starting backend...")
    wait_for_backend()
    print("Backend is running.")

    streamlit_process = start_streamlit()
    print("Starting Streamlit app...")

    react_process = start_react_frontend()
    if react_process:
        print("Starting React frontend...")
    else:
        print("Failed to start React frontend.")

    current_mode = None

    try:
        while True:
            response = requests.get("http://localhost:8080/get_mode")
            if response.status_code == 200:
                new_mode = response.json().get("mode")
                if new_mode != current_mode:
                    current_mode = new_mode
                    chat_history = get_chat_history()
                    print(f"Frontend running in {current_mode} mode.")
            if current_mode == "IA":
                refresh_gui()  # Refrescar la GUI periódicamente en el modo IA
            time.sleep(5)
    except KeyboardInterrupt:
        print("Terminating processes...")
        backend_process.terminate()
        streamlit_process.terminate()
        if react_process:
            react_process.terminate()
