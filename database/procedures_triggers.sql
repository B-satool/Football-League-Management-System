-- =========================
-- TRIGGERS
-- =========================

-- Validate match (BEFORE INSERT)
DROP TRIGGER IF EXISTS trg_validate_match;
DELIMITER $$
CREATE TRIGGER trg_validate_match
BEFORE INSERT ON matches
FOR EACH ROW
BEGIN
  DECLARE h_league INT; DECLARE a_league INT;
  IF NEW.home_team_id IS NULL OR NEW.away_team_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Home and away teams required';
  END IF;
  IF NEW.home_team_id = NEW.away_team_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Home and away teams must be different';
  END IF;
  SELECT league_id INTO h_league FROM teams WHERE team_id = NEW.home_team_id;
  SELECT league_id INTO a_league FROM teams WHERE team_id = NEW.away_team_id;
  IF h_league IS NULL OR a_league IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Team(s) not found';
  END IF;
  IF h_league <> a_league OR h_league <> NEW.league_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Teams must belong to the same league as match';
  END IF;
END$$
DELIMITER ;

-- Validate match (BEFORE UPDATE)
DROP TRIGGER IF EXISTS trg_validate_match_update;
DELIMITER $$
CREATE TRIGGER trg_validate_match_update
BEFORE UPDATE ON matches
FOR EACH ROW
BEGIN
  DECLARE h_league INT; DECLARE a_league INT;
  IF NEW.home_team_id = NEW.away_team_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Home and away teams must be different';
  END IF;
  SELECT league_id INTO h_league FROM teams WHERE team_id = NEW.home_team_id;
  SELECT league_id INTO a_league FROM teams WHERE team_id = NEW.away_team_id;
  IF h_league IS NULL OR a_league IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Team(s) not found';
  END IF;
  IF h_league <> a_league OR h_league <> NEW.league_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Teams must belong to the same league as match';
  END IF;
END$$
DELIMITER ;

-- Prevent deleting team with players
DROP TRIGGER IF EXISTS trg_prevent_team_delete;
DELIMITER $$
CREATE TRIGGER trg_prevent_team_delete
BEFORE DELETE ON teams
FOR EACH ROW
BEGIN
  IF (SELECT COUNT(*) FROM players WHERE team_id = OLD.team_id) > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete team with active players';
  END IF;
END$$
DELIMITER ;

-- Audit user admin changes
DROP TRIGGER IF EXISTS trg_audit_user_changes;
DELIMITER $$
CREATE TRIGGER trg_audit_user_changes
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  IF NEW.is_admin <> OLD.is_admin THEN
    INSERT INTO user_audit_log (user_id, changed_by, old_admin_status, new_admin_status)
    VALUES (NEW.user_id, COALESCE(NULLIF(USER(),''), 'app'), OLD.is_admin, NEW.is_admin);
  END IF;
END$$
DELIMITER ;

