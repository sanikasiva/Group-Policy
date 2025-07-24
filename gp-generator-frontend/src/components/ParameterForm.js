import React from 'react';

export default function ParameterForm({ category, selections, setSelections }) {
 // sort parameters alphabetically by name
  const params = (category.params || []).slice().sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const updateValue = (paramId, segId, val) => {
    setSelections(prev => {
      const catSel = prev[category.id] || { segments: {}, changed: true };
      return {
        ...prev,
        [category.id]: {
          segments: {
            ...catSel.segments,
            [paramId]: {
              ...(catSel.segments[paramId] || {}),
              [segId]: val
            }
          },
          changed: catSel.changed
        }
      };
    });
  };

  return (
    <div className="param-card">
      <h3>Category: {category.name}</h3>
      {params.length === 0 ? (
        <p style={{ color: '#666' }}>No parameters available.</p>
      ) : (
        params.map(param => {
          const segs = param.segments || [];
          const valSeg = segs.find(s => s.seg_name === 'val');
          const type = param.config_type?.name;
          const values = valSeg?.values || [];
          const current = selections[category.id]?.segments[param.id] || {};
          const enabledValNum = values.find(v => v.state === 'Enabled')?.value;

          const numericVal =
            type === 'numeric' ? current[valSeg.id] :
            type === 'ed_nc_numeric' ? current[valSeg.id]?.input : null;

          const invalidNumeric =
            numericVal !== null && numericVal !== '' &&
            (Number(numericVal) < param.min_value || Number(numericVal) > param.max_value);

          return (
            <div key={param.id} style={{ marginBottom: 16 }}>
              <strong>{param.name}</strong>
              <div style={{ marginTop: 8 }}>
                {param.config_type?.id === 9 && valSeg && (
                  <select
                    value={current[valSeg.id] || ''}
                    onChange={e => updateValue(param.id, valSeg.id, e.target.value)}
                    style={{ marginTop: 6, padding: 6, width: '100%' }}
                  >
                    <option value="Automatically deny elevation requests">Automatically deny elevation requests</option>
                    <option value="Prompt for credentials on the secure desktop">Prompt for credentials on the secure desktop</option>
                    <option value="Not Defined">Not Defined</option>
                    <option value="Prompt for credentials">Prompt for credentials</option>
                  </select>
                )}

                {(type === 'ed' || type === 'ed_nc') && valSeg && (
                  <div>
                    {values.map(v => (
                      <label key={v.id} style={{ marginRight: 12 }}>
                        <input
                          type="radio"
                          name={`param-${param.id}`}
                          checked={current[valSeg.id] === v.value}
                          onChange={() => updateValue(param.id, valSeg.id, v.value)}
                        />
                        {v.state}
                      </label>
                    ))}
                  </div>
                )}

                {type === 'ed_text' && valSeg && (
                  <>
                    <div>
                      {[...new Set(values.map(v => v.state))].map(state => (
                        <label key={state} style={{ marginRight: 12 }}>
                          <input
                            type="radio"
                            name={`param-${param.id}`}
                            checked={current[valSeg.id]?.choice === state}
                            onChange={() => updateValue(param.id, valSeg.id, { choice: state, text: '' })}
                          />
                          {state}
                        </label>
                      ))}
                    </div>
                    {current[valSeg.id]?.choice === 'Enabled' && (
                      <input
                        type="text"
                        placeholder="Enter text"
                        value={current[valSeg.id].text || ''}
                        onChange={e => updateValue(param.id, valSeg.id, { choice: 'Enabled', text: e.target.value })}
                        style={{ display: 'block', marginTop: 8, padding: 6, width: '100%', boxSizing: 'border-box' }}
                      />
                    )}
                  </>
                )}

                {type === 'ed_nc_numeric' && valSeg && (
                  <>
                    <div>
                      {values.map(v => (
                        <label key={v.id} style={{ marginRight: 12 }}>
                          <input
                            type="radio"
                            name={`param-${param.id}`}
                            checked={current[valSeg.id]?.choice === v.value}
                            onChange={() => updateValue(param.id, valSeg.id, { choice: v.value, input: '' })}
                          />
                          {v.state}
                        </label>
                      ))}
                    </div>
                    {current[valSeg.id]?.choice === enabledValNum && (
                      <>
                        <input
                          type="number"
                          placeholder="Enter value"
                          value={current[valSeg.id]?.input || ''}
                          onChange={e => updateValue(param.id, valSeg.id, { choice: enabledValNum, input: e.target.value })}
                          min={param.min_value}
                          max={param.max_value}
                          style={{
                            display: 'block',
                            marginTop: 8,
                            padding: 6,
                            width: '100%',
                            boxSizing: 'border-box',
                            borderColor: invalidNumeric ? 'red' : undefined
                          }}
                        />
                        {invalidNumeric && (
                          <p style={{ color: 'red', marginTop: 4 }}>
                            Value must be between {param.min_value} and {param.max_value}.
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}

                {type === 'sf_both' && valSeg && (
                  <div>
                    {['Success', 'Failure'].map(state => (
                      <label key={state} style={{ display: 'block', marginBottom: 4 }}>
                        <input
                          type="checkbox"
                          checked={current[valSeg.id]?.[state] || false}
                          onChange={e => updateValue(param.id, valSeg.id, { ...current[valSeg.id], [state]: e.target.checked })}
                        />
                        {state}
                      </label>
                    ))}
                  </div>
                )}

                {(type === 'numeric' || type === 'textfield') && valSeg && (
                  <>
                    <input
                      type={type === 'numeric' ? 'number' : 'text'}
                      placeholder={type === 'numeric' ? 'Enter numeric' : 'Enter text'}
                      value={current[valSeg.id] || ''}
                      onChange={e => updateValue(param.id, valSeg.id, e.target.value)}
                      min={type === 'numeric' ? param.min_value : undefined}
                      max={type === 'numeric' ? param.max_value : undefined}
                      style={{
                        display: 'block',
                        marginTop: 8,
                        padding: 6,
                        width: '100%',
                        boxSizing: 'border-box',
                        borderColor: invalidNumeric && type === 'numeric' ? 'red' : undefined
                      }}
                    />
                    {invalidNumeric && type === 'numeric' && (
                      <p style={{ color: 'red', marginTop: 4 }}>
                        Value must be between {param.min_value} and {param.max_value}.
                      </p>
                    )}
                  </>
                )}

                {param.best_practice && valSeg && (
                  <button
                    onClick={e => {
                      e.preventDefault();
                      if (param.config_type?.id === 9) {
                        updateValue(param.id, valSeg.id, param.best_practice);
                      } else if (type === 'ed' || type === 'ed_nc') {
                        const bp = values.find(v => v.state === param.best_practice);
                        if (bp) updateValue(param.id, valSeg.id, bp.value);
                      } else if (type === 'ed_text') {
                        updateValue(param.id, valSeg.id, { choice: 'Enabled', text: param.best_practice });
                      } else if (type === 'ed_nc_numeric') {
                        updateValue(param.id, valSeg.id, { choice: enabledValNum, input: param.best_practice });
                      } else if (type === 'sf_both') {
                        const states = param.best_practice.split(/[,|]/).map(s => s.trim());
                        const m = {};
                        states.forEach(s => m[s] = true);
                        updateValue(param.id, valSeg.id, m);
                      } else {
                        updateValue(param.id, valSeg.id, param.best_practice);
                      }
                    }}
                    className="button"
                    style={{ marginTop: 10 }}
                  >
                    Best Practice
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
