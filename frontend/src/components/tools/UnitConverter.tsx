import React, { useEffect, useMemo, useRef, useState } from 'react';
import { reportService } from '../../services/api';
import { describeApiError, isCancel } from '../../utils/errors';
import { readJSON, writeJSON, StorageKeys } from '../../utils/storage';
import { CopyButton } from '../CopyButton';
import './UnitConverter.css';

type Category = 'length' | 'velocity' | 'pressure' | 'force' | 'temperature';

interface UnitInfo {
  key: string;
  label: string;
  category: Category;
}

const UNITS: UnitInfo[] = [
  { key: 'm',   label: 'Meters (m)',          category: 'length' },
  { key: 'ft',  label: 'Feet (ft)',           category: 'length' },
  { key: 'mm',  label: 'Millimeters (mm)',    category: 'length' },
  { key: 'in',  label: 'Inches (in)',         category: 'length' },
  { key: 'km',  label: 'Kilometers (km)',     category: 'length' },
  { key: 'mi',  label: 'Miles (mi)',          category: 'length' },
  { key: 'ms',  label: 'm/s',                 category: 'velocity' },
  { key: 'fts', label: 'ft/s',                category: 'velocity' },
  { key: 'kmh', label: 'km/h',                category: 'velocity' },
  { key: 'pa',  label: 'Pascal (Pa)',         category: 'pressure' },
  { key: 'mpa', label: 'Megapascal (MPa)',    category: 'pressure' },
  { key: 'psi', label: 'PSI',                 category: 'pressure' },
  { key: 'atm', label: 'Atmosphere (atm)',    category: 'pressure' },
  { key: 'n',   label: 'Newton (N)',          category: 'force' },
  { key: 'lbf', label: 'Pound-force (lbf)',   category: 'force' },
  { key: 'kn',  label: 'Kilonewton (kN)',     category: 'force' },
  { key: 'c',   label: 'Celsius (°C)',        category: 'temperature' },
  { key: 'f',   label: 'Fahrenheit (°F)',     category: 'temperature' },
  { key: 'k',   label: 'Kelvin (K)',          category: 'temperature' },
];

const CATEGORY_LABEL: Record<Category, string> = {
  length: 'Length',
  velocity: 'Velocity',
  pressure: 'Pressure',
  force: 'Force',
  temperature: 'Temperature',
};

const unitsByCategory = (
  ['length', 'velocity', 'pressure', 'force', 'temperature'] as Category[]
).map(cat => ({ cat, items: UNITS.filter(u => u.category === cat) }));

const categoryOf = (key: string): Category | undefined =>
  UNITS.find(u => u.key === key)?.category;

const PRECISION_CHOICES = [0, 1, 2, 3, 4, 6, 8] as const;

export const UnitConverterTool: React.FC = () => {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [result, setResult] = useState<{ value: number; to: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [precision, setPrecision] = useState<number>(() =>
    readJSON<number>(StorageKeys.unitPrecision, 4)
  );
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    writeJSON(StorageKeys.unitPrecision, precision);
  }, [precision]);

  const sameCategory = useMemo(
    () => categoryOf(fromUnit) === categoryOf(toUnit),
    [fromUnit, toUnit]
  );

  const handleConvert = async () => {
    setResult(null);
    setError(null);

    if (!value) {
      setError('Please enter a value');
      return;
    }
    const numericValue = parseFloat(value);
    if (Number.isNaN(numericValue)) {
      setError('Value must be a number');
      return;
    }
    if (!sameCategory) {
      setError('Pick two units from the same category');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const data = await reportService.convertUnits(numericValue, fromUnit, toUnit, {
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setResult({ value: Number(data.result), to: data.to_unit });
      }
    } catch (err) {
      if (isCancel(err)) return;
      setError(describeApiError(err, 'conversion'));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConvert();
    }
  };

  const renderOptions = () =>
    unitsByCategory.map(({ cat, items }) => (
      <optgroup key={cat} label={CATEGORY_LABEL[cat]}>
        {items.map(u => (
          <option key={u.key} value={u.key}>{u.label}</option>
        ))}
      </optgroup>
    ));

  const formattedResult = result ? `${result.value.toFixed(precision)} ${result.to}` : '';

  return (
    <div className="unit-converter">
      <div className="converter-input-group">
        <label htmlFor="uc-value">Value:</label>
        <input
          id="uc-value"
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter value"
          step="any"
          className="value-input"
        />
      </div>

      <div className="converter-units">
        <div className="unit-select-group">
          <label htmlFor="uc-from">From:</label>
          <select
            id="uc-from"
            value={fromUnit}
            onChange={e => setFromUnit(e.target.value)}
            className="unit-select"
          >
            {renderOptions()}
          </select>
        </div>

        <button
          type="button"
          className="swap-btn"
          onClick={handleSwapUnits}
          title="Swap units"
          aria-label="Swap from and to units"
        >
          ⇅
        </button>

        <div className="unit-select-group">
          <label htmlFor="uc-to">To:</label>
          <select
            id="uc-to"
            value={toUnit}
            onChange={e => setToUnit(e.target.value)}
            className="unit-select"
          >
            {renderOptions()}
          </select>
        </div>
      </div>

      <div className="converter-options">
        <label htmlFor="uc-precision" className="uc-precision-label">
          Decimals:
        </label>
        <select
          id="uc-precision"
          value={precision}
          onChange={e => setPrecision(parseInt(e.target.value, 10))}
          className="uc-precision-select"
          title="Number of decimal places"
        >
          {PRECISION_CHOICES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {!sameCategory && (
        <p className="uc-hint-warn">
          ⚠️ "{fromUnit}" and "{toUnit}" are different kinds of units.
        </p>
      )}

      <button
        type="button"
        onClick={handleConvert}
        disabled={loading || !sameCategory}
        className="convert-btn"
      >
        {loading ? '⏳ Converting…' : '🔄 Convert'}
      </button>

      {error && (
        <div className="result error" role="alert">
          <p>⚠️ {error}</p>
        </div>
      )}

      {result && !error && (
        <div className="result success">
          <div className="result-head">
            <h4>✓ Result</h4>
            <CopyButton text={formattedResult} compact />
          </div>
          <p className="result-value">{formattedResult}</p>
        </div>
      )}
    </div>
  );
};
