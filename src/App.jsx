import { useState } from 'react';
import Layout from './components/Layout';
import Estudantes from './components/estudantes';
import PresencaRegistro from './components/presencaRegistro';
import Dashboard from './components/dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('students');

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <Estudantes />;
      case 'presence':
        return <PresencaRegistro />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <Estudantes />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;