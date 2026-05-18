// Central API helper — all fetch calls go through here
const BASE = process.env.REACT_APP_API_URL || '';

function getToken() {
  return localStorage.getItem('cf_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login:   (email, password)     => request('POST', '/auth/login', { email, password }),
  me:      ()                     => request('GET',  '/auth/me'),

  // Students
  getStudents:    ()        => request('GET',    '/students'),
  addStudent:     (data)    => request('POST',   '/students', data),
  updateStudent:  (id, data)=> request('PUT',    `/students/${id}`, data),
  togglePaid:     (id, data)=> request('PATCH',  `/students/${id}/paid`, data),
  deleteStudent:  (id)      => request('DELETE', `/students/${id}`),

  // Expenses
  getExpenses:    ()   => request('GET',   '/expenses'),
  getSummary:     ()   => request('GET',   '/expenses/summary'),
  addExpense:     (data)=> request('POST', '/expenses', data),
  approveExpense: (id) => request('PATCH', `/expenses/${id}/approve`),
  rejectExpense:  (id) => request('PATCH', `/expenses/${id}/reject`),
  updateExpense:  (id, data) => request('PUT',    `/expenses/${id}`, data),
  deleteExpense:  (id)       => request('DELETE', `/expenses/${id}`),

  // Users
  getUsers:       ()        => request('GET',    '/users'),
  createUser:     (data)    => request('POST',   '/users', data),
  resetPassword:  (id, pw)  => request('PATCH',  `/users/${id}/password`, { password: pw }),
  deleteUser:     (id)      => request('DELETE', `/users/${id}`),
};
