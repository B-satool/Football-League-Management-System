import os
from datetime import timedelta

class Config:
    # Database configuration
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_NAME = os.environ.get('DB_NAME', 'dbsproject')
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '1234')
    
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'secret')
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'secret')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # CORS configuration
    CORS_HEADERS = 'Content-Type'