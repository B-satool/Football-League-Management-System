from flask import Blueprint, request, jsonify
from functools import wraps
import mysql.connector

admin_bp = Blueprint('admin', __name__)

def get_db_connection():
    """Import from main app"""
    from app import get_db_connection as get_conn
    return get_conn()

def admin_required(f):
    """Decorator to check if user is admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # In production, implement proper JWT token validation
        # For now, we'll check a header
        user_id = request.headers.get('X-User-Id')
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT is_admin FROM users WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()
            if not user or not user['is_admin']:
                return jsonify({'error': 'Admin access required'}), 403
        finally:
            cursor.close()
            conn.close()
        
        return f(*args, **kwargs)
    return decorated_function

# ============= USER MANAGEMENT =============

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """Get all users"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT user_id, username, email, is_admin, created_at 
            FROM users 
            ORDER BY created_at DESC
        """)
        users = cursor.fetchall()
        return jsonify({'users': users}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/users/<int:user_id>/privilege', methods=['PUT'])
@admin_required
def update_user_privilege(user_id):
    """Update user admin privilege"""
    data = request.get_json()
    is_admin = data.get('is_admin')
    
    if is_admin is None:
        return jsonify({'error': 'is_admin field required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_update_user_privilege', (user_id, int(is_admin)))
        conn.commit()
        return jsonify({'message': 'User privilege updated successfully'}), 200
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/users/audit-log', methods=['GET'])
@admin_required
def get_audit_log():
    """Get user privilege change audit log"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                l.log_id, l.user_id, u.username, l.changed_by,
                l.old_admin_status, l.new_admin_status, l.change_date
            FROM user_audit_log l
            LEFT JOIN users u ON l.user_id = u.user_id
            ORDER BY l.change_date DESC
            LIMIT 100
        """)
        logs = cursor.fetchall()
        return jsonify({'audit_logs': logs}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============= TEAM MANAGEMENT =============

@admin_bp.route('/teams', methods=['POST'])
@admin_required
def add_team():
    """Add a new team"""
    data = request.get_json()
    
    required_fields = ['name', 'league_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_add_team', (
            data['name'],
            data.get('founded_year'),
            data.get('stadium_id'),
            data['league_id'],
            data.get('coach_id'),
            data.get('cresturl')
        ))
        
        # Get the result
        for result in cursor.stored_results():
            team_id = result.fetchone()[0]
        
        conn.commit()
        return jsonify({'message': 'Team added successfully', 'team_id': team_id}), 201
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/teams/<int:team_id>', methods=['PUT'])
@admin_required
def update_team(team_id):
    """Update an existing team"""
    data = request.get_json()
    
    required_fields = ['name', 'league_id']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_update_team', (
            team_id,
            data['name'],
            data.get('founded_year'),
            data.get('stadium_id'),
            data['league_id'],
            data.get('coach_id'),
            data.get('cresturl')
        ))
        conn.commit()
        return jsonify({'message': 'Team updated successfully'}), 200
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/teams/<int:team_id>', methods=['DELETE'])
@admin_required
def delete_team(team_id):
    """Delete a team"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_delete_team', (team_id,))
        conn.commit()
        return jsonify({'message': 'Team deleted successfully'}), 200
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ============= PLAYER MANAGEMENT =============

