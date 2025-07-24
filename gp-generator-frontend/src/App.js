import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CategoryList     from './components/CategoryList';
import ParameterForm    from './components/ParameterForm';
import PolicyDownloader from './PolicyDownloader';

export default function App() {
  const [sessionId, setSessionId] = useState('');
  const [categories, setCategories] = useState([]);
  const [selections, setSelections] = useState({});
  const [openCats, setOpenCats]     = useState({});

  useEffect(() => {
     axios.get('http://localhost:8000/api/categories/')
      .then(res => {
        // alphabetical by category.name
        const sortedCats = [...res.data].sort((a, b) => a.name.localeCompare(b.name));
        setCategories(sortedCats);
      })
      .catch(console.error);
  }, []);

  const toggleSelectCategory = id => {
    setSelections(prev => {
      const isNowSelected = !prev[id]?.changed;
      const updated = {
        ...prev,
        [id]: {
          segments: prev[id]?.segments || {},
          changed: isNowSelected
        }
      };
      if (!isNowSelected) {
        setOpenCats(o => { const copy = { ...o }; delete copy[id]; return copy; });
      } else {
        setOpenCats(o => ({ ...o, [id]: true }));
      }
      return updated;
    });
  };

  const toggleOpenOnly = id => {
    setOpenCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const reorderCategoryToTop = id => {
    setCategories(prev => {
      const selected = prev.find(cat => cat.id === id);
      const others = prev.filter(cat => cat.id !== id);
      return [selected, ...others];
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Group Policy Generator</h1>
      </header>

      {/* Session ID input */}
      <section className="card">
        <h2>Session ID</h2>
        <input
          type="text"
          placeholder="Enter session ID"
          value={sessionId}
          onChange={e => setSessionId(e.target.value)}
          style={{ width:'100%', padding:8, boxSizing:'border-box' }}
        />
      </section>

      {/* Category selector */}
      <section className="card">
        <h2>Select Policy Categories</h2>
        <CategoryList
          categories={categories}
          selections={selections}
          toggleSelectCategory={toggleSelectCategory}
          reorderCategoryToTop={reorderCategoryToTop}
        />
      </section>

      {/* Parameters */}
      <section className="card param-section">
        <h2>Parameters</h2>
        {categories.map(cat => {
          const sel = selections[cat.id];
          if (!sel?.changed) return null;

          const isOpen = openCats[cat.id];
          return (
            <div
              key={cat.id}
              className="param-card"
              style={{
                position: 'relative',
                border: '1px solid #dde2e6',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                background: '#fff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h3 style={{ flexGrow: 1, margin: 0 }}>
                  Category: {cat.name}
                </h3>
                <button
                  onClick={() => toggleOpenOnly(cat.id)}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    background: 'none',
                    width: '32px',
                    height: '32px',
                    fontSize: '18px',
                    cursor: 'pointer'
                  }}
                  title={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? '−' : '+'}
                </button>
              </div>

              {isOpen && (
                <div style={{ marginTop: '16px' }}>
                  <ParameterForm
                    category={cat}
                    selections={selections}
                    setSelections={setSelections}
                  />
                </div>
              )}
            </div>
          );
        })}

        {!Object.values(selections).some(s => s.changed) && (
          <p style={{ color: '#666' }}>No categories selected.</p>
        )}
      </section>

      {/* Download button */}
      <div style={{ textAlign: 'center' }}>
        <PolicyDownloader
          sessionId={sessionId}
          categories={categories}
          selections={selections}
        />
      </div>
    </div>
  );
}
