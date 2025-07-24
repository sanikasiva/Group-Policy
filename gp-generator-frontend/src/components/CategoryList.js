import React from 'react';

export default function CategoryList({
  categories,
  selections,
  toggleSelectCategory,
  reorderCategoryToTop
}) {
  return (
    <div className="checkbox-grid">
      {categories.map(cat => (
        <label
          key={cat.id}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <input
            type="checkbox"
            checked={!!selections[cat.id]?.changed}
            onChange={() => {
              toggleSelectCategory(cat.id);
              reorderCategoryToTop(cat.id);
            }}
            style={{ marginRight: '8px', transform: 'scale(1.2)' }}
          />
          <span style={{ fontWeight: selections[cat.id]?.changed ? '600' : '400' }}>
            {cat.name}
          </span>
        </label>
      ))}
    </div>
  );
}
