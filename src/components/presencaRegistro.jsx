import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

function PresencaRegistro() {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [presences, setPresences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadEstudantes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      setError('Erro ao carregar alunos: ' + err.message);
    }
  }, []);

  const loadPresences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('presencas')
        .select('*')
        .eq('data', selectedDate);
      
      if (error) throw error;
      
      const presenceMap = {};
      data.forEach(p => {
        presenceMap[p.aluno_id] = p.status;
      });
      setPresences(presenceMap);
    } catch (err) {
      setError('Erro ao carregar presencas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const loadData = async () => {
      await loadEstudantes();
    };

    loadData();
  }, [loadEstudantes]);

  useEffect(() => {
    if (students.length > 0) {
      const loadData = async () => {
        await loadPresences();
      };

      loadData();
    }
  }, [selectedDate, students, loadPresences]);

  const handlePresenceChange = (alunoId, status) => {
    setPresences(prev => ({
      ...prev,
      [alunoId]: status
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const records = Object.entries(presences).map(([alunoId, status]) => ({
        aluno_id: parseInt(alunoId),
        data: selectedDate,
        status
      }));
      
      for (const record of records) {
        const { error } = await supabase
          .from('presencas')
          .upsert(record, { onConflict: 'aluno_id,data' });
        
        if (error) throw error;
      }
      
      setSuccess('Presenca registrada com sucesso');
    } catch (err) {
      setError('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (students.length === 0) {
    return (
      <div className="card-container p-12 text-center">
        <p className="text-gray-500 text-lg font-medium">Nenhum aluno cadastrado</p>
        <p className="text-gray-400 text-sm mt-2">Cadastre alunos primeiro na aba Alunos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100/90 backdrop-blur-sm border-l-4 border-red-600 text-red-800 px-6 py-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-green-100/90 backdrop-blur-sm border-l-4 border-green-600 text-green-800 px-6 py-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      <div className="card-container p-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#2e1727] mb-3">
            Selecione a Data
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field max-w-xs"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-[#2e1727] font-semibold">Carregando registros...</div>
          </div>
        ) : (
          <>
            <h2 className="section-title mb-6">Registrar Presença</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#2e1727]/10 to-[#452238]/10">
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2e1727]">Aluno</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#2e1727]">Matrícula</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-[#2e1727]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.id} className={`border-b transition-colors ${idx % 2 === 0 ? 'bg-white/50' : 'bg-white'} hover:bg-blue-50/50`}>
                      <td className="px-6 py-4 font-medium text-[#2e1727]">{student.nome}</td>
                      <td className="px-6 py-4 text-gray-600">{student.matricula}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-6 justify-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`presence-${student.id}`}
                              checked={presences[student.id] === true}
                              onChange={() => handlePresenceChange(student.id, true)}
                              className="w-4 h-4 accent-green-600"
                            />
                            <span className="text-green-600 font-semibold">Presente</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`presence-${student.id}`}
                              checked={presences[student.id] === false}
                              onChange={() => handlePresenceChange(student.id, false)}
                              className="w-4 h-4 accent-red-600"
                            />
                            <span className="text-red-600 font-semibold">Falta</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Salvando...' : 'Salvar Registro'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PresencaRegistro;