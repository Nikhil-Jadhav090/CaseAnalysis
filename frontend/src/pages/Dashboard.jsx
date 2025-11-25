import React, { useEffect, useMemo, useState } from 'react'
import { TrendingUp, FolderOpen, CheckCircle, Activity, Plus, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'

export default function Dashboard(){
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function loadCases(){
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('access_token')
        const res = await fetch(`${API_URL}/api/cases/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (!res.ok) throw new Error(`Failed to load cases (${res.status})`)
        const data = await res.json()
        if (mounted) setCases(data)
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load cases')
      } finally { if (mounted) setLoading(false) }
    }
    loadCases()
    return () => { mounted = false }
  }, [])

  const stats = useMemo(() => {
    const total = cases.length
    const open = cases.filter(c => c.status === 'open').length
    const inProgress = cases.filter(c => c.status === 'in_progress').length
    const closed = cases.filter(c => c.status === 'closed').length
    return [
      { icon: TrendingUp, label: 'Total Cases', value: String(total), color: 'from-blue-500 to-cyan-500', textColor: 'text-cyan-400' },
      { icon: FolderOpen, label: 'Open / In Progress', value: String(open + inProgress), color: 'from-amber-500 to-orange-500', textColor: 'text-amber-400' },
      { icon: CheckCircle, label: 'Closed Cases', value: String(closed), color: 'from-green-500 to-emerald-500', textColor: 'text-green-400' }
    ]
  }, [cases])

  const categories = useMemo(() => {
    const counts = {}
    cases.forEach(c => { counts[c.category] = (counts[c.category] || 0) + 1 })
    return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,6)
  }, [cases])

  const recentCases = useMemo(() => {
    return [...cases].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5)
  }, [cases])

  const analyzedCount = useMemo(() => cases.filter(c => !!c.analyzed_at).length, [cases])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-6">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); } 50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); } }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="mb-12">
          <h1 className="text-5xl font-black text-white mb-3">Dashboard</h1>
          <p className="text-purple-200 text-lg">Welcome back! Here's what's happening with your cases.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:i*0.1}} className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br {stat.color} opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl" />
              <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl hover:border-white/40 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg animate-float`} style={{animationDuration: `${3+i*0.5}s`}}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <Activity className="w-5 h-5 text-purple-300" />
                </div>
                <p className="text-purple-200 text-sm font-medium mb-2">{stat.label}</p>
                <p className={`text-5xl font-black ${stat.textColor}`}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl mb-8 flex flex-wrap gap-4">
          <button onClick={()=>navigate('/cases/new')} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/40 transition-all">
            <Plus className="w-5 h-5" /> Create Case
          </button>
          <button onClick={()=>navigate('/cases')} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/40 transition-all">
            <FolderOpen className="w-5 h-5" /> View All Cases
          </button>
          <button onClick={()=>navigate('/case-analysis')} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/40 transition-all">
            <Sparkles className="w-5 h-5" /> AI Analysis Center
          </button>
          <div className="flex items-center gap-2 text-sm text-purple-200 ml-auto">
            <Sparkles className="w-4 h-4" /> {analyzedCount} analyzed
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{opacity:0, x:-30}} animate={{opacity:1, x:0}} transition={{duration:0.6, delay:0.4}} className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-300" />
              <h4 className="text-xl font-bold text-white">Top Categories</h4>
            </div>
            {categories.length === 0 && !loading && <div className="text-purple-300 text-sm">No categories yet.</div>}
            <div className="space-y-4">
              {categories.map(([cat, count], i) => {
                const pct = cases.length ? Math.round((count / cases.length) * 100) : 0
                return (
                  <div key={cat} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-100 font-medium capitalize">{String(cat).replace('_',' ')}</span>
                      <span className="text-purple-300">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1, delay:i*0.15}} className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover:from-purple-400 group-hover:to-pink-400 transition-colors" />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, x:30}} animate={{opacity:1, x:0}} transition={{duration:0.6, delay:0.5}} className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <FolderOpen className="w-6 h-6 text-purple-300" />
              <h4 className="text-xl font-bold text-white">Recent Cases</h4>
            </div>
            {loading && <div className="text-purple-300 text-sm">Loading…</div>}
            {error && <div className="text-red-300 text-sm">{error}</div>}
            <div className="space-y-4">
              {recentCases.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white truncate max-w-[220px]">{c.title}</span>
                    <span className="text-xs text-purple-300 font-mono">{c.case_id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 border border-slate-500/40 capitalize text-purple-200">{c.status}</span>
                    {c.analyzed_at && <Sparkles className="w-4 h-4 text-yellow-300" />}
                    <button onClick={()=>navigate(`/cases/${c.id}`)} className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/40 transition-all">View</button>
                  </div>
                </div>
              ))}
              {(!loading && recentCases.length === 0) && <div className="text-purple-300 text-sm">No cases yet. Create one to get started.</div>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