-- Update winner & standings AFTER INSERT on scores (keep form last 5)
DROP TRIGGER IF EXISTS trg_after_score_insert;
DELIMITER $$
CREATE TRIGGER trg_after_score_insert
AFTER INSERT ON scores
FOR EACH ROW
BEGIN
  DECLARE v_season INT; DECLARE v_league INT; DECLARE v_home INT; DECLARE v_away INT; DECLARE v_w VARCHAR(10);
  SELECT season_id, league_id, home_team_id, away_team_id INTO v_season, v_league, v_home, v_away
    FROM matches WHERE match_id = NEW.match_id;

  IF NEW.full_time_home > NEW.full_time_away THEN SET v_w = 'HOME_TEAM';
  ELSEIF NEW.full_time_home < NEW.full_time_away THEN SET v_w = 'AWAY_TEAM';
  ELSE SET v_w = 'DRAW';
  END IF;

  UPDATE matches SET winner = v_w WHERE match_id = NEW.match_id;

  -- ensure standings rows
  IF (SELECT COUNT(*) FROM standings WHERE season_id = v_season AND league_id = v_league AND team_id = v_home) = 0 THEN
    INSERT INTO standings (season_id, league_id, `position`, team_id, played_games, won, draw, lost, points, goals_for, goals_against, goal_difference, form)
    VALUES (v_season, v_league, 0, v_home, 0,0,0,0,0,0,0,0, JSON_ARRAY());
  END IF;
  IF (SELECT COUNT(*) FROM standings WHERE season_id = v_season AND league_id = v_league AND team_id = v_away) = 0 THEN
    INSERT INTO standings (season_id, league_id, `position`, team_id, played_games, won, draw, lost, points, goals_for, goals_against, goal_difference, form)
    VALUES (v_season, v_league, 0, v_away, 0,0,0,0,0,0,0,0, JSON_ARRAY());
  END IF;

  -- home update
  UPDATE standings
  SET played_games = played_games + 1,
      goals_for = goals_for + NEW.full_time_home,
      goals_against = goals_against + NEW.full_time_away,
      goal_difference = goal_difference + (NEW.full_time_home - NEW.full_time_away),
      won = won + (CASE WHEN v_w = 'HOME_TEAM' THEN 1 ELSE 0 END),
      draw = draw + (CASE WHEN v_w = 'DRAW' THEN 1 ELSE 0 END),
      lost = lost + (CASE WHEN v_w = 'AWAY_TEAM' THEN 1 ELSE 0 END),
      points = points + (CASE WHEN v_w = 'HOME_TEAM' THEN 3 WHEN v_w = 'DRAW' THEN 1 ELSE 0 END),
      form = JSON_ARRAY_APPEND(IFNULL(form, JSON_ARRAY()), '$', CASE WHEN v_w='HOME_TEAM' THEN 'W' WHEN v_w='DRAW' THEN 'D' ELSE 'L' END)
  WHERE season_id = v_season AND league_id = v_league AND team_id = v_home;

  -- trim form to last 5
  UPDATE standings
  SET form = CASE WHEN JSON_LENGTH(form) > 5 THEN JSON_REMOVE(form, '$[0]') ELSE form END
  WHERE season_id = v_season AND league_id = v_league AND team_id = v_home;

  -- away update
  UPDATE standings
  SET played_games = played_games + 1,
      goals_for = goals_for + NEW.full_time_away,
      goals_against = goals_against + NEW.full_time_home,
      goal_difference = goal_difference + (NEW.full_time_away - NEW.full_time_home),
      won = won + (CASE WHEN v_w = 'AWAY_TEAM' THEN 1 ELSE 0 END),
      draw = draw + (CASE WHEN v_w = 'DRAW' THEN 1 ELSE 0 END),
      lost = lost + (CASE WHEN v_w = 'HOME_TEAM' THEN 1 ELSE 0 END),
      points = points + (CASE WHEN v_w = 'AWAY_TEAM' THEN 3 WHEN v_w = 'DRAW' THEN 1 ELSE 0 END),
      form = JSON_ARRAY_APPEND(IFNULL(form, JSON_ARRAY()), '$', CASE WHEN v_w='AWAY_TEAM' THEN 'W' WHEN v_w='DRAW' THEN 'D' ELSE 'L' END)
  WHERE season_id = v_season AND league_id = v_league AND team_id = v_away;

  -- trim form to last 5 for away
  UPDATE standings
  SET form = CASE WHEN JSON_LENGTH(form) > 5 THEN JSON_REMOVE(form, '$[0]') ELSE form END
  WHERE season_id = v_season AND league_id = v_league AND team_id = v_away;
END$$
DELIMITER ;

-- Handle updates to scores: recompute by reversing old & applying new (simpler: call recompute procedure)
DROP TRIGGER IF EXISTS trg_after_score_update;
DELIMITER $$
CREATE TRIGGER trg_after_score_update
AFTER UPDATE ON scores
FOR EACH ROW
BEGIN
  -- For safety & correctness, call recompute for this match's season+league
  DECLARE rs_season INT; DECLARE rs_league INT;
  SELECT m.season_id, m.league_id INTO rs_season, rs_league FROM matches m WHERE m.match_id = NEW.match_id;
  -- We call stored procedure sp_recompute_standings to avoid complex reversal logic here
  CALL sp_recompute_standings(rs_league, rs_season);
END$$
DELIMITER ;

-- =========================
-- STORED PROCEDURES (admin CRUD, search, utilities)
-- =========================

DELIMITER $$

-- TEAM CRUD
DROP PROCEDURE IF EXISTS sp_add_team;
CREATE PROCEDURE sp_add_team(IN p_name VARCHAR(255), IN p_founded_year INT, IN p_stadium_id INT, IN p_league_id INT, IN p_coach_id INT, IN p_cresturl VARCHAR(255))
BEGIN
  INSERT INTO teams (name, founded_year, stadium_id, league_id, coach_id, cresturl)
  VALUES (p_name, p_founded_year, p_stadium_id, p_league_id, p_coach_id, p_cresturl);
  SELECT LAST_INSERT_ID() AS team_id;
