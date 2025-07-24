# Project Title: Development of Endpoint OS Security Policy Configurations

# Description:
This project is a full-stack web application designed to generate and manage endpoint OS security policy configurations through an intuitive graphical user interface. It allows users to select policy categories, configure parameter values with validation, apply best practices, and generate .policyrules files. The application ensures accurate and flexible policy creation tailored to enterprise and system administrator needs.

# Frontend:
React.js: Dynamic UI rendering and user input handling
Axios: For making API requests to the backend

# Backend:
Django: Robust server-side framework for handling business logic
Django REST Framework (DRF): API creation and JSON serialization
CORS Headers: Enables secure development with React

# Database:
SQLite: Lightweight and portable relational database

# Key Features:
Organize policies into selectable categories
Support for multiple configuration types of various parameters
Conditional input rendering based on user selections
Automatic policy rule line generation using database segments
Store generated configuration in the database using a session ID
Error handling and validation (e.g., numeric bounds, required fields)
Export .policyrules file for download

# Use Case:
Ideal for enterprise administrators who need a centralized and user-friendly tool to configure and deploy Group Policy settings to endpoint operating systems in a secure and consistent manner.

# Steps to Setup:

1. Create a Virtual Environment
   python -m venv venv
   
2. Activate the Environment
   On Windows:   venv\Scripts\activate
   On Mac/Linux:   source venv/bin/activate
   
3. Install Dependencies
  
4.  Run Migrations
   python manage.py makemigrations
   python manage.py migrate

5. Run the Django Development Server
   python manage.py runserver

6. Navigate to the React Directory
   cd gp-generator-frontend 

7. Install Node Modules
   npm install

8. Start the React Development Server
   npm start
   React app will run on: http://localhost:3000/
