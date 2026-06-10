function Layout({ children, activeTab, setActiveTab }) {
  const tabs = [
    { id: 'students', label: 'Alunos' },
    { id: 'presence', label: 'Registrar Presença' },
    { id: 'dashboard', label: 'Dashboard' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#bcd3e7] via-[#b8cfe2] to-[#a8c5d8]">
      <header className="bg-gradient-to-r from-[#2e1727] to-[#452238] text-white shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestor de Frequência</h1>
              <p className="text-sm opacity-90">Sistema inteligente de gerenciamento de presença de alunos</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-1 mb-8 pb-4 border-b-2 border-white/30 bg-white/40 rounded-lg p-1 backdrop-blur-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 font-semibold transition-all duration-200 rounded-md ${
                activeTab === tab.id
                  ? 'bg-white text-[#2e1727] shadow-md'
                  : 'text-[#2e1727]/70 hover:text-[#2e1727]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}

export default Layout;