import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentFrequency, setStudentFrequency] = useState([]);
  const [dateFrequency, setDateFrequency] = useState([]);
  const [kpis, setKpis] = useState({
    totalStudents: 0,
    avgPresence: 0,
    lowFrequencyCount: 0
  });

  const calculateMetrics = (studentsList, presencesList) => {
    const totalStudents = studentsList.length;
    
    const freqMap = {};
    studentsList.forEach(student => {
      const studentPresences = presencesList.filter(p => p.aluno_id === student.id);
      const totalClasses = studentPresences.length;
      const presents = studentPresences.filter(p => p.status === true).length;
      const frequency = totalClasses > 0 ? (presents / totalClasses) * 100 : 0;
      freqMap[student.id] = {
        nome: student.nome,
        matricula: student.matricula,
        frequency: Math.round(frequency * 100) / 100,
        presents,
        absences: totalClasses - presents,
        totalClasses
      };
    });

    const studentFrequencyArray = Object.values(freqMap);
    setStudentFrequency(studentFrequencyArray);

    const avgPresence = studentFrequencyArray.length > 0
      ? studentFrequencyArray.reduce((sum, s) => sum + s.frequency, 0) / studentFrequencyArray.length
      : 0;

    const lowFrequencyCount = studentFrequencyArray.filter(s => s.frequency < 75).length;

    setKpis({
      totalStudents,
      avgPresence: Math.round(avgPresence * 100) / 100,
      lowFrequencyCount
    });

    const dateMap = {};
    presencesList.forEach(p => {
      const date = p.data;
      if (!dateMap[date]) {
        dateMap[date] = { date, presents: 0, absences: 0 };
      }
      if (p.status === true) {
        dateMap[date].presents++;
      } else {
        dateMap[date].absences++;
      }
    });

    const dateFrequencyArray = Object.values(dateMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(d => ({
        ...d,
        date: format(parseISO(d.date), 'dd/MM/yyyy')
      }));
    
    setDateFrequency(dateFrequencyArray);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, presencesRes] = await Promise.all([
        supabase.from('alunos').select('*'),
        supabase.from('presencas').select('*, alunos(nome, matricula)')
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (presencesRes.error) throw presencesRes.error;

      setStudents(studentsRes.data || []);
      setPresences(presencesRes.data || []);
      calculateMetrics(studentsRes.data || [], presencesRes.data || []);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };

    fetchData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#2e1727]">Carregando dados do dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">Nenhum dado disponivel. Cadastre alunos e registre presencas.</p>
      </div>
    );
  }

  if (presences.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">Nenhum registro de presenca encontrado. Registre presencas para ver os graficos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Total de Alunos</h3>
          <p className="text-3xl font-bold text-[#2e1727] mt-2">{kpis.totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Media de Presenca</h3>
          <p className="text-3xl font-bold text-[#2e1727] mt-2">{kpis.avgPresence}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Alunos com Frequencia Baixa</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{kpis.lowFrequencyCount}</p>
          <p className="text-xs text-gray-500">Abaixo de 75%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-[#2e1727] mb-4">Frequencia por Aluno</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={studentFrequency}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="frequency" name="Frequencia %" fill="#2e1727">
              {studentFrequency.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.frequency < 75 ? '#ef4444' : '#2e1727'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-[#2e1727] mb-4">Historico de Presencas por Data</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dateFrequency}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="presents" name="Presentes" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="absences" name="Faltas" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-[#2e1727] mb-4">Detalhamento dos Alunos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Aluno</th>
                <th className="px-4 py-2 text-left">Matricula</th>
                <th className="px-4 py-2 text-center">Frequencia</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {studentFrequency.map((student) => (
                <tr key={student.matricula} className="border-t">
                  <td className="px-4 py-2">{student.nome}</td>
                  <td className="px-4 py-2">{student.matricula}</td>
                  <td className="px-4 py-2 text-center font-semibold">
                    {student.frequency}%
                  </td>
                  <td className="px-4 py-2 text-center">
                    {student.frequency < 75 ? (
                      <span className="text-red-600 font-semibold">Abaixo da media</span>
                    ) : (
                      <span className="text-green-600 font-semibold">Regular</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;