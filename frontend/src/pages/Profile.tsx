import { useState } from "react";

type ProfileTab = "profile" | "skills" | "wallet" | "settings";

type Transaction = {
  id: string;
  date: string;
  description: string;
  credits: number;
  balance: number;
};

const UserProfile = () => {
  const [user, setUser] = useState({
    username: "JohnDoe",
    email: "john.doe@example.com",
    profile_picture: "",
    bio: "Software developer passionate about teaching and learning new skills.",
    time_wallet: 85,
    skills_offered: ["JavaScript", "React", "TypeScript"],
  });

  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user.username,
    bio: user.bio,
    location: "USA",
    mobileNumber: "+1 (555) 123-4567",
  });

  const [skillsOffered, setSkillsOffered] = useState<string[]>(
    user.skills_offered
  );
  const [skillsWanted, setSkillsWanted] = useState<string[]>([
    "Guitar",
    "Photography",
  ]);
  const [newSkill, setNewSkill] = useState("");
  const [skillType, setSkillType] = useState<"offered" | "wanted">("offered");

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      date: "2025-04-27",
      description: "Taught Python",
      credits: 5.0,
      balance: 85.0,
    },
    {
      id: "2",
      date: "2025-04-26",
      description: "Learned Guitar",
      credits: -3.0,
      balance: 80.0,
    },
    {
      id: "3",
      date: "2025-04-25",
      description: "Taught React",
      credits: 8.0,
      balance: 83.0,
    },
  ]);
  
  const [transactionFilter, setTransactionFilter] = useState<
    "all" | "earned" | "spent"
  >("all");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setUser((prev) => ({
      ...prev,
      username: profileData.name,
      bio: profileData.bio,
    }));
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() === "") return;

    if (skillType === "offered") {
      setSkillsOffered((prev) => [...prev, newSkill.trim()]);
    } else {
      setSkillsWanted((prev) => [...prev, newSkill.trim()]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string, type: "offered" | "wanted") => {
    if (type === "offered") {
      setSkillsOffered((prev) => prev.filter((s) => s !== skill));
    } else {
      setSkillsWanted((prev) => prev.filter((s) => s !== skill));
    }
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePicture(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (transactionFilter === "all") return true;
    if (transactionFilter === "earned") return transaction.credits > 0;
    return transaction.credits < 0;
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    alert("Password changed successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              {profilePicture || user.profile_picture ? (
                <img
                  className="h-24 w-24 rounded-full object-cover"
                  src={profilePicture || user.profile_picture}
                  alt={user.username}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-3xl text-gray-600">
                    {profileData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.username}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {user.time_wallet}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      credits
                    </span>
                  </div>
                </div>
              </div>
              {profileData.bio && !isEditing && (
                <p className="mt-2 text-gray-600">{profileData.bio}</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "profile"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("skills")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "skills"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Skills
              </button>
              <button
                onClick={() => setActiveTab("wallet")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "wallet"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Time Wallet
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "settings"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
          {activeTab === "profile" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={profileData.mobileNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Add phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <select
                      name="location"
                      value={profileData.location}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="ET">Ethiopia</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {profileData.name}
                    </p>
                  </div>
                  {profileData.bio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Bio
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {profileData.bio}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  {profileData.mobileNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Mobile Number
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {profileData.mobileNumber}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Location
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {profileData.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                My Skills
              </h2>

              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Skills I Offer
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skillsOffered.map((skill) => (
                    <div
                      key={`offered-${skill}`}
                      className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill, "offered")}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {skillsOffered.length === 0 && (
                    <p className="text-gray-500 text-sm">No skills added yet</p>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Skills I Want to Learn
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skillsWanted.map((skill) => (
                    <div
                      key={`wanted-${skill}`}
                      className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill, "wanted")}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {skillsWanted.length === 0 && (
                    <p className="text-gray-500 text-sm">No skills added yet</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add New Skill
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Enter skill name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={skillType}
                      onChange={(e) =>
                        setSkillType(e.target.value as "offered" | "wanted")
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="offered">I Offer</option>
                      <option value="wanted">I Want</option>
                    </select>
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Time Wallet
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {user.time_wallet}{" "}
                    <span className="text-lg font-normal text-gray-500">
                      credits
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Total earned: 100 | Total spent: 15
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Transaction History
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTransactionFilter("all")}
                      className={`px-3 py-1 rounded-md text-sm ${
                        transactionFilter === "all"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTransactionFilter("earned")}
                      className={`px-3 py-1 rounded-md text-sm ${
                        transactionFilter === "earned"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Earned
                    </button>
                    <button
                      onClick={() => setTransactionFilter("spent")}
                      className={`px-3 py-1 rounded-md text-sm ${
                        transactionFilter === "spent"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Spent
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                              transaction.credits > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.credits > 0 ? "+" : ""}
                            {transaction.credits.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.balance.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Profile Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Profile Picture
                        </label>
                        <div className="flex items-center">
                          {profilePicture || user.profile_picture ? (
                            <img
                              className="h-16 w-16 rounded-full object-cover mr-4"
                              src={profilePicture || user.profile_picture}
                              alt={user.username}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                              <span className="text-xl text-gray-600">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              id="profile-picture"
                              accept="image/*"
                              onChange={handleProfilePictureChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="profile-picture"
                              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              Change Photo
                            </label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              bio: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Account Settings
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Change Password
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Change Password
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
