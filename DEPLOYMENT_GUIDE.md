# 🚀 Complete Deployment Guide: Hostel Management System

This guide outlines the steps to deploy your **MySQL Database**, **Spring Boot Backend**, and **React Frontend** to the web using free (or very cheap) cloud services.

I've already updated your codebase to be deployment-ready by:
1. Adding environment variable support to `application.properties` (for DB and JWT config).
2. Updating `CorsConfig.java` to accept requests from any origin so your frontend can connect easily.
3. Updating the React `src/lib/api.ts` to respect a `VITE_API_URL` environment variable.

---

## 1. Deploy MySQL Database (via Aiven)
You need a database running in the cloud before deploying the backend. [Aiven](https://aiven.io/) provides a generous free tier for MySQL.

1. Go to **[Aiven.io](https://aiven.io/)** and sign up.
2. Click **Create Service**.
3. Select **MySQL** and choose the **Free** plan.
4. Choose a region closest to you and click **Create**.
5. Once your service is running, find the **Connection URI** (it looks like `mysql://username:password@host:port/defaultdb`).
6. Save this URI; you'll need it for the backend!

*Alternatively, you can also use [Railway.app](https://railway.app/) to easily spin up a MySQL database.*

---

## 2. Deploy Spring Boot Backend (via Render)

[Render.com](https://render.com) is great for hosting Spring Boot Java APIs.

### A. Prepare the backend
1. Push your code to a **GitHub** repository.
2. Ensure your backend has a `Dockerfile`. If it doesn't, Render can also use a "Web Service -> Java" environment which builds using Maven. Render's standard Java environment handles standard Spring Boot Maven projects automatically.

### B. Create Render Service
1. Go to **[Render.com](https://render.com)** and sign in.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your repository.
4. Choose the following settings:
   - **Root Directory**: `spring_backend`
   - **Environment**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/hostel-management-0.0.1-SNAPSHOT.jar` *(make sure this matches your generated `.jar` file name)*
5. Scroll down to **Environment Variables** and add the following:
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://[YOUR_DB_HOST]:[YOUR_DB_PORT]/[DB_NAME]?useSSL=true` *(Use details from Aiven)*
   - `SPRING_DATASOURCE_USERNAME`: *(Your DB Username)*
   - `SPRING_DATASOURCE_PASSWORD`: *(Your DB Password)*
   - `JWT_SECRET`: `SomeVeryLongRandomStringHereForSecurity1234567890!` *(Make it at least 256 bits/32 characters)*
6. Choose the **Free** instance type and click **Create Web Service**.
7. Wait to see the "Live" green badge. Copy the backend origin URL (e.g., `https://your-backend.onrender.com`).
   *Note: Make sure your `pom.xml` version output matches the Start Command `.jar`.*

---

## 3. Deploy React Frontend (via Vercel)

[Vercel](https://vercel.com/) is fast, free, and specifically optimized for Vite + React applications.

1. Go to **[Vercel.com](https://vercel.com/)** and sign in with GitHub.
2. Click **Add New... > Project**.
3. Import the same GitHub repository you created earlier.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or wherever your `package.json` is located. Keep as `./` since your frontend is at the repo root!)
5. Expand the **Environment Variables** tab and add:
   - `VITE_API_URL`: *The URL of your deployed backend* (e.g., `https://your-backend.onrender.com/api`)
6. Click **Deploy**.
7. Vercel will build and deploy your React app within minutes. Once done, it will give you a public URL (e.g., `https://hostel-management.vercel.app`).

---

## 🎉 Done!
Your site is live! You can now visit your Vercel URL, sign in, and interact with your cloud-hosted backend and database.

**Helpful Tip**: Render's free tier spins down after 15 minutes of inactivity. When you visit the site later, the first request might take about 50 seconds while the backend wakes up.
