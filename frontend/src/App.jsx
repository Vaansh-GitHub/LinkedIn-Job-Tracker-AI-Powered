import React, { useState } from 'react';
import PreferenceForm from './components/PreferenceForm';
import PreferenceDisplay from './components/PreferenceDisplay';
import axios from 'axios';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const handleSave = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await axios.post('http://localhost:5000/agent/search');
      alert(`Success: ${response.data.message}`);
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to start search';
      alert(`Error: ${msg}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <header>
        <h1>Adaptive Job Agent</h1>
      </header>

      <main className="grid-layout">
        <section>
          <PreferenceForm onSave={handleSave} />
        </section>

        <section>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              onClick={handleSearch}
              className="btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '1.1rem', backgroundColor: '#2ecc71' }}
              disabled={isSearching}
            >
              {isSearching ? 'Starting Agent...' : 'Start Job Search Agent'}
            </button>
          </div>
          <PreferenceDisplay refreshTrigger={refreshKey} />
        </section>
      </main >
    </>
  );
}

export default App;
