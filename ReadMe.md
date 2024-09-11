Oak Wilt Detection Project: Setup and Running Guide

This README provides a step-by-step guide on how to set up and run the Oak Wilt Detection project, which consists of a Flask backend and a VueJS frontend.

Prerequisites

Before starting, ensure you have the following installed:

1. Python: Version 3.11.0
2. Node.js: Version 14.x or higher.

---

Backend Setup (Flask)

 Step 1: Create a Virtual Environment (venv)

First, create a virtual environment to isolate the project dependencies. Use the following commands in your terminal or PowerShell:

 Create a virtual environment
py -m venv "E:\Research\Vue-Flusk\dnr\venv"

 Activate the virtual environment (for Windows PowerShell)
.\venv\Scripts\Activate.ps1


This command will create and activate a virtual environment in your project directory.

 Step 2: Install Backend Dependencies

Once the virtual environment is active, install the required dependencies by running the following command inside your project directory where the `requirements.txt` file is located:

pip install -r requirements.txt

This will install the following dependencies:

- Flask == 2.0.1
- Flask-Cors == 3.0.10
- Pillow == 10.2.0
- Werkzeug == 2.0
- itsdangerous == 1.1.0
- click == 7.1.2
- Pandas == 2.0.1
- piexif == 1.1.3
- tensorflow == 2.16.1
- opencv-python == 4.8.0.74
- numpy == 1.24.3

 Step 3: Running the Backend

After installing the dependencies, navigate to the backend directory and run the Flask application:

cd backend
py main.py

The backend will start, and the server will be running on `localhost:5000`. This will be the core API that the frontend interacts with for processing images and predictions.

Frontend Setup (VueJS)

 Step 1: Install Vue CLI

Make sure you have Vue CLI installed globally on your system. If not, you can install it using the following command:

npm install -g @vue/cli

 Step 2: Navigate to the Frontend Directory

Navigate to the `frontend` folder to install dependencies:

cd frontend

 Step 3: Install Node Modules

To install the necessary dependencies for the frontend, run:

npm install

This will install all the required `node_modules` for the VueJS frontend, including any necessary libraries for building the interface and making API requests to the backend.

 Step 4: Run the Frontend

After installing the dependencies, start the VueJS development server using:

npm run serve

This command will start the frontend on `localhost:8080` by default. You can now access the web interface to upload images and view predictions.

---

 Running the Full Project

To run the project:

1. Backend: Activate your virtual environment, navigate to the backend folder, and run `py main.py`.
2. Frontend: Open a new terminal, navigate to the frontend directory, and run `npm run serve`.

With both the backend and frontend running, you can access the application at `localhost:8080` in your web browser, where it will interact with the Flask backend API.

---