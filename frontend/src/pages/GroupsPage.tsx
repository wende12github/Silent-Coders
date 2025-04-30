import React from 'react';
import { Tab } from '@headlessui/react';
import { UserGroupIcon, TrophyIcon } from '@heroicons/react/24/outline';

interface Member {
  id: string;
  name: string;
  avatar: string;
  credits: number;
}

const members: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
    credits: 85,
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    credits: 120,
  },
  {
    id: '3',
    name: 'Michael Brown',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    credits: 65,
  },
];

const sortedMembers = [...members].sort((a, b) => b.credits - a.credits);

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

const GroupsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
        <UserGroupIcon className="h-7 w-7 text-blue-600 mr-2" />
        Group Members
      </h1>

      <Tab.Group>
        <Tab.List className="flex space-x-2 border-b border-gray-200 mb-4">
          <Tab
            className={({ selected }) =>
              classNames(
                'px-4 py-2 text-sm font-medium rounded-t',
                selected
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              )
            }
          >
            Members List
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'px-4 py-2 text-sm font-medium rounded-t',
                selected
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              )
            }
          >
            Leaderboard
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4 hover:shadow-md transition"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.credits} Credits</p>
                  </div>
                </div>
              ))}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-md shadow-sm overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Credits
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member, index) => (
                    <tr key={member.id} className="border-t">
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {index === 0 ? (
                          <span className="inline-flex items-center font-semibold text-yellow-500">
                            <TrophyIcon className="h-5 w-5 mr-1" />
                            1
                          </span>
                        ) : (
                          index + 1
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-800">{member.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.credits} credits</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default GroupsPage;
