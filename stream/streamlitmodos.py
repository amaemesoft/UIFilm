import streamlit as st
import requests
import datetime

backend_url = "http://localhost:8080"

st.title("Responder a la actriz")

st.subheader("Chat")
chat_box = st.empty()

def get_chat_history():
    response = requests.get(f"{backend_url}/chat_history")
    if response.status_code == 200:
        return response.json().get("history", [])
    return []

def get_mode():
    response = requests.get(f"{backend_url}/get_mode")
    if response.status_code == 200:
        return response.json().get("mode")
    return "guionizado"

def set_mode(new_mode):
    response = requests.post(f"{backend_url}/set_mode", json={"mode": new_mode})
    if response.status_code == 200:
        return response.json().get("mode")
    return "guionizado"

def set_prompt(prompt):
    response = requests.post(f"{backend_url}/set_prompt", json={"prompt": prompt})
    if response.status_code == 200:
        return response.json().get("status") == 'success'
    return False

def load_script(script_content):
    response = requests.post(f"{backend_url}/load_script", json={"script": script_content})
    return response.status_code == 200

# Declarar modo predeterminado inicio
current_mode = get_mode()

def update_chat(scroll_to_end=False):
    chat_history = get_chat_history()
    chat_messages = ""
    for entry in chat_history:
        timestamp = entry.get("timestamp")
        character = entry.get("character")
        message = entry.get("message")
        chat_messages += f"{timestamp} {character}: {message}\n"
    chat_box.text_area("Chat", chat_messages, height=400, disabled=True, key="chat_area_" + str(datetime.datetime.now().timestamp()))
    if scroll_to_end:
        st.markdown("<script>window.scrollTo(0, document.body.scrollHeight);</script>", unsafe_allow_html=True)

st.subheader("Enviar respuesta")
response_text = st.text_input("Escribe tu respuesta...", key="response_input")

if st.button("Enviar"):
    if response_text:
        response_data = {
            "response_text": response_text,
            "character": "Marta",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        requests.post(f"{backend_url}/respond", json=response_data)
        update_chat(scroll_to_end=True)

# Cambios de modo por fin yafunciona!
st.subheader("Modo de conversación")
current_mode = get_mode()

col1, col2, col3 = st.columns(3)

with col1:
    if st.button("Cambiar a Stream"):
        current_mode = set_mode("stream")
        st.text(f"Modo actual: {current_mode}")
        st.experimental_rerun()  

with col2:
    if st.button("Cambiar a Guionizado"):
        current_mode = set_mode("guionizado")
        st.text(f"Modo actual: {current_mode}")
        st.experimental_rerun()  

with col3:
    if st.button("Cambiar a IA"):
        current_mode = set_mode("IA")
        st.text(f"Modo actual: {current_mode}")
        st.experimental_rerun()  

st.text(f"Modo actual: {current_mode}")

# Lógica adicional modo IA
if current_mode == "IA":
    st.subheader("Modo IA activado")
    prompt_text = st.text_input("Introduce el prompt para las conversaciones previas (separa múltiples temas con ';'):", key="prompt_input_unique")

    if st.button("Generar Conversación"):
        if prompt_text:
            prompts = prompt_text.split(";")
            for prompt in prompts:
                response = requests.post(f"{backend_url}/generate_conversation", json={"prompts": [prompt.strip()]})
                if response.status_code == 200:
                    st.text("Conversación generada con éxito")
                else:
                    st.text(f"Error al generar conversación: {response.json().get('error', 'Unknown error')}")
            # Actualizar el chat después de generar las conver
            update_chat(scroll_to_end=True)

# Lógica adicional para modo guionizado
if current_mode == "guionizado":
    st.subheader("Modo Guionizado activado")
    uploaded_file = st.file_uploader("Elige un archivo de guion", type="py")

    if uploaded_file is not None:
        script_content = uploaded_file.read().decode("utf-8")
        if load_script(script_content):
            st.success("Guion cargado exitosamente")
            update_chat(scroll_to_end=True)
        else:
            st.error("Error al cargar el guion")
            
# Actualizar el chat al inicio
update_chat()
