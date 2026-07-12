import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { wsService } from './services/ws';
import { useStore } from './store/useStore';
import { api } from './services/api';

import Editor from './pages/Editor';
import Controller from './pages/Controller';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  const { setProfiles, setCurrentProfileId } = useStore();

  useEffect(() => {
    // Initialize WS connection
    wsService.connect();

    // Load initial data
    const loadData = async () => {
      try {
        const profiles = await api.getProfiles();
        setProfiles(profiles);
        if (profiles.length > 0) {
          const defaultProfile = profiles.find((p: any) => p.is_default) || profiles[0];
          setCurrentProfileId(defaultProfile.id);
        }
      } catch (err) {
        console.error("Failed to load profiles:", err);
      }
    };
    loadData();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/controller" element={<Controller />} />
        
        {/* Editor Routes inside a layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/editor" replace />} />
          <Route path="editor" element={<Editor />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
