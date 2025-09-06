import React from 'react';
import { getConditionOptions } from '../config/categories';

const ConditionFilter = ({ selectedCondition, onConditionChange, className = '' }) => {
  const conditionOptions = getConditionOptions();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Condition:
      </label>
      <select
        value={selectedCondition}
        onChange={(e) => onConditionChange(e.target.value)}
        className="input-field py-2 px-3 text-sm min-w-[140px] bg-white border-gray-300 focus:border-primary focus:ring-primary"
      >
        <option value="">All Conditions</option>
        {conditionOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ConditionFilter;