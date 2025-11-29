-- =========================
-- AUDIT LOG (ensure present)
-- =========================
DROP TABLE IF EXISTS user_audit_log;
CREATE TABLE user_audit_log (
  log_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  changed_by VARCHAR(100),
  old_admin_status TINYINT(1),
  new_admin_status TINYINT(1),
  change_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user_audit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- VIEWS (optimized for dashboard)
-- =========================
DROP TABLE IF EXISTS db_users;

DROP VIEW IF EXISTS v_team_profiles;
CREATE VIEW v_team_profiles AS
SELECT 
  t.team_id,
  t.name AS team_name,
  t.founded_year,
  t.cresturl,
  l.league_id,
  l.name AS league_name,
  l.country AS league_country,
  s.stadium_id,
  s.name AS stadium_name,
  s.location AS stadium_location,
  s.capacity AS stadium_capacity,
  c.coach_id,
  c.name AS coach_name,
  c.nationality AS coach_nationality
FROM teams t
LEFT JOIN leagues l ON t.league_id = l.league_id
LEFT JOIN stadiums s ON t.stadium_id = s.stadium_id
LEFT JOIN coaches c ON t.coach_id = c.coach_id;

DROP VIEW IF EXISTS v_player_profiles;
CREATE VIEW v_player_profiles AS
SELECT 
  p.player_id,
  p.name AS player_name,
  p.`position`,
  p.date_of_birth,
  TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) AS age,
  p.nationality,
  p.team_id,
  t.name AS team_name,
  COALESCE(l.league_id, NULL) AS league_id,
  l.name AS league_name
FROM players p
LEFT JOIN teams t ON p.team_id = t.team_id
LEFT JOIN leagues l ON t.league_id = l.league_id;

DROP VIEW IF EXISTS v_current_standings;
CREATE VIEW v_current_standings AS
SELECT 
  st.standing_id,
  st.season_id,
  st.league_id,
  st.`position`,
  st.team_id,
  t.name AS team_name,
  t.cresturl,
  se.`year` AS season_year,
  st.played_games,
  st.won,
  st.draw,
  st.lost,
  st.points,
  st.goals_for,
  st.goals_against,
  st.goal_difference,
  st.form
FROM standings st
JOIN teams t ON st.team_id = t.team_id
JOIN seasons se ON st.season_id = se.season_id
ORDER BY st.league_id, st.`position`;

DROP VIEW IF EXISTS v_match_details;
CREATE VIEW v_match_details AS
SELECT 
  m.match_id,
  m.matchday,
  m.utc_date,
  m.season_id,
  m.league_id,
  l.name AS league_name,
  se.`year` AS season_year,
  m.home_team_id,
  ht.name AS home_team,
  ht.cresturl AS home_crest,
  m.away_team_id,
  at.name AS away_team,
  at.cresturl AS away_crest,
  sc.full_time_home,
  sc.full_time_away,
  sc.half_time_home,
  sc.half_time_away,
  m.winner,
  CASE 
    WHEN m.utc_date > CURDATE() THEN 'UPCOMING'
    WHEN m.utc_date = CURDATE() THEN 'TODAY'
    ELSE 'COMPLETED'
  END AS match_status
FROM matches m
LEFT JOIN scores sc ON m.match_id = sc.match_id
LEFT JOIN teams ht ON m.home_team_id = ht.team_id
LEFT JOIN teams at ON m.away_team_id = at.team_id
LEFT JOIN leagues l ON m.league_id = l.league_id
LEFT JOIN seasons se ON m.season_id = se.season_id;

DROP VIEW IF EXISTS v_top_scorers;
CREATE VIEW v_top_scorers AS
SELECT 
  sc.scorer_id,
  sc.player_id,
  p.name AS player_name,
  p.team_id,
  t.name AS team_name,
  sc.league_id,
  l.name AS league_name,
  sc.season_id,
  se.`year` AS season_year,
  sc.goals,
  sc.assists,
  sc.penalties,
  (sc.goals - IFNULL(sc.penalties, 0)) AS non_penalty_goals
FROM scorers sc
LEFT JOIN players p ON sc.player_id = p.player_id
LEFT JOIN teams t ON p.team_id = t.team_id
LEFT JOIN leagues l ON sc.league_id = l.league_id
LEFT JOIN seasons se ON sc.season_id = se.season_id
ORDER BY sc.goals DESC, sc.assists DESC;

DROP VIEW IF EXISTS v_upcoming_matches;
CREATE VIEW v_upcoming_matches AS
SELECT * FROM v_match_details
WHERE match_status IN ('UPCOMING','TODAY')
ORDER BY utc_date;

DROP VIEW IF EXISTS v_past_matches;
CREATE VIEW v_past_matches AS
SELECT * FROM v_match_details
WHERE match_status = 'COMPLETED'
ORDER BY utc_date DESC;

DROP VIEW IF EXISTS v_team_history;
CREATE VIEW v_team_history AS
SELECT 
  st.team_id,
  t.name AS team_name,
  st.season_id,
  se.`year` AS season_year,
  st.`position` AS final_position,
  st.played_games,
  st.won,
  st.draw,
  st.lost,
  st.points,
  st.goals_for,
  st.goals_against,
  st.goal_difference
FROM standings st
JOIN teams t ON st.team_id = t.team_id
JOIN seasons se ON st.season_id = se.season_id
ORDER BY st.team_id, se.`year` DESC;



