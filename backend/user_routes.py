from flask import Blueprint, request, jsonify
import mysql.connector
#from flask_cors import CORS

user_bp = Blueprint('user', __name__)
#CORS(user_bp, supports_credentials=True)


def get_db_connection():
    """Import from main app"""
    from app import get_db_connection as get_conn
    return get_conn()

# ============= TEAMS =============

@user_bp.route('/teams', methods=['GET'])
def get_teams():
    """Get all teams with profiles"""
    league_id = request.args.get('league_id', type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM v_team_profiles"
        params = []
        
        if league_id:
            query += " WHERE league_id = %s"
            params.append(league_id)
        
        query += " ORDER BY team_name"
        cursor.execute(query, params)
        teams = cursor.fetchall()
        return jsonify({'teams': teams, 'count': len(teams)}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@user_bp.route('/teams/<int:team_id>', methods=['GET'])
def get_team_detail(team_id):
    """Get detailed team profile"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get team profile
        cursor.execute("SELECT * FROM v_team_profiles WHERE team_id = %s", (team_id,))
        team = cursor.fetchone()
        
        if not team:
            return jsonify({'error': 'Team not found'}), 404
        
        # Get team players
        cursor.execute("SELECT * FROM v_player_profiles WHERE team_id = %s ORDER BY position, player_name", (team_id,))
        players = cursor.fetchall()
        
        # Get team history
        cursor.execute("SELECT * FROM v_team_history WHERE team_id = %s ORDER BY season_year DESC LIMIT 10", (team_id,))
        history = cursor.fetchall()
        
        return jsonify({
            'team': team,
            'players': players,
            'history': history
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============= PLAYERS =============

@user_bp.route('/players', methods=['GET'])
def get_players():
    """Get all players with profiles"""
    team_id = request.args.get('team_id', type=int)
    league_id = request.args.get('league_id', type=int)
    position = request.args.get('position')
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM v_player_profiles WHERE 1=1"
        params = []
        
        if team_id:
            query += " AND team_id = %s"
            params.append(team_id)
        
        if league_id:
            query += " AND league_id = %s"
            params.append(league_id)
        
        if position:
            query += " AND position = %s"
            params.append(position)
        
        query += " ORDER BY player_name"
        cursor.execute(query, params)
        players = cursor.fetchall()
        return jsonify({'players': players, 'count': len(players)}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@user_bp.route('/players/<int:player_id>', methods=['GET'])
def get_player_detail(player_id):
    """Get detailed player profile with statistics"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get player profile
        cursor.execute("SELECT * FROM v_player_profiles WHERE player_id = %s", (player_id,))
        player = cursor.fetchone()
        
        if not player:
            return jsonify({'error': 'Player not found'}), 404
        
        # Get player scoring statistics
        cursor.execute("""
            SELECT * FROM v_top_scorers 
            WHERE player_id = %s 
            ORDER BY season_year DESC
        """, (player_id,))
        stats = cursor.fetchall()
        
        return jsonify({
            'player': player,
            'statistics': stats
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============= LEAGUES =============

@user_bp.route('/leagues', methods=['GET'])
def get_leagues():
    """Get all leagues"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM leagues ORDER BY name")
        leagues = cursor.fetchall()
        return jsonify({'leagues': leagues, 'count': len(leagues)}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@user_bp.route('/leagues/<int:league_id>', methods=['GET'])
def get_league_detail(league_id):
    """Get league details with current standings"""
    season_id = request.args.get('season_id', type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get league info
        cursor.execute("SELECT * FROM leagues WHERE league_id = %s", (league_id,))
        league = cursor.fetchone()
        
        if not league:
            return jsonify({'error': 'League not found'}), 404
        
        # Get current or specified season
        if not season_id:
            cursor.execute("""
                SELECT season_id FROM seasons 
                ORDER BY year DESC LIMIT 1
            """)
            season = cursor.fetchone()
            season_id = season['season_id'] if season else None
        
        # Get standings
        standings = []
        if season_id:
            cursor.execute("""
                SELECT * FROM v_current_standings 
                WHERE league_id = %s AND season_id = %s 
                ORDER BY position
            """, (league_id, season_id))
            standings = cursor.fetchall()
        
        # Get teams in league
        cursor.execute("""
            SELECT team_id, name, cresturl 
            FROM teams 
            WHERE league_id = %s 
            ORDER BY name
        """, (league_id,))
        teams = cursor.fetchall()
        
        return jsonify({
            'league': league,
            'standings': standings,
            'teams': teams,
            'season_id': season_id
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============= STANDINGS =============

@user_bp.route('/standings', methods=['GET'])
def get_standings():
    """Get standings for a specific league and season"""
    league_id = request.args.get('league_id', type=int)
    season_id = request.args.get('season_id', type=int)
    
    if not league_id:
        return jsonify({'error': 'league_id is required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # If no season specified, get latest season
        if not season_id:
            cursor.execute("SELECT season_id FROM seasons ORDER BY year DESC LIMIT 1")
            season = cursor.fetchone()
            season_id = season['season_id'] if season else None
        
        if not season_id:
            return jsonify({'error': 'No seasons found'}), 404
        
        cursor.execute("""
            SELECT * FROM v_current_standings 
            WHERE league_id = %s AND season_id = %s 
            ORDER BY position
        """, (league_id, season_id))
        standings = cursor.fetchall()
        
        return jsonify({
            'standings': standings,
            'league_id': league_id,
            'season_id': season_id,
            'count': len(standings)
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============= MATCHES =============

@user_bp.route('/matches', methods=['GET'])
def get_matches():
    """Get matches with filtering options"""
    status = request.args.get('status', 'all')  # all, upcoming, past, today
    league_id = request.args.get('league_id', type=int)
    team_id = request.args.get('team_id', type=int)
    season_id = request.args.get('season_id', type=int)
    matchday = request.args.get('matchday', type=int)
    limit = request.args.get('limit', 50, type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Select appropriate view based on status
        if status == 'upcoming':
            base_query = "SELECT * FROM v_upcoming_matches WHERE 1=1"
        elif status == 'past':
            base_query = "SELECT * FROM v_past_matches WHERE 1=1"
        else:
            base_query = "SELECT * FROM v_match_details WHERE 1=1"
        
        params = []
        
        if league_id:
            base_query += " AND league_id = %s"
            params.append(league_id)
        
        if season_id:
            base_query += " AND season_id = %s"
            params.append(season_id)
        
        if team_id:
            base_query += " AND (home_team_id = %s OR away_team_id = %s)"
            params.extend([team_id, team_id])
        
        if matchday:
            base_query += " AND matchday = %s"
            params.append(matchday)
        
        if status == 'today':
            base_query += " AND match_status = 'TODAY'"
        
        # Add ordering and limit
        if status == 'upcoming':
            base_query += " ORDER BY utc_date ASC"
        else:
            base_query += " ORDER BY utc_date DESC"
        
        base_query += f" LIMIT {limit}"
        
        cursor.execute(base_query, params)
        matches = cursor.fetchall()
        
        return jsonify({
            'matches': matches,
            'count': len(matches),
            'status': status
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@user_bp.route('/matches/<int:match_id>', methods=['GET'])
def get_match_detail(match_id):
    """Get detailed match information"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM v_match_details WHERE match_id = %s", (match_id,))
        match = cursor.fetchone()
        
        if not match:
            return jsonify({'error': 'Match not found'}), 404
        
        return jsonify({'match': match}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============= TOP SCORERS =============

@user_bp.route('/top-scorers', methods=['GET'])
def get_top_scorers():
    """Get top scorers with filtering"""
    league_id = request.args.get('league_id', type=int)
    season_id = request.args.get('season_id', type=int)
    limit = request.args.get('limit', 20, type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM v_top_scorers WHERE 1=1"
        params = []
        
        if league_id:
            query += " AND league_id = %s"
            params.append(league_id)
        
        if season_id:
            query += " AND season_id = %s"
            params.append(season_id)
        
        query += " ORDER BY goals DESC, assists DESC, player_name"
        query += f" LIMIT {limit}"
        
        cursor.execute(query, params)
        scorers = cursor.fetchall()
        
        return jsonify({
            'top_scorers': scorers,
            'count': len(scorers)
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============= SEARCH FUNCTIONALITY =============

@user_bp.route('/search/players', methods=['GET'])
def search_players():
    """Search players by name"""
    search_term = request.args.get('q', '')
    
    if not search_term:
        return jsonify({'error': 'Search term required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc('sp_search_players', (search_term,))
        
        results = []
        for result in cursor.stored_results():
            results = result.fetchall()
        
        return jsonify({
            'results': results,
            'count': len(results),
            'search_term': search_term
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@user_bp.route('/search/teams', methods=['GET'])
def search_teams():
    """Search teams by name"""
    search_term = request.args.get('q', '')
    
    if not search_term:
        return jsonify({'error': 'Search term required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc('sp_search_teams', (search_term,))
        
        results = []
        for result in cursor.stored_results():
            results = result.fetchall()
        
        return jsonify({
            'results': results,
            'count': len(results),
            'search_term': search_term
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@user_bp.route('/search/stadiums', methods=['GET'])
def search_stadiums():
    """Search stadiums by name"""
    search_term = request.args.get('q', '')
    
    if not search_term:
        return jsonify({'error': 'Search term required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc('sp_search_stadiums', (search_term,))
        
        results = []
        for result in cursor.stored_results():
            results = result.fetchall()
        
        return jsonify({
            'results': results,
            'count': len(results),
            'search_term': search_term
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@user_bp.route('/search/coaches', methods=['GET'])
def search_coaches():
    """Search coaches by name"""
    search_term = request.args.get('q', '')
    
    if not search_term:
        return jsonify({'error': 'Search term required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc('sp_search_coaches', (search_term,))
        
        results = []
        for result in cursor.stored_results():
            results = result.fetchall()
        
        return jsonify({
            'results': results,
            'count': len(results),
            'search_term': search_term
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@user_bp.route('/search', methods=['GET'])
def global_search():
    """Global search across all entities"""
    search_term = request.args.get('q', '')
    
    if not search_term:
        return jsonify({'error': 'Search term required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        results = {
            'players': [],
            'teams': [],
            'stadiums': [],
            'coaches': []
        }
        
        # Search players
        cursor.callproc('sp_search_players', (search_term,))
        for result in cursor.stored_results():
            results['players'] = result.fetchall()
        
        # Search teams
        cursor.callproc('sp_search_teams', (search_term,))
        for result in cursor.stored_results():
            results['teams'] = result.fetchall()
        
        # Search stadiums
        cursor.callproc('sp_search_stadiums', (search_term,))
        for result in cursor.stored_results():
            results['stadiums'] = result.fetchall()
        
        # Search coaches
        cursor.callproc('sp_search_coaches', (search_term,))
        for result in cursor.stored_results():
            results['coaches'] = result.fetchall()
        
        total_count = sum(len(v) for v in results.values())
        
        return jsonify({
            'results': results,
            'total_count': total_count,
            'search_term': search_term
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============= SEASONS =============

@user_bp.route('/seasons', methods=['GET'])
def get_seasons():
    """Get all seasons"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM seasons ORDER BY year DESC")
        seasons = cursor.fetchall()
        return jsonify({'seasons': seasons, 'count': len(seasons)}), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ============= STATISTICS =============

@user_bp.route('/statistics/team/<int:team_id>', methods=['GET'])
def get_team_statistics(team_id):
    """Get comprehensive team statistics"""
    season_id = request.args.get('season_id', type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get team info
        cursor.execute("SELECT * FROM v_team_profiles WHERE team_id = %s", (team_id,))
        team = cursor.fetchone()
        
        if not team:
            return jsonify({'error': 'Team not found'}), 404
        
        # Get current season if not specified
        if not season_id:
            cursor.execute("SELECT season_id FROM seasons ORDER BY year DESC LIMIT 1")
            season = cursor.fetchone()
            season_id = season['season_id'] if season else None
        
        stats = {}
        
        if season_id:
            # Get standing
            cursor.execute("""
                SELECT * FROM v_current_standings 
                WHERE team_id = %s AND season_id = %s
            """, (team_id, season_id))
            stats['standing'] = cursor.fetchone()
            
            # Get recent matches
            cursor.execute("""
                SELECT * FROM v_match_details 
                WHERE (home_team_id = %s OR away_team_id = %s) 
                  AND season_id = %s 
                  AND match_status = 'COMPLETED'
                ORDER BY utc_date DESC 
                LIMIT 5
            """, (team_id, team_id, season_id))
            stats['recent_matches'] = cursor.fetchall()
            
            # Get top scorers from team
            cursor.execute("""
                SELECT * FROM v_top_scorers 
                WHERE team_id = %s AND season_id = %s 
                ORDER BY goals DESC 
                LIMIT 5
            """, (team_id, season_id))
            stats['top_scorers'] = cursor.fetchall()
        
        return jsonify({
            'team': team,
            'statistics': stats,
            'season_id': season_id
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@user_bp.route('/statistics/league/<int:league_id>', methods=['GET'])
def get_league_statistics(league_id):
    """Get comprehensive league statistics"""
    season_id = request.args.get('season_id', type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get current season if not specified
        if not season_id:
            cursor.execute("SELECT season_id FROM seasons ORDER BY year DESC LIMIT 1")
            season = cursor.fetchone()
            season_id = season['season_id'] if season else None
        
        stats = {}
        
        if season_id:
            # Total goals
            cursor.execute("""
                SELECT SUM(full_time_home + full_time_away) as total_goals
                FROM scores sc
                JOIN matches m ON sc.match_id = m.match_id
                WHERE m.league_id = %s AND m.season_id = %s
            """, (league_id, season_id))
            stats['total_goals'] = cursor.fetchone()
            
            # Total matches
            cursor.execute("""
                SELECT COUNT(*) as total_matches
                FROM matches m
                JOIN scores sc ON m.match_id = sc.match_id
                WHERE m.league_id = %s AND m.season_id = %s
            """, (league_id, season_id))
            stats['total_matches'] = cursor.fetchone()
            
            # Top scoring team
            cursor.execute("""
                SELECT team_id, team_name, goals_for
                FROM v_current_standings
                WHERE league_id = %s AND season_id = %s
                ORDER BY goals_for DESC
                LIMIT 1
            """, (league_id, season_id))
            stats['top_scoring_team'] = cursor.fetchone()
            
            # Best defense
            cursor.execute("""
                SELECT team_id, team_name, goals_against
                FROM v_current_standings
                WHERE league_id = %s AND season_id = %s
                ORDER BY goals_against ASC
                LIMIT 1
            """, (league_id, season_id))
            stats['best_defense'] = cursor.fetchone()
        
        return jsonify({
            'league_id': league_id,
            'season_id': season_id,
            'statistics': stats
        }), 200
    except mysql.connector.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()