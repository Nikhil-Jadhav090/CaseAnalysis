import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config'
import { Shield, Users, FolderOpen, Activity, Trash2, CheckCircle, RefreshCw, Clock, Database, Plus } from 'lucide-react'

export default function AdminDashboard(){
  const { user } = useAuth()
  const navigate = useNavigate()
  const [usersData, setUsersData] = React.useState([])
  const [casesData, setCasesData] = React.useState([])
  const [logs, setLogs] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [creatingUser, setCreatingUser] = React.useState(false)
  const [newUser, setNewUser] = React.useState({ email:'', first_name:'', last_name:'', role:'user', password:'' })

  // Guard
  if (!user) return null
  if (!(user.role === 'admin' || user.is_staff)) return <div className="p-8 text-center text-red-300">Unauthorized</div>

  async function fetchAll(){
    setLoading(true)
    setError(null)
    const token = localStorage.getItem('access_token') || ''
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const [uRes, cRes, lRes] = await Promise.all([
        fetch('${API_URL}/api/auth/manage/users/', { headers }),
        fetch('${API_URL}/api/cases/', { headers }),
        fetch('${API_URL}/api/auth/admin/activity-logs/?limit=100', { headers })
      ])
      if(!uRes.ok || !cRes.ok || !lRes.ok) throw new Error('Failed to load admin data')
      const [uData, cData, lData] = await Promise.all([uRes.json(), cRes.json(), lRes.json()])
      setUsersData(uData)
      setCasesData(cData)
      setLogs(lData)
    } catch(e){
      setError(e.message)
    } finally { setLoading(false) }
  }

  React.useEffect(() => { fetchAll() }, [])

  async function createUser(e){
    e.preventDefault()
    setCreatingUser(true)
    const token = localStorage.getItem('access_token') || ''
    try {
      const res = await fetch('${API_URL}/api/auth/manage/users/', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify(newUser)
      })
      if(!res.ok) throw new Error('Create failed')
      setNewUser({ email:'', first_name:'', last_name:'', role:'user', password:'' })
      fetchAll()
    } catch(e){ setError(e.message) } finally { setCreatingUser(false) }
  }

  async function updateUserRole(id, role){
    const token = localStorage.getItem('access_token') || ''
    await fetch(`${API_URL}/api/auth/manage/users/${id}/`, {
      method:'PATCH',
      headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
      body: JSON.stringify({ role })
    })
    fetchAll()
  }

  async function deleteUser(id){
    if(!window.confirm('Delete this user?')) return
    const token = localStorage.getItem('access_token') || ''
    await fetch(`${API_URL}/api/auth/manage/users/${id}/`, {
      method:'DELETE',
      headers: token? {Authorization:`Bearer ${token}`} : {}
    })
    fetchAll()
  }

  async function approveCase(id){
    const token = localStorage.getItem('access_token') || ''
    await fetch(`${API_URL}/api/cases/${id}/approve/`, {
      method:'POST',
      headers: token? {Authorization:`Bearer ${token}`} : {}
    })
    fetchAll()
  }

  async function deleteCase(id){
    if(!window.confirm('Delete this case?')) return
    const token = localStorage.getItem('access_token') || ''
    await fetch(`${API_URL}/api/cases/${id}/`, {
      method:'DELETE',
      headers: token? {Authorization:`Bearer ${token}`} : {}
    })
    fetchAll()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-300" />
          <h1 className="text-4xl font-black text-white">Admin Panel</h1>
        </div>
        {error && <div className="mb-6 p-4 bg-red-900/40 border border-red-600/40 text-red-200 rounded-xl">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2"><span className="text-purple-200 text-sm">Users</span><Users className="w-5 h-5 text-purple-300" /></div>
            <div className="text-3xl font-black text-cyan-300">{usersData.length}</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2"><span className="text-purple-200 text-sm">Cases</span><FolderOpen className="w-5 h-5 text-purple-300" /></div>
            <div className="text-3xl font-black text-indigo-300">{casesData.length}</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2"><span className="text-purple-200 text-sm">Logs</span><Activity className="w-5 h-5 text-purple-300" /></div>
            <div className="text-3xl font-black text-amber-300">{logs.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* User Management */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl flex flex-col">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Manage Users</h2>
            <form onSubmit={createUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <input value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} placeholder="Email" className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-white" required />
              <input value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})} placeholder="Password" className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-white" required />
              <input value={newUser.first_name} onChange={e=>setNewUser({...newUser,first_name:e.target.value})} placeholder="First Name" className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-white" />
              <input value={newUser.last_name} onChange={e=>setNewUser({...newUser,last_name:e.target.value})} placeholder="Last Name" className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-white" />
              <select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})} className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-white">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button disabled={creatingUser} className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold flex items-center justify-center">
                <Plus className="w-4 h-4 mr-1" /> {creatingUser? 'Creating...' : 'Add User'}
              </button>
            </form>
            <div className="space-y-2 overflow-auto max-h-64 pr-2">
              {usersData.map(u => (
                <div key={u.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium truncate max-w-[180px]">{u.email}</span>
                    <span className="text-xs text-purple-300 capitalize">{u.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={u.role} onChange={e=>updateUserRole(u.id, e.target.value)} className="text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-white">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <button onClick={()=>deleteUser(u.id)} className="p-1.5 rounded bg-red-600/70 hover:bg-red-600 text-white" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {usersData.length===0 && !loading && <div className="text-sm text-purple-300">No users found.</div>}
            </div>
          </div>

          {/* Case Management */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl flex flex-col">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><FolderOpen className="w-5 h-5" /> Manage Cases</h2>
            <div className="space-y-2 overflow-auto max-h-64 pr-2">
              {casesData.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium truncate max-w-[160px]">{c.title}</span>
                    <span className="text-xs text-purple-300 font-mono">{c.case_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 border border-slate-500/40 capitalize text-purple-200">{c.status}</span>
                    {c.status==='open' && <button onClick={()=>approveCase(c.id)} className="p-1.5 rounded bg-green-600/70 hover:bg-green-600 text-white" title="Approve"><CheckCircle className="w-4 h-4" /></button>}
                    <button onClick={()=>navigate(`/cases/${c.id}`)} className="p-1.5 rounded bg-indigo-600/70 hover:bg-indigo-600 text-white" title="View"><Activity className="w-4 h-4" /></button>
                    <button onClick={()=>deleteCase(c.id)} className="p-1.5 rounded bg-red-600/70 hover:bg-red-600 text-white" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {casesData.length===0 && !loading && <div className="text-sm text-purple-300">No cases yet.</div>}
            </div>
          </div>
        </div>

        {/* Activity Logs & Backup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl flex flex-col">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> Activity Logs</h2>
            <div className="space-y-2 overflow-auto max-h-72 pr-2 text-xs">
              {logs.map(l => (
                <div key={l.id} className="flex items-start justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <div className="flex-1 pr-2">
                    <span className="text-purple-200 font-mono">{l.action}</span>
                    <div className="text-[10px] text-purple-400">{l.target_type}:{l.target_id}</div>
                    {l.meta && <div className="text-[10px] text-slate-300 truncate">{JSON.stringify(l.meta)}</div>}
                  </div>
                  <div className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(l.created_at).toLocaleTimeString()}</div>
                </div>
              ))}
              {logs.length===0 && !loading && <div className="text-sm text-purple-300">No activity yet.</div>}
            </div>
            <button onClick={fetchAll} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold"><RefreshCw className="w-4 h-4" /> Refresh</button>
          </div>
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl flex flex-col">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Database className="w-5 h-5" /> Backup & Restore</h2>
            <p className="text-purple-200 text-sm mb-4">Placeholder controls. Implement server backup/restore endpoints before enabling.</p>
            <div className="flex gap-3">
              <button disabled className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm">Backup (Coming Soon)</button>
              <button disabled className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm">Restore (Coming Soon)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

