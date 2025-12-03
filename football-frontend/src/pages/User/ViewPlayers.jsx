import { useState, useEffect } from 'react';
import { playerService } from '../../services/player.service';
import { teamService } from '../../services/team.service';
import { leagueService } from '../../services/league.service';

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

export default function ViewPlayers() {
  const [players, setPlayers] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);
  const [playerStats, setPlayerStats] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    loadLeagues();
    loadAllPlayers();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadTeamsByLeague(selectedLeague);
    } else {
      loadAllTeams();
    }
  }, [selectedLeague]);

  useEffect(() => {
    loadFilteredPlayers();
  }, [selectedTeam, selectedPosition, selectedLeague]);

  const loadLeagues = async () => {
    try {
      const data = await leagueService.getAllLeagues();
      setLeagues(data.leagues || []);
    } catch (error) {
      console.error('Error loading leagues:', error);
    }
  };

  const loadAllTeams = async () => {
    try {
      const data = await teamService.getAllTeams();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadTeamsByLeague = async (leagueId) => {
    try {
      const data = await teamService.getAllTeams({ league_id: leagueId });
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadAllPlayers = async () => {
    try {
      setLoading(true);
      const data = await playerService.getAllPlayers();
      setPlayers(data.players || []);
    } catch (error) {
      console.error('Error loading players:', error);
      alert('Error loading players: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredPlayers = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedTeam) params.team_id = selectedTeam;
      if (selectedLeague) params.league_id = selectedLeague;
      if (selectedPosition) params.position = selectedPosition;
      
      const data = await playerService.getAllPlayers(params);
      setPlayers(data.players || []);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPlayerDetail = async (player) => {
    try {
      const data = await playerService.getPlayerById(player.player_id);
      setSelectedPlayer(data.player);
      setPlayerStats(data.statistics || []);
      setShowPlayerDetail(true);
    } catch (error) {
      console.error('Error loading player details:', error);
      alert('Error loading player details: ' + error.message);
    }
  };

  const getPositionColor = (position) => {
    const colors = {
      'Goalkeeper': '#ef4444',
      'Defender': '#3b82f6',
      'Midfielder': '#10b981',
      'Forward': '#f59e0b'
    };
    return colors[position] || '#6b7280';
  };

  const getPositionIcon = (position) => {
    const icons = {
      'Goalkeeper': '🧤',
      'Defender': '🛡️',
      'Midfielder': '⚙️',
      'Forward': '⚡'
    };
    return icons[position] || '⚽';
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };


  const filteredPlayers = players.filter(player =>
    player.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.nationality && player.nationality.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log("Players' positions:", filteredPlayers.map(p => p.position));

  const positionStats = POSITIONS.map(position => ({
    position,
    count: filteredPlayers.filter(p => p.position?.trim().toLowerCase() === position.toLowerCase()).length
  }));

  console.log("Players' positions:", positionStats.map(p => p.position));

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '10px' }}>Players</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>
        Browse player profiles and statistics
      </p>

      {/* Filters Section */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '2px solid #e5e7eb'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🔍 Search Players
            </label>
            <input
              type="text"
              placeholder="Search by name or nationality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🏆 League
            </label>
            <select
              value={selectedLeague}
              onChange={(e) => {
                setSelectedLeague(e.target.value);
                setSelectedTeam('');
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              <option value="">All Leagues</option>
              {leagues.map(league => (
                <option key={league.league_id} value={league.league_id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🏟️ Team
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              ⚽ Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              <option value="">All Positions</option>
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>
                  {getPositionIcon(pos)} {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Position Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {positionStats.map(stat => (
          <div
            key={stat.position}
            onClick={() => setSelectedPosition(selectedPosition === stat.position ? '' : stat.position)}
            style={{
              backgroundColor: selectedPosition === stat.position ? getPositionColor(stat.position) : 'white',
              color: selectedPosition === stat.position ? 'white' : '#374151',
              padding: '15px',
              borderRadius: '8px',
              border: `2px solid ${getPositionColor(stat.position)}`,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>
              {getPositionIcon(stat.position)}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '3px' }}>
              {stat.count}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {stat.position}s
            </div>
          </div>
        ))}
      </div>

      {/* View Mode Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'grid' ? '#3b82f6' : '#f3f4f6',
              color: viewMode === 'grid' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔲 Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'list' ? '#3b82f6' : '#f3f4f6',
              color: viewMode === 'list' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p>Loading players...</p>
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredPlayers.map(player => (
            <div
              key={player.player_id}
              onClick={() => openPlayerDetail(player)}
              style={{
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = getPositionColor(player.position);
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '15px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: 'black' }}>
                    {player.player_name}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    backgroundColor: getPositionColor(player.position),
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {getPositionIcon(player.position)} {player.position}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                      Team
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#374151' }}>
                      {player.team_name || 'Free Agent'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                      Age
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#374151' }}>
                      {calculateAge(player.date_of_birth)}
                    </div>
                  </div>
                </div>

                {player.league_name && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                      League
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#374151' }}>
                      {player.league_name}
                    </div>
                  </div>
                )}

                {player.nationality && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                      Nationality
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#374151' }}>
                      {player.nationality}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && viewMode === 'list' && (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  Name
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>
                  Position
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  Team
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  League
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>
                  Age
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  Nationality
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map(player => (
                <tr
                  key={player.player_id}
                  onClick={() => openPlayerDetail(player)}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    {player.player_name}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: getPositionColor(player.position),
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {getPositionIcon(player.position)} {player.position}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{player.team_name || 'Free Agent'}</td>
                  <td style={{ padding: '12px' }}>{player.league_name || 'N/A'}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {calculateAge(player.date_of_birth)}
                  </td>
                  <td style={{ padding: '12px' }}>{player.nationality || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredPlayers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚽</div>
          <h2 style={{ color: '#6b7280' }}>No players found</h2>
          <p style={{ color: '#9ca3af' }}>
            Try adjusting your filters or search terms
          </p>
        </div>
      )}

      {/* Player Detail Modal */}
      {showPlayerDetail && selectedPlayer && (
        <div
          onClick={() => setShowPlayerDetail(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${getPositionColor(selectedPlayer.position)} 0%, ${getPositionColor(selectedPlayer.position)}dd 100%)`,
              padding: '30px',
              color: 'white',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowPlayerDetail(false)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕ Close
              </button>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                {getPositionIcon(selectedPlayer.position)}
              </div>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
                {selectedPlayer.player_name}
              </h2>
              <div style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {selectedPlayer.position}
              </div>
            </div>

            {/* Player Info */}
            <div style={{ padding: '30px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '25px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                    Team
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedPlayer.team_name || 'Free Agent'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                    League
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedPlayer.league_name || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                    Age
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {calculateAge(selectedPlayer.date_of_birth)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                    Nationality
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedPlayer.nationality || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              {playerStats && playerStats.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                    Career Statistics
                  </h3>
                  {playerStats.map((stat, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#f9fafb',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div>
                          <strong>{stat.league_name}</strong>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Season {stat.season_year}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Goals</div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                            {stat.goals || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Assists</div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                            {stat.assists || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Penalties</div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                            {stat.penalties || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}