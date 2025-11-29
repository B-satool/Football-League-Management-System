import mysql.connector
from mysql.connector import Error
import pandas as pd

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
#leagues_df = pd.read_csv('leagues.csv')
# Insert rows
#for _, row in leagues_df.iterrows():
#    cursor.execute("""
#        INSERT INTO leagues (league_id, name, country, country_id, icon_url, cl_spot, uel_spot, relegation_spot)
#        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
#    """, (row['league_id'], row['name'], row['country'], row['country_id'], row['icon_url'], row['cl_spot'], row['uel_spot'],  row['relegation_spot']))
#conn.commit()

# LOAD STADIUMS DATA
# stadiums_df = pd.read_csv('stadiums.csv')
# for _, row in stadiums_df.iterrows():
#     cursor.execute("""
#         INSERT INTO stadiums (stadium_id, name, location, capacity)
#         VALUES (%s, %s, %s, %s)
#     """, (row['stadium_id'], row['name'], row['location'], row['capacity']))
# conn.commit()

# LOAD COACHES DATA
# coaches_df = pd.read_csv('coaches.csv')
# for _, row in coaches_df.iterrows():
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
#         row['nationality']
#     ))
# conn.commit()
# LOAD REFEREES DATA
# referees_df = pd.read_csv('referees.csv')
# for _, row in referees_df.iterrows():
#     cursor.execute("""
#         INSERT INTO referees (referee_id, name, nationality)
#         VALUES (%s, %s, %s)
#     """, (row['referee_id'], row['name'], row['nationality']))
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
# Insert rows
# for _, row in teams_df.iterrows():
#     cursor.execute("""
#         INSERT INTO teams (team_id, name, founded_year, stadium_id, league_id, coach_id, cresturl)
#         VALUES (%s, %s, %s, %s, %s, %s, %s)
#     """, (row['team_id'], row['name'], row['founded_year'], row['stadium_id'], row['league_id'], row['coach_id'], row['cresturl']))
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
matches_df = pd.read_csv('matches.csv')
for _, row in matches_df.iterrows():
    cursor.execute("""
        INSERT INTO matches (match_id, season_id, league_id, matchday, home_team_id, away_team_id, winner, utc_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (row['match_id'], row['season_id'], row['league_id'], row['matchday'], row['home_team_id'], row['away_team_id'], row['winner'], row['utc_date']))
conn.commit()

# LOAD SCORES DATA
scores_df = pd.read_csv('scores.csv')
for _, row in scores_df.iterrows():
    cursor.execute("""
        INSERT INTO scores (score_id, match_id, full_time_home, full_time_away, half_time_home, half_time_away)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (int(row['score_id']), int(row['match_id']), int(row['full_time_home']), int(row['full_time_away']), int(row['half_time_home']), int(row['half_time_away'])))
conn.commit()

# LOAD STANDINGS DATA
standings_df = pd.read_csv('standings.csv')
for _, row in standings_df.iterrows():
    cursor.execute("""
        INSERT INTO matches (standing_id, season_id, league_id, position, team_id, played_games, won, draw, lost, points, goals_for, goals_against, goal_difference, form)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (row['standing_id'], row['season_id'], row['league_id'], row['position'], row['team_id'], row['played_games'], row['won'], row['draw'], row['lost'], row['points'], row['goals_for'], row['goals_against'], row['goal_difference'], row['form']))
conn.commit()

cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

cursor.close()

conn.close()