END$$

DROP PROCEDURE IF EXISTS sp_update_team;
CREATE PROCEDURE sp_update_team(IN p_team_id INT, IN p_name VARCHAR(255), IN p_founded_year INT, IN p_stadium_id INT, IN p_league_id INT, IN p_coach_id INT, IN p_cresturl VARCHAR(255))
BEGIN
  UPDATE teams SET name=p_name, founded_year=p_founded_year, stadium_id=p_stadium_id, league_id=p_league_id, coach_id=p_coach_id, cresturl=p_cresturl WHERE team_id=p_team_id;
  IF ROW_COUNT() = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Team not found'; END IF;
END$$

DROP PROCEDURE IF EXISTS sp_delete_team;
CREATE PROCEDURE sp_delete_team(IN p_team_id INT)
BEGIN
  DELETE FROM teams WHERE team_id = p_team_id;
  IF ROW_COUNT() = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Team not found or could not be deleted'; END IF;
END$$

-- PLAYER CRUD
DROP PROCEDURE IF EXISTS sp_add_player;
CREATE PROCEDURE sp_add_player(IN p_name VARCHAR(255), IN p_team_id INT, IN p_position VARCHAR(50), IN p_date_of_birth DATE, IN p_nationality VARCHAR(100))
BEGIN
  INSERT INTO players (name, team_id, `position`, date_of_birth, nationality)
  VALUES (p_name, p_team_id, p_position, p_date_of_birth, p_nationality);
  SELECT LAST_INSERT_ID() AS player_id;
END$$

DROP PROCEDURE IF EXISTS sp_update_player;
CREATE PROCEDURE sp_update_player(IN p_player_id INT, IN p_name VARCHAR(255), IN p_team_id INT, IN p_position VARCHAR(50), IN p_date_of_birth DATE, IN p_nationality VARCHAR(100))
BEGIN
  UPDATE players SET name=p_name, team_id=p_team_id, `position`=p_position, date_of_birth=p_date_of_birth, nationality=p_nationality WHERE player_id=p_player_id;
  IF ROW_COUNT() = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Player not found'; END IF;
END$$

DROP PROCEDURE IF EXISTS sp_delete_player;
CREATE PROCEDURE sp_delete_player(IN p_player_id INT)
BEGIN
  DELETE FROM players WHERE player_id = p_player_id;
  IF ROW_COUNT() = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Player not found'; END IF;
END$$

-- MATCH CRUD / SCHEDULING
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_schedule_match$$
CREATE PROCEDURE sp_schedule_match(
    IN p_season_id INT,
    IN p_league_id INT,
    IN p_matchday INT,
    IN p_home_team_id INT,
    IN p_away_team_id INT,
    IN p_utc_date DATE
)
BEGIN
    DECLARE h_league INT;
    DECLARE a_league INT;

    SELECT league_id INTO h_league FROM teams WHERE team_id = p_home_team_id;
    SELECT league_id INTO a_league FROM teams WHERE team_id = p_away_team_id;

    IF h_league IS NULL OR a_league IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Team(s) not found';
    END IF;

    IF h_league <> a_league OR h_league <> p_league_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Teams must be in specified league';
    END IF;

    IF p_home_team_id = p_away_team_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Home and away teams must be different';
    END IF;

    INSERT INTO matches (season_id, league_id, matchday, home_team_id, away_team_id, `utc_date`)
    VALUES (p_season_id, p_league_id, p_matchday, p_home_team_id, p_away_team_id, p_utc_date);

    SELECT LAST_INSERT_ID() AS match_id;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS sp_update_match$$
CREATE PROCEDURE sp_update_match(
    IN p_match_id INT,
    IN p_season_id INT,
    IN p_league_id INT,
    IN p_matchday INT,
    IN p_home_team_id INT,
    IN p_away_team_id INT,
    IN p_utc_date DATE
)
BEGIN
    -- Update the match
    UPDATE matches
    SET season_id = p_season_id,
        league_id = p_league_id,
        matchday = p_matchday,
        home_team_id = p_home_team_id,
        away_team_id = p_away_team_id,
        `utc_date` = p_utc_date
    WHERE match_id = p_match_id;

    -- Check if any row was affected
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Match not found';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS sp_delete_match;
CREATE PROCEDURE sp_delete_match(IN p_match_id INT)
BEGIN
  DELETE FROM matches WHERE match_id = p_match_id;
  IF ROW_COUNT() = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Match not found'; END IF;
