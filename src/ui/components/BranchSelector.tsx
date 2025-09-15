import React from 'react';

const BranchSelector: React.FC = () => {
  return (
    <div>
      <label htmlFor="branch-selector">Branch:</label>
      <select id="branch-selector">
        <option>Main</option>
      </select>
    </div>
  );
};

export default BranchSelector;
