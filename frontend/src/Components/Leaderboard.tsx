import { useState, useEffect } from 'react';
import { User, LeaderboardEntry, TimePeriod } from './Types';

const Leaderboard = ({ entries, users, currentUserId }: LeaderboardProps) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all-time');
  const [filteredEntries, setFilteredEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUserPoints, setCurrentUserPoints] = useState<string>('0.00');

  // Filter entries based on selected time period
  useEffect(() => {
    const filterEntriesByTimePeriod = () => {
      setIsLoading(true);
      
      try {
        const now = new Date();
        let filtered: LeaderboardEntry[] = [];

        if (timePeriod === 'month') {
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          filtered = entries.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return (
              entryDate.getMonth() === currentMonth &&
              entryDate.getFullYear() === currentYear
            );
          });
        } else {
          filtered = [...entries];
        }

        setFilteredEntries(filtered);
      } catch (error) {
        console.error('Error filtering entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    filterEntriesByTimePeriod();
  }, [timePeriod, entries]);

  // Process and rank users
  const rankedUsers = filteredEntries
    .reduce((acc, entry) => {
      const existingUser = acc.find(item => item.user_id === entry.user_id);
      const score = parseFloat(entry.score);

      if (existingUser) {
        existingUser.totalScore += score;
      } else {
        acc.push({
          ...entry,
          totalScore: score
        });
      }

      return acc;
    }, [] as (LeaderboardEntry & { totalScore: number })[])
    .map(entry => {
      const user = users.find(u => u.id === entry.user_id);
      return {
        ...entry,
        username: user?.username || 'Unknown',
        profile_picture: user?.profile_picture,
        isCurrentUser: user?.id === currentUserId,
        score: entry.totalScore.toFixed(2),
        bio: user?.bio || '',
        skills: user?.skills_offered?.join(', ') || '',
        completed_sessions: user?.completed_sessions || 0
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  // Update current user rank and points
  useEffect(() => {
    if (currentUserId && rankedUsers.length > 0) {
      const currentUserIndex = rankedUsers.findIndex(user => user.isCurrentUser);
      if (currentUserIndex >= 0) {
        setCurrentUserRank(currentUserIndex + 1);
        setCurrentUserPoints(rankedUsers[currentUserIndex].score);
      } else {
        // If current user isn't in the ranked list, find their data
        const user = users.find(u => u.id === currentUserId);
        if (user) {
          setCurrentUserRank(null); // Not ranked
          setCurrentUserPoints(user.time_wallet);
        }
      }
    }
  }, [rankedUsers, currentUserId, users]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* Current User Stats Banner - Made more compact */}
      {currentUserId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-1 md:mb-0">
              <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900">Your Stats</h3>
                <p className="text-xs text-gray-500">
                  {currentUserRank ? (
                    <>Ranked <span className="font-bold">#{currentUserRank}</span> with </>
                  ) : (
                    "You're not currently ranked. Earn "
                  )}
                  <span className="font-bold">{currentUserPoints} credits</span>
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs">
              View Profile
            </button>
          </div>
        </div>
      )}

      {/* Time Period Toggle - Made more compact */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <h1 className="text-xl font-bold mb-2 md:mb-0">Top Contributors</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimePeriod('all-time')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              timePeriod === 'all-time'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All-Time
          </button>
          <button
            onClick={() => setTimePeriod('month')}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              timePeriod === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Leaderboard Content with Compact Cards */
        <div className="space-y-3">
          {rankedUsers.length > 0 ? (
            rankedUsers.map((entry, index) => (
              <div 
                key={entry.id} 
                className={`flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-lg border ${
                  entry.isCurrentUser 
                    ? 'border-blue-300 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:bg-gray-50'
                } transition-colors`}
              >
                {/* Rank Indicator - Smaller */}
                <div className="flex-shrink-0 mb-2 sm:mb-0 sm:mr-4">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                </div>
                
                {/* User Info - More compact */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {entry.profile_picture ? (
                        <img 
                          className="h-8 w-8 rounded-full object-cover" 
                          src={entry.profile_picture} 
                          alt={entry.username} 
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-sm">
                            {entry.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {entry.username}
                        </p>
                        {entry.isCurrentUser && (
                          <span className="px-1.5 py-0.5 text-xxs rounded-full bg-blue-100 text-blue-800">
                            You
                          </span>
                        )}
                      </div>
                      {entry.bio && (
                        <p className="text-xxs text-gray-500 truncate">
                          {entry.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Credits and Badges - More compact */}
                <div className="mt-2 sm:mt-0 sm:ml-4 sm:text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {entry.score} <span className="text-xs font-normal text-gray-500">credits</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1 sm:justify-end">
                    {index === 0 && (
                      <span className="px-1.5 py-0.5 text-xxs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Top
                      </span>
                    )}
                    {parseFloat(entry.score) >= 50 && (
                      <span className="px-1.5 py-0.5 text-xxs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {entry.completed_sessions > 10 && (
                      <span className="px-1.5 py-0.5 text-xxs font-medium rounded-full bg-purple-100 text-purple-800">
                        Exp
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                No data available for the selected time period
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;