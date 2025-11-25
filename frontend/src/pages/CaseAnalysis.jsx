import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Search, Sparkles, Plus, FolderOpen, Play } from 'lucide-react'

export default function CaseAnalysis() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [analyzingId, setAnalyzingId] = useState(null)
  const [caseIdInput, setCaseIdInput] = useState('')
  const [newCaseNotice, setNewCaseNotice] = useState(null) // {case_id, id}
  const [language, setLanguage] = useState('English')
  const [stateName, setStateName] = useState('')

  useEffect(() => {
    let isMounted = true
    async function loadCases() {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('access_token') || ''
        const res = await fetch('http://127.0.0.1:8000/api/cases/', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.status === 401) {
          setError('Session expired. Please login again.')
          navigate('/login')
          return
        }
        if (!res.ok) {
          const msg = await res.text().catch(() => '')
          throw new Error(msg || `Failed to load cases (${res.status})`)
        }
        const data = await res.json()
        if (isMounted) setCases(data)
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load cases')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadCases()
    return () => { isMounted = false }
  }, [navigate])

  // Read query params for newly created case
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const newCaseId = params.get('newCaseId')
    const newCasePk = params.get('newCasePk')
    if (newCaseId) {
      setNewCaseNotice({ case_id: newCaseId, id: newCasePk ? Number(newCasePk) : null })
      setCaseIdInput(newCaseId)
      setSearch(newCaseId)
    }
  }, [location.search])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return cases
    return cases.filter(c =>
      c.case_id?.toLowerCase().includes(q) ||
      c.title?.toLowerCase().includes(q)
    )
  }, [cases, search])

  async function analyzeCase(id) {
    setAnalyzingId(id)
    setError(null)
    try {
      const token = localStorage.getItem('access_token') || ''
      const res = await fetch(`http://127.0.0.1:8000/api/cases/${id}/analyze/`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, state: stateName }),
      })
      if (res.status === 401) {
        setError('Session expired. Please login again.')
        navigate('/login')
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data.error || data.detail || `Analyze failed (${res.status})`
        throw new Error(msg)
      }
      const updatedCase = await res.json()
      // Replace in local list
      setCases(prev => prev.map(c => (c.id === updatedCase.id ? updatedCase : c)))
      // Navigate to case details to view saved analysis
      navigate(`/cases/${id}`)
    } catch (e) {
      setError(e.message || 'Failed to analyze the case')
    } finally {
      setAnalyzingId(null)
    }
  }

  async function analyzeByCaseId() {
    const targetId = (caseIdInput || '').trim().toUpperCase()
    if (!targetId) return setError('Please enter a Case ID like CASE-ABCD1234')
    const found = cases.find(c => (c.case_id || '').toUpperCase() === targetId)
    if (!found) {
      return setError(`Case ID ${targetId} not found in your cases`)
    }
    await analyzeCase(found.id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-6">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); } 50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); } }
      `}</style>
      
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-black text-white">AI Analysis</h1>
          </div>
          <p className="text-purple-200 text-lg">Select a case below and analyze it with AI. Results will be saved directly to the case.</p>
        </motion.div>

        {/* Analyze by Case ID */}
        {newCaseNotice && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-6 p-4 backdrop-blur-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 rounded-xl">
            ✓ New case created: <span className="font-mono text-cyan-300 font-bold">{newCaseNotice.case_id}</span>
          </motion.div>
        )}
        
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.2}} className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Play className="w-5 h-5 text-purple-300" />
            <h3 className="text-lg font-bold text-white">Quick Analyze by ID</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="col-span-1 md:col-span-1">
              <label className="text-xs font-semibold text-purple-200 mb-1 block">Language</label>
              <select value={language} onChange={e=>setLanguage(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white rounded-lg text-sm">
                {['English','Hindi','Bengali','Tamil','Telugu','Marathi','Gujarati','Kannada','Malayalam','Punjabi'].map(l=>(<option key={l} value={l} className="bg-slate-900">{l}</option>))}
              </select>
            </div>
            <div className="col-span-1 md:col-span-1">
              <label className="text-xs font-semibold text-purple-200 mb-1 block">State (Optional)</label>
              <select value={stateName} onChange={e=>setStateName(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white rounded-lg text-sm">
                <option value="" className="bg-slate-900">-- None --</option>
                {[
                  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
                ].map(s=>(<option key={s} value={s} className="bg-slate-900">{s}</option>))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={caseIdInput}
              onChange={e => setCaseIdInput(e.target.value)}
              placeholder="Enter Case ID (e.g., CASE-1A2B3C4D)"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white rounded-xl outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-purple-300/50 transition-all"
            />
            <button
              onClick={analyzeByCaseId}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Analyze & Save
            </button>
          </div>
        </motion.div>

        {/* Search and actions */}
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.3}} className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Case ID or title..."
              className="w-full pl-12 pr-4 py-3 backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-purple-300/50 transition-all"
            />
          </div>
          <button
            onClick={() => navigate('/cases/new')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Case
          </button>
        </motion.div>

        {error && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-xl backdrop-blur-sm">{error}</motion.div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-purple-200">Loading cases…</div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center">
            <FolderOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <div className="text-purple-200 text-lg mb-2">No cases found</div>
            <div className="text-purple-300 text-sm">Create a case first to analyze it</div>
          </motion.div>
        ) : (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.4}} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-4 text-xs uppercase tracking-wide text-purple-200 font-bold border-b border-white/10 bg-white/5">
              <div className="col-span-2">Case ID</div>
              <div className="col-span-3">Title</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            <div>
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{opacity:0, x:-20}}
                  animate={{opacity:1, x:0}}
                  transition={{duration:0.3, delay:i*0.05}}
                  className="grid grid-cols-12 px-6 py-4 items-center border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-all duration-200"
                >
                  <div className="col-span-2 font-mono text-sm text-cyan-300">{c.case_id}</div>
                  <div className="col-span-3 text-sm text-white truncate">{c.title}</div>
                  <div className="col-span-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 capitalize text-indigo-200">{c.category || 'general'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 border border-slate-500/50 capitalize text-purple-200">{c.status}</span>
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <button
                      onClick={() => navigate(`/cases/${c.id}`)}
                      className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-200 text-white"
                    >
                      View
                    </button>
                    <button
                      onClick={() => analyzeCase(c.id)}
                      disabled={analyzingId === c.id}
                      className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/50 rounded-lg disabled:opacity-60 transition-all duration-200 text-white font-semibold"
                    >
                      {analyzingId === c.id ? 'Analyzing…' : 'Analyze'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-6 text-sm text-purple-300 text-center">
          💡 Tip: Choose language & optional state for India-specific guidance. Results are saved to the case.
        </div>
      </div>
    </div>
  )
}
