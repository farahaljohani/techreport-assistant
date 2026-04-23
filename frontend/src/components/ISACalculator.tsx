import React, { useState } from 'react';
import './ISACalculator.css';

export const ISACalculator: React.FC = () => {
  const [altitude, setAltitude] = useState('0');
  const [results, setResults] = useState<any>(null);

  const calculateISA = () => {
    const alt = parseFloat(altitude);
    
    // ISA Standard Atmosphere equations
    let temp, pressure, density;

    if (alt <= 11000) {
      // Troposphere
      const L = -0.0065; // Temperature lapse rate K/m
      const T0 = 288.15; // Sea level temperature K
      const P0 = 101325; // Sea level pressure Pa
      const g = 9.80665;
      const M = 0.02896; // Molar mass of air kg/mol
      const R = 8.31447; // Gas constant J/mol/K

      temp = T0 + L * alt;
      pressure = P0 * Math.pow(T0 / temp, -g * M / (R * L));
      density = (pressure * M) / (R * temp);
    } else {
      // Stratosphere (simplified)
      temp = 216.65;
      pressure = 101325 * Math.pow(0.5, alt / 6384);
      density = (pressure * 0.02896) / (8.31447 * temp);
    }

    setResults({
      altitude: alt,
      temperature: (temp - 273.15).toFixed(2), // Convert to Celsius
      temperatureK: temp.toFixed(2),
      pressure: (pressure / 1000).toFixed(2), // Convert to kPa
      pressurePa: pressure.toFixed(2),
      density: density.toFixed(4)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculateISA();
    }
  };

  return (
    <div className="isa-calculator">
      <h3>🌍 ISA Calculator</h3>

      <div className="isa-input-group">
        <label htmlFor="isa-altitude">Altitude (m)</label>
        <input
          id="isa-altitude"
          type="number"
          value={altitude}
          onChange={e => setAltitude(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="0"
          className="isa-input"
        />
      </div>

      <button type="button" onClick={calculateISA} className="isa-btn">
        📊 Calculate
      </button>

      {results && (
        <div className="isa-results">
          <div className="result-item">
            <label>Temperature</label>
            <p>{results.temperature}°C</p>
            <small>{results.temperatureK}K</small>
          </div>

          <div className="result-item">
            <label>Pressure</label>
            <p>{results.pressure}kPa</p>
            <small>{parseInt(results.pressurePa)} Pa</small>
          </div>

          <div className="result-item">
            <label>Density</label>
            <p>{results.density} kg/m³</p>
          </div>
        </div>
      )}

      <p className="isa-note">International Standard Atmosphere</p>
    </div>
  );
};
