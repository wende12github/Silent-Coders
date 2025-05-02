import React from 'react';
import { BookOpen, Clock } from 'lucide-react';

interface Skill {
  id: string;
  title: string;
  description: string;
  type: 'offering' | 'seeking';
  credits: number;
}

interface SkillCardProps {
  skill: Skill;
  onClick?: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onClick }) => {
  const isOffering = skill.type === 'offering';
  
  return (
    <div
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${isOffering ? 'bg-green-100' : 'bg-blue-100'}`}>
            <BookOpen className={`h-5 w-5 ${isOffering ? 'text-green-500' : 'text-blue-500'}`} />
          </div>
          <h3 className="ml-2 text-lg font-medium text-gray-900">{skill.title}</h3>
        </div>
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
      <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
      <div className="flex items-center text-sm text-gray-500">
        <Clock className="h-4 w-4 mr-1" />
        <span>{skill.credits} credits/hour</span>
      </div>
    </div>
  );
};

export default SkillCard;