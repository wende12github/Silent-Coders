import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';

interface User {
  id: string;
  name: string;
  profilePicture: string;
}

interface Skill {
  id: string;
  user: User;
  title: string;
  description: string;
  type: 'offering' | 'seeking';
  credits: number;
  location: string;
  tags: string[];
}

interface UserSkillCardProps {
  skill: Skill;
}

const UserSkillCard: React.FC<UserSkillCardProps> = ({ skill }) => {
  const isOffering = skill.type === 'offering';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-transform duration-200 hover:shadow-md hover:-translate-y-1">
      <div 
        className={`px-4 py-3 flex items-center justify-between ${
          isOffering ? 'bg-green-50' : 'bg-blue-50'
        }`}
      >
        <Link to={`/profile/${skill.user.id}`} className="flex items-center">
          <img 
            src={skill.user.profilePicture} 
            alt={skill.user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="ml-2 text-sm font-medium text-gray-900">{skill.user.name}</span>
        </Link>
        <div 
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            isOffering 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {isOffering ? 'Offering' : 'Seeking'}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{skill.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{skill.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Clock className="h-4 w-4 mr-1" />
          <span>{skill.credits} credits/hour</span>
          <div className="mx-2 h-1 w-1 rounded-full bg-gray-300"></div>
          <MapPin className="h-4 w-4 mr-1" />
          <span>{skill.location}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {skill.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <button
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Request Session
        </button>
      </div>
    </div>
  );
};

export default UserSkillCard;