@admin_bp.route('/players', methods=['POST'])
@admin_required
def add_player():
    """Add a new player"""
    data = request.get_json()
    
    required_fields = ['name', 'team_id', 'position']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_add_player', (
            data['name'],
            data['team_id'],
            data['position'],
            data.get('date_of_birth'),
            data.get('nationality')
        ))
        
        # Get the result
        for result in cursor.stored_results():
            player_id = result.fetchone()[0]
        
        conn.commit()
        return jsonify({'message': 'Player added successfully', 'player_id': player_id}), 201
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/players/<int:player_id>', methods=['PUT'])
@admin_required
def update_player(player_id):
    """Update an existing player"""
    data = request.get_json()
    
    required_fields = ['name', 'team_id', 'position']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_update_player', (
            player_id,
            data['name'],
            data['team_id'],
            data['position'],
            data.get('date_of_birth'),
            data.get('nationality')
        ))
        conn.commit()
        return jsonify({'message': 'Player updated successfully'}), 200
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/players/<int:player_id>', methods=['DELETE'])
@admin_required
def delete_player(player_id):
    """Delete a player"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_delete_player', (player_id,))
        conn.commit()
        return jsonify({'message': 'Player deleted successfully'}), 200
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ============= MATCH MANAGEMENT =============

@admin_bp.route('/matches', methods=['POST'])
@admin_required
def schedule_match():
    """Schedule a new match"""
    data = request.get_json()
    
    required_fields = ['season_id', 'league_id', 'matchday', 'home_team_id', 'away_team_id', 'utc_date']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_schedule_match', (
            data['season_id'],
            data['league_id'],
            data['matchday'],
            data['home_team_id'],
            data['away_team_id'],
            data['utc_date']
        ))
        
        # Get the result
        for result in cursor.stored_results():
            match_id = result.fetchone()[0]
        
        conn.commit()
        return jsonify({'message': 'Match scheduled successfully', 'match_id': match_id}), 201
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/matches/<int:match_id>', methods=['PUT'])
@admin_required
def update_match(match_id):
    """Update an existing match"""
    data = request.get_json()
    
    required_fields = ['season_id', 'league_id', 'matchday', 'home_team_id', 'away_team_id', 'utc_date']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_update_match', (
            match_id,
            data['season_id'],
            data['league_id'],
            data['matchday'],
            data['home_team_id'],
            data['away_team_id'],
            data['utc_date']
        ))
        conn.commit()
        return jsonify({'message': 'Match updated successfully'}), 200
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/matches/<int:match_id>', methods=['DELETE'])
@admin_required
def delete_match(match_id):
    """Delete a match"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_delete_match', (match_id,))
        conn.commit()
        return jsonify({'message': 'Match deleted successfully'}), 200
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/matches/<int:match_id>/score', methods=['PUT'])
@admin_required
def update_match_score(match_id):
    """Update match score (triggers will update standings)"""
    data = request.get_json()
    
    required_fields = ['full_time_home', 'full_time_away']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_update_match_score', (
            match_id,
            data['full_time_home'],
            data['full_time_away'],
            data.get('half_time_home', 0),
            data.get('half_time_away', 0)
        ))
        conn.commit()
        return jsonify({'message': 'Match score updated successfully'}), 200
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ============= UTILITY ENDPOINTS =============

@admin_bp.route('/standings/recompute', methods=['POST'])
@admin_required
def recompute_standings():
    """Recompute standings for a league and season"""
    data = request.get_json()
    
    if 'league_id' not in data or 'season_id' not in data:
        return jsonify({'error': 'league_id and season_id required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.callproc('sp_recompute_standings', (data['league_id'], data['season_id']))
        conn.commit()
        return jsonify({'message': 'Standings recomputed successfully'}), 200
    except mysql.connector.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/leagues', methods=['GET'])
@admin_required
def get_all_leagues():
    """Get all leagues for admin management"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM leagues ORDER BY name")
        leagues = cursor.fetchall()
        return jsonify({'leagues': leagues}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/seasons', methods=['GET'])
@admin_required
def get_all_seasons():
    """Get all seasons for admin management"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM seasons ORDER BY year DESC")
        seasons = cursor.fetchall()
        return jsonify({'seasons': seasons}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/stadiums', methods=['GET'])
@admin_required
def get_all_stadiums():
    """Get all stadiums"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM stadiums ORDER BY name")
        stadiums = cursor.fetchall()
        return jsonify({'stadiums': stadiums}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/coaches', methods=['GET'])
@admin_required
def get_all_coaches():
    """Get all coaches"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT c.*, t.name as team_name 
            FROM coaches c 
            LEFT JOIN teams t ON c.team_id = t.team_id 
            ORDER BY c.name
        """)
        coaches = cursor.fetchall()
        return jsonify({'coaches': coaches}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()