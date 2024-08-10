import React, { useState } from 'react';
import CacheService from './cacheService';
import './App.css';

function App() {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [getResult, setGetResult] = useState('');
  const [setValueResult, setSetValueResult] = useState('');
  const [defaultExpiration, setDefaultExpiration] = useState(40);

  const handleSetClick = async () => {
    try {
      const expiresInValue = expiresIn === '' ? defaultExpiration : parseInt(expiresIn);
      if (expiresInValue < 1 || expiresInValue > 60) {
        throw new Error('Expiration time must be between 1 and 60 seconds');
      }
      await CacheService.setKeyValue(key, value, expiresInValue);
      setSetValueResult('Key-Value set successfully');
      setGetResult('');
      setKey('');
      setValue('');
    } catch (error) {
      setSetValueResult('Failed to set Key-Value: ' + error.message);
    }
  };

  const handleGetClick = async () => {
    try {
      const response = await CacheService.getKeyValue(key);
      setGetResult(response.data.message || response.data.error);
      setSetValueResult('');
      setKey('');
      setValue('');
    } catch (error) {
      setGetResult('Failed to get value');
    }
  };

  const handleDeleteClick = async () => {
    try {
      await CacheService.deleteKeyValue(key);
      setSetValueResult('Key-Value pair deleted successfully');
      setGetResult('');
      setKey('');
      setValue('');
    } catch (error) {
      setSetValueResult('Failed to delete Key-Value pair');
    }
  };

  const handleExpiresInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 1 && Number(value) <= 60)) {
      setExpiresIn(value);
    } else {
      // Handle invalid input
      setExpiresIn('');
    }
  };

  return (
    <div className="app-container">
      <h1>LRU Cache React App</h1>
      <div className="form-container">
        <label>
          Key:
          <input id="key" type="text" value={key} onChange={(e) => setKey(e.target.value)} />
        </label>
        <br />
        <label>
          Value:
          <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <br />
        <label>
          Expires In (seconds):
          <input
            type="number"
            value={expiresIn}
            onChange={handleExpiresInputChange}
            placeholder="1-60"
          />
        </label>
        <br />
        <button onClick={handleSetClick} className="button">Set Value</button>
        <button onClick={handleGetClick} className="button">Get Value</button>
        {setValueResult && <p className="result">Set: {setValueResult}</p>}
        {getResult && <p className="result">Get Value Result: {getResult}</p>}
      </div>
    </div>
  );
}

export default App;