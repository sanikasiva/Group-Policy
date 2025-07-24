import React, { useState } from 'react';
import axios from 'axios';

// Simple RippleButton wrapper
function RippleButton({ onClick, disabled, style, children }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = e => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const newRipple = { x, y, size, key: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    onClick && onClick();
  };

  const cleanRipple = key => {
    setRipples(prev => prev.filter(r => r.key !== key));
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      className="button"
    >
      {children}
      {ripples.map(r => (
        <span
          key={r.key}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            pointerEvents: 'none',
            width: r.size,
            height: r.size,
            top: r.y,
            left: r.x,
            backgroundColor: 'rgba(255,255,255,0.7)',
            transform: 'scale(0)',
            animation: 'ripple 600ms linear'
          }}
          onAnimationEnd={() => cleanRipple(r.key)}
        />
      ))}
      {/* inline keyframes */}
      <style>{`
        @keyframes ripple {
          to { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </button>
  );
}

export default function PolicyDownloader({ sessionId, categories, selections }) {
  const [storeError, setStoreError] = useState('');

  const buildPolicyRules = () => {
    const lines = [];
    Object.entries(selections).forEach(([catId, { segments, changed }]) => {
      if (!changed) return;
      const category = categories.find(c => c.id === parseInt(catId, 10));
      if (!category) return;

      Object.entries(segments).forEach(([paramId, segMap]) => {
        const param = category.params.find(p => p.id === parseInt(paramId, 10));
        if (!param) return;

        const valSeg = param.segments.find(s => s.seg_name === 'val');
        if (!valSeg) return;
        const userVal = segMap[valSeg.id];
        if (
          userVal === undefined ||
          userVal === null ||
          userVal === '' ||
          (typeof userVal === 'object' &&
            Object.values(userVal).every(v => v === false || v === ''))
        ) {
          return;
        }

        let line = '';
        const sorted = [...param.segments].sort((a, b) => a.position - b.position);

        // ed_text dual-value
        if (
          param.config_type?.name === 'ed_text' &&
          typeof userVal === 'object' &&
          'text' in userVal
        ) {
          const state = userVal.choice;
          const valuesForState = valSeg.values.filter(v => v.state === state);
          const valueMap = {};
          valuesForState.forEach(v => {
            valueMap[v.value_number] = v.value;
          });
          sorted.forEach(seg => {
            if (seg.seg_name === 'pt') {
              line += seg.default_text;
            } else {
              const pos = seg.position;
              if (pos === 1 && valueMap[1] !== undefined) {
                line += valueMap[1];
              }
              if (pos === 3 && valueMap[2] !== undefined) {
                line += valueMap[2] === 'user' ? userVal.text : valueMap[2];
              }
            }
          });
        } else {
          // all other types
          sorted.forEach(seg => {
            if (seg.seg_name === 'pt') {
              line += seg.default_text;
            } else {
              const guiVal = segMap[seg.id];
              if (guiVal === undefined || guiVal === null || guiVal === '') return;
              const valDefs = seg.values || [];

              if (typeof guiVal === 'object') {
                if ('input' in guiVal) {
                  line += guiVal.input;
                } else if ('text' in guiVal) {
                  line += guiVal.text;
                } else {
                  const checked = Object.entries(guiVal)
                    .filter(([, ch]) => ch)
                    .map(([st]) => st);
                  const joined = checked.sort().join('|');
                  let exact = valDefs.find(v => v.state === joined);
                  if (!exact && checked.length === 2) {
                    exact = valDefs.find(v => v.state === 'Success|Failure');
                  }
                  if (exact) {
                    line += exact.value;
                  } else {
                    line += checked
                      .map(st => {
                        const d = valDefs.find(v => v.state === st);
                        return d?.value?.toLowerCase() || st.toLowerCase();
                      })
                      .join(',');
                  }
                }
              } else {
                const d = valDefs.find(v => v.value === guiVal || v.state === guiVal);
                line += d?.value === 'user' ? guiVal : d?.value || guiVal;
              }
            }
          });
        }

        lines.push(line);
      });
    });

    return `<PolicyRules>\n${lines.join('\n')}\n</PolicyRules>`;
  };

  const hasValidationError = () => {
    return Object.entries(selections).some(([catId, { segments, changed }]) => {
      if (!changed) return false;
      const category = categories.find(c => c.id === parseInt(catId, 10));
      if (!category) return false;

      return Object.entries(segments).some(([paramId, segMap]) => {
        const param = category.params.find(p => p.id === parseInt(paramId, 10));
        if (!param) return false;
        const valSeg = param.segments.find(s => s.seg_name === 'val');
        if (!valSeg) return false;

        const userVal = segMap[valSeg.id];
        const type    = param.config_type?.name;
        if (!userVal) return false;

        if (type === 'numeric') {
          const num = Number(userVal);
          return userVal !== '' && (num < param.min_value || num > param.max_value);
        }
        if (type === 'ed_nc_numeric') {
          const enabledDef = valSeg.values.find(v => v.state === 'Enabled');
          const code = enabledDef?.value;
          return userVal.choice === code && !userVal.input;
        }
        if (type === 'ed_text') {
          return userVal.choice === 'Enabled' && !userVal.text;
        }
        return false;
      });
    });
  };

  const downloadFile = () => {
    const xml = buildPolicyRules();
    const blob = new Blob([xml], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${sessionId || 'policy_output'}.policyrules`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const storeRecord = () => {
    setStoreError('');
    if (!sessionId) {
      setStoreError('Session ID is required to store the record.');
      return;
    }
    const xml = buildPolicyRules();
    axios
      .post('http://localhost:8000/api/sessions/', {
        session_id:   sessionId,
        file_content: xml
      })
      .catch(() => setStoreError('Failed to store record. Please try again.'));
  };

  const disabled = hasValidationError();

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <RippleButton
        onClick={downloadFile}
        disabled={disabled}
        style={{
          marginRight: 12,
          padding: '10px 20px',
          fontSize: '16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
      >
        Download the PolicyRules File
      </RippleButton>

      <RippleButton
        onClick={storeRecord}
        disabled={disabled}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
      >
        Store Record in Database
      </RippleButton>

      {storeError && (
        <p style={{ color: 'red', marginTop: '8px' }}>
          {storeError}
        </p>
      )}
    </div>
  );
}