END$$
DELIMITER ;

DELIMITER $$
-- Update or insert score (triggers will update winner & standings)
DROP PROCEDURE IF EXISTS sp_update_match_score;
CREATE PROCEDURE sp_update_match_score(IN p_match_id INT, IN p_full_time_home INT, IN p_full_time_away INT, IN p_half_time_home INT, IN p_half_time_away INT)
BEGIN
  IF (SELECT COUNT(*) FROM scores WHERE match_id=p_match_id) > 0 THEN
    UPDATE scores SET full_time_home=p_full_time_home, full_time_away=p_full_time_away, half_time_home=p_half_time_home, half_time_away=p_half_time_away WHERE match_id=p_match_id;
  ELSE
    INSERT INTO scores (match_id, full_time_home, full_time_away, half_time_home, half_time_away)
    VALUES (p_match_id, p_full_time_home, p_full_time_away, p_half_time_home, p_half_time_away);
  END IF;
END$$
DELIMITER ;

-- User admin update
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_update_user_privilege;
CREATE PROCEDURE sp_update_user_privilege(IN p_user_id INT, IN p_is_admin TINYINT)
BEGIN
  UPDATE users SET is_admin = p_is_admin WHERE user_id = p_user_id;
  IF ROW_COUNT() = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='User not found'; END IF;
END$$
DELIMITER ;

-- SEARCH PROC (returns rows directly)
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_search_players;
CREATE PROCEDURE sp_search_players(IN p_search_term VARCHAR(255))
BEGIN
  SELECT * FROM v_player_profiles WHERE UPPER(player_name) LIKE CONCAT('%', UPPER(p_search_term), '%') ORDER BY player_name;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS sp_search_teams;
CREATE PROCEDURE sp_search_teams(IN p_search_term VARCHAR(255))
BEGIN
  SELECT * FROM v_team_profiles WHERE UPPER(team_name) LIKE CONCAT('%', UPPER(p_search_term), '%') ORDER BY team_name;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS sp_search_stadiums;
CREATE PROCEDURE sp_search_stadiums(IN p_search_term VARCHAR(255))
BEGIN
  SELECT stadium_id, name, location, capacity FROM stadiums WHERE UPPER(name) LIKE CONCAT('%', UPPER(p_search_term), '%') ORDER BY name;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS sp_search_coaches;
CREATE PROCEDURE sp_search_coaches(IN p_search_term VARCHAR(255))
BEGIN
  SELECT c.coach_id, c.name, c.nationality, t.team_id, t.name AS team_name
  FROM coaches c LEFT JOIN teams t ON c.team_id = t.team_id
  WHERE UPPER(c.name) LIKE CONCAT('%', UPPER(p_search_term), '%') ORDER BY c.name;
END$$
DELIMITER ;

