import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

function Estudantes() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ nome: '', matricula: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchEstudantes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      setError('Erro ao carregar alunos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchEstudantes();
    };

    loadData();
  }, [fetchEstudantes]);

  const validateForm = async () => {
    if (!formData.nome.trim()) {
      setError('Nome é obrigatorio');
      return false;
    }
    if (!formData.matricula.trim()) {
      setError('Matricula é obrigatoria');
      return false;
    }
    
    const existingStudent = students.find(s => 
      s.matricula === formData.matricula && s.id !== editingId
    );
    if (existingStudent) {
      setError('Matricula ja cadastrada');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!await validateForm()) return;
    
    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('alunos')
          .update({ nome: formData.nome, matricula: formData.matricula })
          .eq('id', editingId);
        
        if (error) throw error;
        setSuccess('Aluno atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('alunos')
          .insert([{ nome: formData.nome, matricula: formData.matricula }]);
        
        if (error) throw error;
        setSuccess('Aluno cadastrado com sucesso');
      }
      
      setFormData({ nome: '', matricula: '' });
      setEditingId(null);
      fetchEstudantes();
    } catch (err) {
      setError('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setFormData({ nome: student.nome, matricula: student.matricula });
    setEditingId(student.id);
    setError(null);
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Deseja realmente excluir o aluno ${student.nome}?`)) return;
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', student.id);
      
      if (error) throw error;
      setSuccess('Aluno excluido com sucesso');
      fetchEstudantes();
    } catch (err) {
      setError('Erro ao excluir: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ nome: '', matricula: '' });
    setEditingId(null);
    setError(null);
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-[#2e1727] font-semibold">Carregando alunos...</div>
        </div>
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
        <h2 className="section-title">
          {editingId ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#2e1727] mb-2">Nome Completo</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="input-field"
                placeholder="João Silva Santos"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2e1727] mb-2">Matrícula</label>
              <input
                type="text"
                value={formData.matricula}
                onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                className="input-field"
                placeholder="2024001"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 md:flex-none" disabled={loading}>
              {loading ? 'Carregando...' : editingId ? 'Atualizar' : 'Cadastrar'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card-container p-8">
        <h2 className="section-title">Lista de Alunos ({students.length})</h2>
        {students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum aluno cadastrado ainda</p>
            <p className="text-gray-400 text-sm mt-2">Comece adicionando alunos ao sistema</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#2e1727]/10 to-[#452238]/10">
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#2e1727]">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#2e1727]">Matrícula</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-[#2e1727]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id} className={`border-b transition-colors ${idx % 2 === 0 ? 'bg-white/50' : 'bg-white'} hover:bg-blue-50/50`}>
                    <td className="px-6 py-4 font-medium text-[#2e1727]">{student.nome}</td>
                    <td className="px-6 py-4 text-gray-600">{student.matricula}</td>
                    <td className="px-6 py-4 text-center space-x-3">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Estudantes;