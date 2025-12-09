# Football League Management System - Setup Guide

This guide will help you set up and run the Football League Management System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 16+ and npm** - [Download Node.js](https://nodejs.org/)
3. **MySQL Server 8.0+** - [Download MySQL](https://dev.mysql.com/downloads/mysql/)
4. **Git** (optional) - [Download Git](https://git-scm.com/downloads)

## Project Structure

```
Football-League-Management-System/
├── backend/              # Flask API server
│   ├── app.py           # Main Flask application
│   ├── config.py        # Configuration settings
│   ├── admin_routes.py  # Admin API routes
│   └── user_routes.py   # User API routes
├── football-frontend/    # React frontend application
│   ├── src/
│   └── package.json
└── database/            # Database schema and scripts
    ├── schema.sql       # Database schema
    ├── views.sql        # Database views
    └── procedures_triggers.sql  # Stored procedures and triggers
```

## Step 1: Database Setup

### 1.1 Install MySQL

Install MySQL Server on your system and make sure it's running.

### 1.2 Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE dbsproject;
```

Or use the MySQL command line:

```bash
mysql -u root -p -e "CREATE DATABASE dbsproject;"
```

### 1.3 Set Up Database Schema

Navigate to the database directory and run the SQL scripts in order:

```bash
cd database
```

**Option A: Using MySQL Command Line**

```bash
mysql -u root -p dbsproject < schema.sql
mysql -u root -p dbsproject < views.sql
mysql -u root -p dbsproject < procedures_triggers.sql
```

**Option B: Using MySQL Workbench**

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Select the `dbsproject` database
4. Open and execute each file in this order:
   - `schema.sql`
   - `views.sql`
   - `procedures_triggers.sql`

### 1.4 Verify Database Setup

Verify that all tables, views, and procedures were created:

```sql
USE dbsproject;
SHOW TABLES;
SHOW PROCEDURE STATUS WHERE Db = 'dbsproject';
```

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Create Virtual Environment (Recommended)

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2.3 Install Python Dependencies

Install the required Python packages:

```bash
pip install flask flask-cors mysql-connector-python
```

Or create a `requirements.txt` file with:

```
Flask==2.3.0
flask-cors==4.0.0
mysql-connector-python==8.2.0
```

Then install:

```bash
pip install -r requirements.txt
```

### 2.4 Configure Database Connection

Edit `backend/config.py` and update the database credentials if needed:

```python
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_NAME = os.environ.get('DB_NAME', 'dbsproject')
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '1234')  # Change this to your MySQL password
```

**Or set environment variables:**

**Windows (Command Prompt):**

```cmd
set DB_HOST=localhost
set DB_NAME=dbsproject
set DB_USER=root
set DB_PASSWORD=your_password
```

**Windows (PowerShell):**

```powershell
$env:DB_HOST="localhost"
$env:DB_NAME="dbsproject"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
```

**Linux/Mac:**

```bash
export DB_HOST=localhost
export DB_NAME=dbsproject
export DB_USER=root
export DB_PASSWORD=your_password
```

### 2.5 Run the Backend Server

```bash
python app.py
```

The backend server will start on `http://localhost:5000`

You should see output like:

```
 * Running on http://0.0.0.0:5000
```

**Keep this terminal window open** - the backend server needs to keep running.

## Step 3: Frontend Setup

### 3.1 Open a New Terminal Window

Keep the backend server running and open a new terminal.

### 3.2 Navigate to Frontend Directory

```bash
cd football-frontend
```

### 3.3 Install Node Dependencies

```bash
npm install
```

This will install all required packages including React, React Router, and Vite.

### 3.4 Configure API URL (if needed)

The frontend is configured to connect to `http://localhost:5000` by default.

If your backend runs on a different port, edit `football-frontend/src/config/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

Or set the environment variable:

```bash
export VITE_API_URL=http://localhost:5000
```

### 3.5 Run the Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy).

You should see output like:

```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 4: Access the Application

1. Open your web browser
2. Navigate to `http://localhost:5173` (or the port shown in your terminal)
3. The Football League Management System should now be accessible

## Step 5: Initial Setup (Optional)

### Load Sample Data

If you want to load sample data, navigate to the `database/load_data` directory:

```bash
cd database/load_data
python load_data.py
```

**Note:** Make sure your database connection is configured correctly before running this script.

## Troubleshooting

### Backend Issues

**Problem: Cannot connect to database**

- Verify MySQL is running: `mysql -u root -p`
- Check database credentials in `config.py`
- Ensure database `dbsproject` exists
- Verify user has proper permissions

**Problem: Module not found errors**

- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check Python version: `python --version` (should be 3.8+)

**Problem: Port 5000 already in use**

- Change the port in `app.py`: `app.run(debug=True, host='0.0.0.0', port=5001)`
- Update frontend API URL accordingly

### Frontend Issues

**Problem: Cannot connect to backend API**

- Verify backend is running on `http://localhost:5000`
- Check `src/config/api.js` for correct API URL
- Check browser console for CORS errors
- Ensure backend CORS is enabled in `app.py`

**Problem: npm install fails**

- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Check Node.js version: `node --version` (should be 16+)

**Problem: Port 5173 already in use**

- Vite will automatically use the next available port
- Or specify a port: `npm run dev -- --port 3000`

### Database Issues

**Problem: Tables not found**

- Verify all SQL scripts were executed successfully
- Check database name matches `config.py`
- Run `SHOW TABLES;` in MySQL to verify tables exist

**Problem: Stored procedures not working**

- Verify `procedures_triggers.sql` was executed
- Check MySQL version (should be 8.0+)
- Run `SHOW PROCEDURE STATUS WHERE Db = 'dbsproject';`

## Development Notes

### Backend API Endpoints

- **Admin API:** `http://localhost:5000/api/admin/*`
- **User API:** `http://localhost:5000/api/*`
- **API Root:** `http://localhost:5000/`

### Environment Variables

You can configure the application using environment variables:

- `DB_HOST` - Database host (default: localhost)
- `DB_NAME` - Database name (default: dbsproject)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password (default: 1234)
- `VITE_API_URL` - Frontend API URL (default: http://localhost:5000)

### Stopping the Servers

- **Backend:** Press `Ctrl+C` in the backend terminal
- **Frontend:** Press `Ctrl+C` in the frontend terminal

## Production Deployment

For production deployment:

1. **Backend:**

   - Set `debug=False` in `app.py`
   - Use a production WSGI server like Gunicorn
   - Configure proper CORS settings
   - Use environment variables for sensitive data

2. **Frontend:**

   - Build the production bundle: `npm run build`
   - Serve the `dist` folder using a web server (nginx, Apache, etc.)
   - Configure API URL for production backend

3. **Database:**
   - Use a production MySQL server
   - Configure proper backups
   - Set up connection pooling appropriately

## Support

If you encounter any issues not covered in this guide, please check:

1. Backend logs in the terminal
2. Browser console for frontend errors
3. MySQL error logs
4. Network connectivity between frontend and backend

## License

This project is for educational purposes.
