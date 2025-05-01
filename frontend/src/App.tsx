// App.tsx with realistic profile images
import Leaderboard from "./Components/Leaderboard";
import { User, LeaderboardEntry } from "./Components/Types";
import { useState, useEffect } from "react";


const App = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [leaderboardEntries, setLeaderboardEntries] = useState<
		LeaderboardEntry[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
  
 
	useEffect(() => {
		// Simulate API fetch with complete data
		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Complete mock users data with real Unsplash images
				const mockUsers: User[] = [
					{
						id: 1,
						email: "admin@aastu.edu.et",
						username: "aastu_admin",
						profile_picture:
							"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop",
						time_wallet: "1000.00",
						is_admin: true,
						date_joined: "2025-04-20T10:00:00Z",
						bio: "Platform administrator",
						skills_offered: ["System Administration"],
						completed_sessions: 0,
					},
					{
						id: 2,
						email: "studentA@aastu.edu.et",
						username: "studentA",
						profile_picture:
							"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
						time_wallet: "450.75",
						is_admin: false,
						date_joined: "2025-04-21T12:30:00Z",
						bio: "Computer Science student offering programming help",
						skills_offered: ["JavaScript", "React", "Python"],
						completed_sessions: 15,
					},
					{
						id: 3,
						email: "studentB@aastu.edu.et",
						username: "studentB",
						profile_picture:
							"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
						time_wallet: "320.50",
						is_admin: false,
						date_joined: "2025-04-21T13:05:00Z",
						bio: "Physics major with strong math skills",
						skills_offered: ["Physics", "Calculus"],
						completed_sessions: 12,
					},
					{
						id: 4,
						email: "studentC@aastu.edu.et",
						username: "studentC",
						profile_picture:
							"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
						time_wallet: "240.00",
						is_admin: false,
						date_joined: "2025-04-22T09:15:00Z",
						bio: "Architecture student specializing in 3D modeling",
						skills_offered: ["AutoCAD", "SketchUp"],
						completed_sessions: 8,
					},
					{
						id: 5,
						email: "studentD@aastu.edu.et",
						username: "creative_writer",
						profile_picture:
							"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop",
						time_wallet: "175.25",
						is_admin: false,
						date_joined: "2025-04-23T11:40:00Z",
						bio: "Literature student offering writing workshops",
						skills_offered: ["Creative Writing", "Essay Editing"],
						completed_sessions: 10,
					},
					{
						id: 6,
						email: "studentE@aastu.edu.et",
						username: "code_ninja",
						profile_picture:
							"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
						time_wallet: "610.30",
						is_admin: false,
						date_joined: "2025-04-24T08:20:00Z",
						bio: "Competitive programmer offering algorithm coaching",
						skills_offered: ["Algorithms", "Data Structures"],
						completed_sessions: 25,
					},
					{
						id: 7,
						email: "studentF@aastu.edu.et",
						username: "language_tutor",
						profile_picture:
							"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
						time_wallet: "295.60",
						is_admin: false,
						date_joined: "2025-04-25T14:10:00Z",
						bio: "Fluent in 4 languages offering conversational practice",
						skills_offered: ["English", "French", "Spanish"],
						completed_sessions: 18,
					},
					{
						id: 8,
						email: "studentG@aastu.edu.et",
						username: "music_maestro",
						profile_picture:
							"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
						time_wallet: "145.90",
						is_admin: false,
						date_joined: "2025-04-26T16:55:00Z",
						bio: "Music theory and piano lessons for beginners",
						skills_offered: ["Piano", "Music Theory"],
						completed_sessions: 9,
					},
					{
						id: 9,
						email: "studentH@aastu.edu.et",
						username: "math_whiz",
						profile_picture:
							"https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&h=200&fit=crop",
						time_wallet: "380.25",
						is_admin: false,
						date_joined: "2025-04-27T10:20:00Z",
						bio: "Mathematics graduate student offering advanced tutoring",
						skills_offered: ["Calculus", "Linear Algebra"],
						completed_sessions: 22,
					},
					{
						id: 10,
						email: "studentI@aastu.edu.et",
						username: "design_guru",
						profile_picture:
							"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
						time_wallet: "210.75",
						is_admin: false,
						date_joined: "2025-04-28T09:30:00Z",
						bio: "Graphic design student with Adobe expertise",
						skills_offered: ["Photoshop", "Illustrator"],
						completed_sessions: 14,
					},
				];

				const mockEntries: LeaderboardEntry[] = [
					// Current month entries
					{
						id: 1,
						user_id: 6, // code_ninja
						week: 17,
						score: "210.00",
						timestamp: new Date().toISOString(),
					},
					{
						id: 2,
						user_id: 2, // studentA
						week: 17,
						score: "150.00",
						timestamp: new Date().toISOString(),
					},
					{
						id: 3,
						user_id: 9, // math_whiz
						week: 17,
						score: "130.00",
						timestamp: new Date().toISOString(),
					},
					{
						id: 4,
						user_id: 3, // studentB
						week: 17,
						score: "120.00",
						timestamp: new Date().toISOString(),
					},
					{
						id: 5,
						user_id: 7, // language_tutor
						week: 17,
						score: "95.00",
						timestamp: new Date().toISOString(),
					},
					{
						id: 6,
						user_id: 4, // studentC
						week: 17,
						score: "80.00",
						timestamp: new Date().toISOString(),
					},
					{
						id: 7,
						user_id: 10, // design_guru
						week: 17,
						score: "75.00",
						timestamp: new Date().toISOString(),
					},
					{
						id: 8,
						user_id: 5, // creative_writer
						week: 17,
						score: "65.00",
						timestamp: new Date().toISOString(),
					},
					{
						id: 9,
						user_id: 8, // music_maestro
						week: 17,
						score: "45.00",
						timestamp: new Date().toISOString(),
					},
					// Previous month entries
					{
						id: 10,
						user_id: 6, // code_ninja
						week: 16,
						score: "400.00",
						timestamp: new Date(
							new Date().setMonth(new Date().getMonth() - 1)
						).toISOString(),
					},
					{
						id: 11,
						user_id: 2, // studentA
						week: 16,
						score: "300.00",
						timestamp: new Date(
							new Date().setMonth(new Date().getMonth() - 1)
						).toISOString(),
					},
				];

				setUsers(mockUsers);
				setLeaderboardEntries(mockEntries);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<div className="max-w-6xl mx-auto">
				<Leaderboard
					entries={leaderboardEntries}
					users={users}
					currentUserId={2} // Assuming studentA is the current user
				/>
			</div>
		</div>
	);
};

export default App;
