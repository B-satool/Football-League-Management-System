-- countries
DROP TABLE IF EXISTS countries;
CREATE TABLE countries (
  country_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  flag_url VARCHAR(255),
  PRIMARY KEY (country_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- leagues
DROP TABLE IF EXISTS leagues;
CREATE TABLE leagues (
  league_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  country_id INT,
  icon_url VARCHAR(255),
  cl_spot INT,
  uel_spot INT,
  relegation_spot INT,
  PRIMARY KEY (league_id),
  KEY idx_leagues_country_id (country_id),
  CONSTRAINT fk_leagues_country FOREIGN KEY (country_id) REFERENCES countries(country_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- stadiums
DROP TABLE IF EXISTS stadiums;
CREATE TABLE stadiums (
  stadium_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INT,
  PRIMARY KEY (stadium_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- teams
DROP TABLE IF EXISTS teams;
CREATE TABLE teams (
  team_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  founded_year INT,
  stadium_id INT,
  league_id INT,
  coach_id INT,
  cresturl VARCHAR(255),
  PRIMARY KEY (team_id),
  KEY idx_teams_stadium_id (stadium_id),
  KEY idx_teams_league_id (league_id),
  KEY idx_teams_coach_id (coach_id),
  CONSTRAINT fk_teams_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums(stadium_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_teams_league FOREIGN KEY (league_id) REFERENCES leagues(league_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- coaches
DROP TABLE IF EXISTS coaches;
CREATE TABLE coaches (
  coach_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  team_id INT,
  nationality VARCHAR(100),
  PRIMARY KEY (coach_id),
  KEY idx_coaches_team_id (team_id),
  CONSTRAINT fk_coaches_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id),
  UNIQUE KEY ux_users_username (username),
  UNIQUE KEY ux_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- players
DROP TABLE IF EXISTS players;
CREATE TABLE players (
  player_id INT NOT NULL AUTO_INCREMENT,
  team_id INT,
  name VARCHAR(255) NOT NULL,
  `position` VARCHAR(50),
  date_of_birth DATE,
  nationality VARCHAR(100),
  PRIMARY KEY (player_id),
  KEY idx_players_team_id (team_id),
  CONSTRAINT fk_players_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- referees
DROP TABLE IF EXISTS referees;
CREATE TABLE referees (
  referee_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100),
  nationality VARCHAR(50),
  PRIMARY KEY (referee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- seasons
DROP TABLE IF EXISTS seasons;
CREATE TABLE seasons (
  season_id INT NOT NULL AUTO_INCREMENT,
  league_id INT,
  `year` VARCHAR(9) NOT NULL,
  PRIMARY KEY (season_id),
  KEY idx_seasons_league_id (league_id),
  CONSTRAINT fk_seasons_league FOREIGN KEY (league_id) REFERENCES leagues(league_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- matches
DROP TABLE IF EXISTS matches;
CREATE TABLE matches (
  match_id INT NOT NULL AUTO_INCREMENT,
  season_id INT NULL,
  league_id INT NULL,
  matchday INT,
  home_team_id INT NULL,
  away_team_id INT NULL,
  winner VARCHAR(50),
  `utc_date` DATE,
  PRIMARY KEY (match_id),
  CONSTRAINT fk_matches_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_matches_league FOREIGN KEY (league_id) REFERENCES leagues(league_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_matches_home FOREIGN KEY (home_team_id) REFERENCES teams(team_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_matches_away FOREIGN KEY (away_team_id) REFERENCES teams(team_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- create indexes separately
CREATE INDEX idx_matches_season ON matches(season_id);
CREATE INDEX idx_matches_league ON matches(league_id);
CREATE INDEX idx_matches_home ON matches(home_team_id);
CREATE INDEX idx_matches_away ON matches(away_team_id);

-- scores
DROP TABLE IF EXISTS scores;
CREATE TABLE scores (
  score_id INT NOT NULL AUTO_INCREMENT,
  match_id INT,
  full_time_home INT,
  full_time_away INT,
  half_time_home INT,
  half_time_away INT,
  PRIMARY KEY (score_id),
  KEY idx_scores_match_id (match_id),
  CONSTRAINT fk_scores_match FOREIGN KEY (match_id) REFERENCES matches(match_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- scorers
DROP TABLE IF EXISTS scorers;
CREATE TABLE scorers (
  scorer_id INT NOT NULL AUTO_INCREMENT,
  player_id INT NOT NULL,
  season_id INT NOT NULL,
  league_id INT NOT NULL,
  goals INT,
  assists INT,
  penalties INT,
  PRIMARY KEY (scorer_id),
  KEY idx_scorers_player (player_id),
  KEY idx_scorers_season (season_id),
  KEY idx_scorers_league (league_id),
  CONSTRAINT fk_scorers_player FOREIGN KEY (player_id) REFERENCES players(player_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_scorers_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_scorers_league FOREIGN KEY (league_id) REFERENCES leagues(league_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- standings
DROP TABLE IF EXISTS standings;
CREATE TABLE standings (
  standing_id INT NOT NULL AUTO_INCREMENT,
  season_id INT NOT NULL,
  league_id INT NOT NULL,
  `position` INT NOT NULL,
  team_id INT NOT NULL,
  played_games INT NOT NULL,
  won INT NOT NULL,
  draw INT NOT NULL,
  lost INT NOT NULL,
  points INT NOT NULL,
  goals_for INT NOT NULL,
  goals_against INT NOT NULL,
  goal_difference INT NOT NULL,
  form JSON,
  PRIMARY KEY (standing_id),
  KEY idx_standings_season (season_id),
  KEY idx_standings_league (league_id),
  KEY idx_standings_team (team_id),
  CONSTRAINT fk_standings_season FOREIGN KEY (season_id) REFERENCES seasons(season_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_standings_league FOREIGN KEY (league_id) REFERENCES leagues(league_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_standings_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- match_referees
DROP TABLE IF EXISTS match_referees;
CREATE TABLE match_referees (
  match_id INT NOT NULL,
  referee_id INT NOT NULL,
  KEY idx_mr_match (match_id),
  KEY idx_mr_ref (referee_id),
  CONSTRAINT fk_mr_match FOREIGN KEY (match_id) REFERENCES matches(match_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_mr_ref FOREIGN KEY (referee_id) REFERENCES referees(referee_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
