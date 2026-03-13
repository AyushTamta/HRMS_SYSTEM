import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://localhost:5000/api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee_id: '', name: '', email: '', department: '' });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    const res = await axios.get(`${API}/employees`);
    setEmployees(res.data);
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/employees`, form);
      setForm({ employee_id: '', name: '', email: '', department: '' });
      fetchEmployees();
    } catch (err) { alert(err.response.data.error); }
  };

  const markAttendance = async (empId, status) => {
    await axios.post(`${API}/attendance`, {
      employee_id: empId,
      date: new Date().toISOString().split('T')[0],
      status
    });
    alert(`Marked ${status} for ${empId}`);
  };

const stats = {
  total: employees.length,
  depts: [...new Set(employees.map(e => e.department))].length,
};



  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">HRMS Lite</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
  <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
    <p className="text-blue-800 text-sm font-semibold uppercase">Total Employees</p>
    <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
  </div>
  <div className="bg-purple-100 p-4 rounded-lg border border-purple-200">
    <p className="text-purple-800 text-sm font-semibold uppercase">Departments</p>
    <p className="text-3xl font-bold text-purple-900">{stats.depts}</p>
  </div>
</div>





      {/* Add Employee Form */}



      <form onSubmit={addEmployee} className="bg-white p-6 rounded shadow-md mb-8 grid grid-cols-4 gap-4">
        <input className="border p-2 rounded" placeholder="Emp ID" value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} required />
        <input className="border p-2 rounded" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input className="border p-2 rounded" type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <input className="border p-2 rounded" placeholder="Department" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
        <button className="col-span-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Add Employee</button>
      </form>

      {/* Employee List */}
      <div className="bg-white rounded shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Dept</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-t">
                <td className="p-4">{emp.employee_id}</td>
                <td className="p-4">{emp.name}</td>
                <td className="p-4">{emp.department}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => markAttendance(emp.employee_id, 'Present')} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Present</button>
                  <button onClick={() => markAttendance(emp.employee_id, 'Absent')} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Absent</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && <p className="p-4 text-center text-gray-500">No employees found.</p>}
      </div>
    </div>
  );
}

export default App;