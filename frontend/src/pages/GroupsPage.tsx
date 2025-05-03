import Button from "../components/ui/Button";
import {Input, Label, Textarea} from "../components/ui/Form";
import { mockGroups } from "../store/types";
import { CreateGroupRequest, createGroup, fetchMyGroups, GroupListResponse } from "../services/groups";
import { useState, useEffect } from "react";

const GroupsPage = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [groupData, setGroupData] = useState<GroupListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadGroups = async () => {
      const data = await fetchMyGroups(currentPage);
      setGroupData(data);
    };
    
    loadGroups();
  }, [currentPage]);

  const groups = groupData?.results || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const createdGroup = await createGroup(formData);
      setSuccessMessage(`Group "${createdGroup.name}" created successfully!`);
      setFormData({ name: '', description: '' });
      setIsFormVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex max-w-7xl justify-between mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Browse Groups
        </h1>
        <div className="relative inline-block">
          <Button onClick={() => setIsFormVisible(!isFormVisible)}>
            {isFormVisible ? 'Cancel' : 'Create New Group'}
          </Button>

          {
            isFormVisible && (
                <form onSubmit={handleSubmit} className="absolute shadow right-0 w-100 bg-[white] p-6">
                  <div style={{ marginBottom: '15px' }}>
                    <Label htmlFor="name">Group Name:</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
        
                  <div style={{ marginBottom: '15px' }}>
                    <Label htmlFor="description">Description:</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
        
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Group'}
                  </Button>
                </form>
            )}

            {error && (
              <div style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#ffebee',
                color: '#f44336',
                borderRadius: '4px'
              }}>
                {error}
              </div>
            )}

            {successMessage && (
              <div style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#e8f5e9',
                color: '#4CAF50',
                borderRadius: '4px'
              }}>
                {successMessage}
              </div>
            )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {groups.length === 0 ? (
          <p className="text-center text-gray-600">
            No groups available at this time.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id} 
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {group.name}
                  </h2>
                  <p className="text-gray-700 text-sm mb-4">
                    {group.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                  {/* <span>{group.memberCount} Members</span> */}
                  <Button>
                    View Group
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;
