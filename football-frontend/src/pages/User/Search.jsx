import { useState } from 'react';
import { searchService } from '../../services/search.service';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, players, teams, stadiums, coaches
  const [results, setResults] = useState({
    players: [],
    teams: [],
    stadiums: [],
    coaches: []
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      alert('Please enter a search term');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      if (searchType === 'all') {
        const data = await searchService.globalSearch(searchTerm);
        setResults(data.results);
      } else if (searchType === 'players') {
        const data = await searchService.searchPlayers(searchTerm);
        setResults({ players: data.results, teams: [], stadiums: [], coaches: [] });
      } else if (searchType === 'teams') {
        const data = await searchService.searchTeams(searchTerm);
        setResults({ players: [], teams: data.results, stadiums: [], coaches: [] });
      } else if (searchType === 'stadiums') {
        const data = await searchService.searchStadiums(searchTerm);
        setResults({ players: [], teams: [], stadiums: data.results, coaches: [] });
      } else if (searchType === 'coaches') {
        const data = await searchService.searchCoaches(searchTerm);
        setResults({ players: [], teams: [], stadiums: [], coaches: data.results });
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error performing search: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalResults = () => {
    return results.players.length + results.teams.length + 
           results.stadiums.length + results.coaches.length;
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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '10px' }}>Search</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>
        Search for players, teams, stadiums, and coaches
      </p>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
        <div style={{
          backgroundColor: '#59595aff',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #e5e7eb'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Search Term
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter player, team, stadium, or coach name..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Search In
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px'
                }}
              >
                <option value="all">All</option>
                <option value="players">Players</option>
                <option value="teams">Teams</option>
                <option value="stadiums">Stadiums</option>
                <option value="coaches">Coaches</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 30px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {loading ? '🔍 Searching...' : '🔍 Search'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Results Summary */}
      {hasSearched && !loading && (
        <div style={{
          backgroundColor: '#dbeafe',
          color: "#333",
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #3b82f6'
        }}>
          <strong>Search Results:</strong> Found {getTotalResults()} result(s) for "{searchTerm}"
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
          <p>Searching...</p>
        </div>
      )}

      {/* No Results */}
      {hasSearched && !loading && getTotalResults() === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
          <h2 style={{ color: '#6b7280' }}>No results found</h2>
          <p style={{ color: '#9ca3af' }}>
            Try adjusting your search terms or search type
          </p>
        </div>
      )}

      {/* Players Results */}
      {results.players.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            borderBottom: '3px solid #3b82f6',
            paddingBottom: '10px',
            marginBottom: '15px'
          }}>
            ⚽ Players ({results.players.length})
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {results.players.map(player => (
              <div
                key={player.player_id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'black' }}>
                      {player.player_name}
                    </h3>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: getPositionColor(player.position),
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                      {player.position}
                    </div>
                  </div>
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Team:</strong> {player.team_name || 'N/A'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>League:</strong> {player.league_name || 'N/A'}
                  </p>
                  {player.nationality && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Nationality:</strong> {player.nationality}
                    </p>
                  )}
                  {player.age && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Age:</strong> {player.age}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams Results */}
      {results.teams.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            borderBottom: '3px solid #10b981',
            paddingBottom: '10px',
            marginBottom: '15px'
          }}>
            🏆 Teams ({results.teams.length})
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {results.teams.map(team => (
              <div
                key={team.team_id}
                style={{
                  backgroundColor: 'white',
                  color: "#333",
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: '15px', alignItems: 'start' }}>
                  {team.cresturl && (
                    <img
                      src={team.cresturl}
                      alt={team.team_name}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'contain'
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                      {team.team_name}
                    </h3>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                      <p style={{ margin: '5px 0' }}>
                        <strong>League:</strong> {team.league_name}
                      </p>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Stadium:</strong> {team.stadium_name || 'N/A'}
                      </p>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Coach:</strong> {team.coach_name || 'N/A'}
                      </p>
                      {team.founded_year && (
                        <p style={{ margin: '5px 0' }}>
                          <strong>Founded:</strong> {team.founded_year}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stadiums Results */}
      {results.stadiums.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            borderBottom: '3px solid #f59e0b',
            paddingBottom: '10px',
            marginBottom: '15px'
          }}>
            🏟️ Stadiums ({results.stadiums.length})
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {results.stadiums.map(stadium => (
              <div
                key={stadium.stadium_id}
                style={{
                  backgroundColor: 'white',
                  color: "#333",
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                  {stadium.name}
                </h3>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Location:</strong> {stadium.location || 'N/A'}
                  </p>
                  {stadium.capacity && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Capacity:</strong> {stadium.capacity.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coaches Results */}
      {results.coaches.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            borderBottom: '3px solid #8b5cf6',
            paddingBottom: '10px',
            marginBottom: '15px'
          }}>
            👔 Coaches ({results.coaches.length})
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {results.coaches.map(coach => (
              <div
                key={coach.coach_id}
                style={{
                  backgroundColor: 'white',
                  color: "#333",
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                  {coach.name}
                </h3>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  {coach.nationality && (
                    <p style={{ margin: '5px 0' }}>
                      <strong>Nationality:</strong> {coach.nationality}
                    </p>
                  )}
                  <p style={{ margin: '5px 0' }}>
                    <strong>Team:</strong> {coach.team_name || 'Free Agent'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}