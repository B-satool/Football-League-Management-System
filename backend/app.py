from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
import mysql.connector
from mysql.connector import pooling

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Database connection pool
db_pool = pooling.MySQLConnectionPool(
    pool_name="football_pool",
    pool_size=5,
    pool_reset_session=True,
    host=app.config['DB_HOST'],
    database=app.config['DB_NAME'],
    user=app.config['DB_USER'],
    password=app.config['DB_PASSWORD']
)

def get_db_connection():
    """Get a connection from the pool"""
    return db_pool.get_connection()

# Import routes
from admin_routes import admin_bp
from user_routes import user_bp

# Register blueprints
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(user_bp, url_prefix='/api')

@app.route('/')
def index():
    return jsonify({
        'message': 'Football League Management System API',
        'version': '1.0',
        'endpoints': {
            'admin': '/api/admin',
            'user': '/api'
        }
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)