-- Recompute standings from scratch for a league+season (recommended after bulk load)
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_recompute_standings;
CREATE PROCEDURE sp_recompute_standings(IN p_league_id INT, IN p_season_id INT)
BEGIN
  -- Delete existing standings for league+season
  DELETE FROM standings WHERE league_id = p_league_id AND season_id = p_season_id;

  -- Build standings from matches with scores
  INSERT INTO standings (season_id, league_id, `position`, team_id, played_games, won, draw, lost, points, goals_for, goals_against, goal_difference, form)
  SELECT
    p_season_id AS season_id,
    p_league_id AS league_id,
    0 AS `position`,
    team_id,
    SUM(played) AS played_games,
    SUM(won) AS won,
    SUM(draw) AS draw,
    SUM(lost) AS lost,
    SUM(points) AS points,
    SUM(goals_for) AS goals_for,
    SUM(goals_against) AS goals_against,
    SUM(goals_for) - SUM(goals_against) AS goal_difference,
    JSON_ARRAY() -- form can be reconstructed separately if needed
  FROM (
    -- aggregate per team using union of home & away roles
    SELECT home_team_id AS team_id,
      COUNT(*) AS played,
      SUM(CASE WHEN sc.full_time_home > sc.full_time_away THEN 1 ELSE 0 END) AS won,
      SUM(CASE WHEN sc.full_time_home = sc.full_time_away THEN 1 ELSE 0 END) AS draw,
      SUM(CASE WHEN sc.full_time_home < sc.full_time_away THEN 1 ELSE 0 END) AS lost,
      SUM(CASE WHEN sc.full_time_home > sc.full_time_away THEN 3 WHEN sc.full_time_home = sc.full_time_away THEN 1 ELSE 0 END) AS points,
      SUM(sc.full_time_home) AS goals_for,
      SUM(sc.full_time_away) AS goals_against
    FROM matches m
    JOIN scores sc ON m.match_id = sc.match_id
    WHERE m.league_id = p_league_id AND m.season_id = p_season_id
    GROUP BY home_team_id

    UNION ALL

    SELECT away_team_id AS team_id,
      COUNT(*) AS played,
      SUM(CASE WHEN sc.full_time_away > sc.full_time_home THEN 1 ELSE 0 END) AS won,
      SUM(CASE WHEN sc.full_time_away = sc.full_time_home THEN 1 ELSE 0 END) AS draw,
      SUM(CASE WHEN sc.full_time_away < sc.full_time_home THEN 1 ELSE 0 END) AS lost,
      SUM(CASE WHEN sc.full_time_away > sc.full_time_home THEN 3 WHEN sc.full_time_away = sc.full_time_home THEN 1 ELSE 0 END) AS points,
      SUM(sc.full_time_away) AS goals_for,
      SUM(sc.full_time_home) AS goals_against
    FROM matches m
    JOIN scores sc ON m.match_id = sc.match_id
    WHERE m.league_id = p_league_id AND m.season_id = p_season_id
    GROUP BY away_team_id
  ) AS agg
  GROUP BY team_id
  ORDER BY points DESC, (SUM(goals_for) - SUM(goals_against)) DESC;

  -- Optional: assign positions based on points using window function
  UPDATE standings s
  JOIN (
      SELECT team_id,
             ROW_NUMBER() OVER (
                 ORDER BY points DESC, goal_difference DESC, goals_for DESC
             ) AS rownum
      FROM standings
      WHERE league_id = p_league_id AND season_id = p_season_id
  ) ranked
  ON s.team_id = ranked.team_id
  SET s.`position` = ranked.rownum
  WHERE s.league_id = p_league_id AND s.season_id = p_season_id;

END$$
DELIMITER ;

-- Utility functions
DELIMITER $$
DROP FUNCTION IF EXISTS fn_team_win_percentage;
CREATE FUNCTION fn_team_win_percentage(p_team_id INT, p_season_id INT) RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
  DECLARE v_played INT DEFAULT 0; DECLARE v_won INT DEFAULT 0;
  SELECT played_games, won INTO v_played, v_won FROM standings WHERE team_id=p_team_id AND season_id=p_season_id LIMIT 1;
  IF v_played IS NULL OR v_played = 0 THEN RETURN 0; END IF;
  RETURN ROUND((v_won*100.0)/v_played, 2);
END$$
DELIMITER ;

DELIMITER $$
DROP FUNCTION IF EXISTS fn_goals_per_game;
CREATE FUNCTION fn_goals_per_game(p_player_id INT, p_season_id INT) RETURNS DECIMAL(6,2)
DETERMINISTIC
BEGIN
  DECLARE v_goals INT DEFAULT 0; DECLARE v_games INT DEFAULT 0;
  SELECT goals INTO v_goals FROM scorers WHERE player_id=p_player_id AND season_id=p_season_id LIMIT 1;
  SELECT st.played_games INTO v_games FROM standings st JOIN players p ON st.team_id = p.team_id WHERE p.player_id = p_player_id AND st.season_id = p_season_id LIMIT 1;
  IF v_games IS NULL OR v_games = 0 THEN RETURN 0; END IF;
  RETURN ROUND(v_goals / v_games, 2);
END$$

DELIMITER ;

-- =========================
-- QUICK NOTES
-- =========================
-- 1) Use sp_recompute_standings(league_id, season_id) AFTER bulk inserts or score updates (recommended).
-- 2) When bulk-loading historic data: disable triggers, load scores & matches, then call sp_recompute_standings.
--    Example:
--      SET @OLD_SQL_MODE = @@sql_mode;
--      -- disable triggers by dropping them or run statements with a flag table. Recreate later.
-- 3) Backend (Flask):
--    - user_routes.py should read from v_* views and call search procedures for search endpoints.
--    - admin_routes.py should call the sp_* admin procedures for create/update/delete and sp_update_match_score for scores.
-- 4) This script keeps the system strictly within the specified functionalities (no extra features).

COMMIT;
