import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/api';
import './UnitConverter.css';

export const UnitConverterTool: React.FC = () => {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const unitOptions = {
    length: { label: 'Length', units: ['m', 'ft', 'mm', 'in', 'km', 'mi'] },
    velocity: { label: 'Velocity', units: ['ms', 'fts', 'kmh'] },
    pressure: { label: 'Pressure', units: ['pa', 'mpa', 'psi', 'atm'] },
    force: { label: 'Force', units: ['n', 'lbf', 'kn'] },
    temperature: { label: 'Temperature', units: ['c', 'f', 'k'] },
  };

  const unitLabels: { [key: string]: string } = {
    m: 'Meters (m)',
    ft: 'Feet (ft)',
    mm: 'Millimeters (mm)',
    in: 'Inches (in)',
    km: 'Kilometers (km)',
    mi: 'Miles (mi)',
    ms: 'm/s',
    fts: 'ft/s',
    kmh: 'km/h',
    pa: 'Pascal (Pa)',
    mpa: 'Megapascal (MPa)',
    psi: 'PSI',
    atm: 'Atmosphere (atm)',
    n: 'Newton (N)',
    lbf: 'Pound-force (lbf)',
    kn: 'Kilonewton (kN)',
    c: 'Celsius (°C)',
    f: 'Fahrenheit (°F)',
    k: 'Kelvin (K)',
  };

  const handleConvert = async () => {
    if (!value) {
      alert('Please enter a value');
      return;
    }
    setLoading(true);
    try {
      const data = await reportService.convertUnits(
        parseFloat(value),
        fromUnit,
        toUnit
      );
      setResult(`${data.result.toFixed(4)} ${data.to_unit}`);
    } catch (error) {
      console.error('Conversion error:', error);
      setResult('❌ Conversion not available');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    setResult('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConvert();
    }
  };

  return (
    <div className="unit-converter">
      <div className="converter-input-group">
        <label>Value:</label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter value"
          step="any"
          className="value-input"
        />
      </div>

      <div className="converter-units">
        <div className="unit-select-group">
          <label>From:</label>
          <select 
            value={fromUnit} 
            onChange={(e) => setFromUnit(e.target.value)}
            className="unit-select"
          >
            {Object.entries(unitLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <button className="swap-btn" onClick={handleSwapUnits} title="Swap units">
          ⇅
        </button>

        <div className="unit-select-group">
          <label>To:</label>
          <select 
            value={toUnit} 
            onChange={(e) => setToUnit(e.target.value)}
            className="unit-select"
          >
            {Object.entries(unitLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <button 
        onClick={handleConvert} 
        disabled={loading}
        className="convert-btn"
      >
        {loading ? '⏳ Converting...' : '🔄 Convert'}
      </button>

      {result && (
        <div className="result success">
          <h4>✓ Result</h4>
          <p className="result-value">{result}</p>
        </div>
      )}
    </div>
  );
};
