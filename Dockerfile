# Usa una imagen base oficial de Python
FROM python:3.11-slim

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos requeridos a la imagen de Docker
COPY requirements.txt requirements.txt
COPY backend/ backend/
COPY config.py config.py

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Expone el puerto que usará la aplicación
EXPOSE 8080

# Define el comando por defecto a ejecutar cuando se inicie el contenedor
CMD ["gunicorn", "--timeout", "60", "--bind", "0.0.0.0:8080", "backend.appmodos:app"]
