import mysql.connector
from mysql.connector import Error
import pandas as pd
import json
import ast

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='1234',
        database='dbsproject'
    )
    if conn.is_connected():
        print("Connection to database successful")
        cursor = conn.cursor()
    else:
        print("Connection failed")
        exit()  # stop script if connection is not established

except Error as e:
    print(f"Error while connecting to MySQL: {e}")
    exit()  # stop script

cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")


# LOAD LEAGUES DATA
# leagues_df = pd.read_csv('leagues.csv')
#
# for _, row in leagues_df.iterrows():
#     cursor.execute("""
#        INSERT INTO leagues (league_id, name, country, country_id, icon_url, cl_spot, uel_spot, relegation_spot)
#        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
#    """, (row['league_id'], row['name'], row['country'], row['country_id'], row['icon_url'], row['cl_spot'], row['uel_spot'],  row['relegation_spot']))
# conn.commit()

# LOAD STADIUMS DATA
# stadiums_df = pd.read_csv('stadiums.csv')
# for _, row in stadiums_df.iterrows():
#     capacity = row['capacity']
#     if pd.isna(capacity):
#         capacity = None  # MySQL will insert NULL
#     cursor.execute("""
#         INSERT INTO stadiums (stadium_id, name, location, capacity)
#         VALUES (%s, %s, %s, %s)
#     """, (row['stadium_id'], row['name'], row['location'], capacity))
# conn.commit()

# LOAD COACHES DATA
# coaches_df = pd.read_csv('coaches.csv')

# for _, row in coaches_df.iterrows():
#
#     nationality = None if pd.isna(row['nationality']) else str(
#         row['nationality']).strip()
#
#     # Skip rows with missing or empty names
#     if pd.isna(row['name']) or str(row['name']).strip() == "":
#         print(f"Skipping row due to missing coach name: {row}")
#         continue
#
#     cursor.execute("""
#         INSERT INTO coaches (coach_id, name, team_id, nationality)
#         VALUES (%s, %s, %s, %s)
#     """, (
#         row['coach_id'],
#         row['name'].strip(),
#         row['team_id'],
#         nationality
#     ))
# conn.commit()

# LOAD REFEREES DATA
# referees_df = pd.read_csv('referees.csv')
# for _, row in referees_df.iterrows():
#     nationality = None if pd.isna(row['nationality']) else str(
#         row['nationality']).strip()
#     cursor.execute("""
#         INSERT INTO referees (referee_id, name, nationality)
#         VALUES (%s, %s, %s)
#     """, (row['referee_id'], row['name'], nationality))
# conn.commit()

# LOAD SEASONS DATA
# seasons_df = pd.read_csv('seasons.csv')
# for _, row in seasons_df.iterrows():
#     cursor.execute("""
#         INSERT INTO seasons (season_id, league_id, year)
#         VALUES (%s, %s, %s)
#     """, (row['season_id'], row['league_id'], row['year']))
# conn.commit()

# LOAD TEAMS DATA
# teams_df = pd.read_csv('teams.csv')
# for _, row in teams_df.iterrows():
#
#     founded_year = None if pd.isna(row['founded_year']) else str(
#         row['founded_year']).strip()
#
#     cursor.execute("""
#         INSERT INTO teams (team_id, name, founded_year, stadium_id, league_id, coach_id, cresturl)
#         VALUES (%s, %s, %s, %s, %s, %s, %s)
#     """, (row['team_id'], row['name'], founded_year, row['stadium_id'], row['league_id'], row['coach_id'], row['cresturl']))
# conn.commit()

# LOAD PLAYERS DATA
# players_df = pd.read_csv('players.csv')
# for _, row in players_df.iterrows():
#     cursor.execute("""
#         INSERT INTO players (player_id, team_id, name, position, date_of_birth, nationality)
#         VALUES (%s, %s, %s, %s, %s, %s)
#     """, (row['player_id'], row['team_id'], row['name'], row['position'], row['date_of_birth'], row['nationality']))
# conn.commit()

# LOAD MATCHES DATA
# matches_df = pd.read_csv('matches.csv')
# for _, row in matches_df.iterrows():
#     cursor.execute("""
#         INSERT INTO matches (match_id, season_id, league_id, matchday, home_team_id, away_team_id, winner, `utc_date`)
#         VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
#     """, (row['match_id'], row['season_id'], row['league_id'], row['matchday'], row['home_team_id'], row['away_team_id'], row['winner'], row['utc_date']))
# conn.commit()

# LOAD SCORES DATA
# scores_df = pd.read_csv('scores.csv')
# for _, row in scores_df.iterrows():
#     cursor.execute("""
#         INSERT INTO scores (score_id, match_id, full_time_home, full_time_away, half_time_home, half_time_away)
#         VALUES (%s, %s, %s, %s, %s, %s)
#     """, (int(row['score_id']), int(row['match_id']), int(row['full_time_home']), int(row['full_time_away']), int(row['half_time_home']), int(row['half_time_away'])))
# conn.commit()

# LOAD STANDINGS DATA
# cursor.execute("TRUNCATE TABLE standings;")
# standings_df = pd.read_csv('standings.csv')
# for _, row in standings_df.iterrows():
#     form_str = row['form']
#     if pd.isna(form_str) or form_str == "":
#         form_json = None
#     else:
#         # Convert "['D','W']" → ['D','W']
#         python_list = ast.literal_eval(form_str)
#         form_json = json.dumps(python_list)
#     cursor.execute("""
#         INSERT INTO standings (standing_id, season_id, league_id, position, team_id, played_games, won, draw, lost, points, goals_for, goals_against, goal_difference, form)
#         VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
#     """, (int(row['standing_id']), int(row['season_id']), int(row['league_id']), int(row['position']), int(row['team_id']), int(row['played_games']), int(row['won']), int(row['draw']), int(row['lost']), int(row['points']), int(row['goals_for']), int(row['goals_against']), int(row['goal_difference']), form_json))
# conn.commit()

# LOAD SCORERS DATA
scorers_df = pd.read_csv('scorers.csv')

for _, row in scorers_df.iterrows():
    cursor.execute("""
        INSERT INTO scorers (scorer_id, player_id, season_id, league_id, goals, assists, penalties)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (int(row['scorer_id']), int(row['player_id']), int(row['season_id']), int(row['league_id']), int(row['goals']), int(row['assists']), int(row['penalties'])))
conn.commit()

# LOAD MATCH_REFEREES DATA
match_referees_df = pd.read_csv('match_referees.csv')

for _, row in match_referees_df.iterrows():
    cursor.execute("""
        INSERT INTO match_referees (match_id, referee_id)
        VALUES (%s, %s)
    """, (int(row['match_id']), int(row['referee_id'])))
conn.commit()

# LOAD COUNTRIES DATA
countries_df = pd.read_csv('countries.csv')

for _, row in countries_df.iterrows():
    cursor.execute("""
        INSERT INTO countries (country_id, name, flag_url)
        VALUES (%s, %s, %s)
    """, (row['country_id'], row['name'], row['flag_url']))

conn.commit()

cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

cursor.close()

conn.close()
