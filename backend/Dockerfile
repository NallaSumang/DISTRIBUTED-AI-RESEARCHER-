# 1. Use a lightweight Python environment
FROM python:3.11-slim

# 2. Set the working directory inside the cloud container
WORKDIR /app

# 3. Copy your requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy all your backend Python files into the container
COPY . .

# 5. Hugging Face Spaces requires port 7860 to be open
EXPOSE 7860

# 6. Start the API and Worker via your main.py file
CMD ["sh", "-c", "python worker.py & python main.py"]