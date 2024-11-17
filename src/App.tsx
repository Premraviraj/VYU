import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import LocalConfigPage from './components/LocalConfigPage';
import { GraphProvider } from './context/GraphContext';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <GraphProvider>
        <LocalConfigPage />
      </GraphProvider>
    </BrowserRouter>
  );
};

export default App;
