# Hostel Management System

A full-stack hostel management application built with a React frontend and a Spring Boot backend for managing hostel operations efficiently.

## Overview


This project helps manage:

- Student records
- Room allocation and room availability
- Hostel dashboard summaries
- Admin authentication and secure access
- Backend APIs for hostel data management

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- MySQL
- JWT

## Project Structure

```text
.
├── src/                  # React frontend source
├── public/               # Static frontend assets
├── spring_backend/       # Spring Boot backend project
│   ├── src/main/java/    # Java backend source
│   ├── src/main/resources/  # Application config and properties
│   ├── pom.xml           # Maven configuration
│   └── target/           # Build output
├── package.json          # Frontend dependencies and scripts
├── vite.config.ts        # Vite config
├── tailwind.config.ts    # Tailwind config
├── README.md             # Project documentation
└── vercel.json           # Deployment config
```

## Features

- Secure login and authentication flow
- Dashboard for key hostel statistics
- Student management
- Room management and status tracking
- Data persistence with MySQL
- REST API integration between frontend and backend

## Prerequisites

Before running this project, make sure you have:

- Node.js 18+
- npm or yarn
- Java 17+
- Maven
- MySQL database

## Frontend Setup

```bash
npm install
npm run dev
```

The app should start on the default Vite development server, usually on:

```text
http://localhost:5173
```

## Backend Setup

From the backend folder:

```bash
cd spring_backend
mvn clean install
mvn spring-boot:run
```

Make sure your MySQL database is running and the credentials in the backend configuration match your local environment.

## Environment Configuration

The backend configuration is in:

```text
spring_backend/src/main/resources/application.properties
```

You can update the MySQL and JWT settings there if needed.

Example configuration values include:

- Database URL
- Username and password
- Server port
- JWT secret

## Run App Together

1. Start MySQL
2. Run the Spring Boot backend
3. Start the frontend with Vite
4. Open the frontend in the browser

## Notes

This project is customized for hostel operations and can be extended for:

- rent tracking
- visitor logs
- attendance management
- billing and invoices
- notifications and alerts

## License

This project is for local development and educational use unless a separate license is provided by the project owner.
