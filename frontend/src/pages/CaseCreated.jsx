import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function CaseCreated() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true); setError(null)
      try {
        const token = localStorage.getItem('access_token') || ''
        const res = await fetch(`${API_URL}/api/cases/${id}/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.status === 401) {
          navigate('/login'); return
        }
        if (!res.ok) throw new Error(`Failed to fetch case (${res.status})`)
        const json = await res.json()
        if (active) setData(json)
      } catch (e) {
        if (active) setError(e.message || 'Failed to load')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id, navigate])

  async function copyId() {
    if (!data?.case_id) return
    try {
      await navigator.clipboard.writeText(data.case_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex justify-center items-start">
      <motion.div
        className="w-full max-w-lg bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-emerald-300 mb-2">Case Created</h1>
        <p className="text-sm text-gray-300 mb-6">Your case has been created successfully. The auto-generated Case ID is below.</p>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-600 text-red-200 rounded">{error}</div>}
        {loading ? (
          <div className="text-gray-400">Loading…</div>
        ) : !data ? (
          <div className="text-gray-400">No data</div>
        ) : (
          <>
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">Auto-generated Case ID</div>
              <div className="font-mono text-cyan-300 text-2xl tracking-wide">{data.case_id}</div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={copyId}
                  className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded border border-slate-600"
                >
                  {copied ? 'Copied!' : 'Copy ID'}
                </button>
                <button
                  onClick={() => navigate(`/case-analysis?newCaseId=${encodeURIComponent(data.case_id)}&newCasePk=${encodeURIComponent(data.id)}`)}
                  className="px-3 py-2 text-sm bg-teal-600 hover:bg-teal-700 rounded border border-teal-500"
                >
                  Analyze with AI
                </button>
                <button
                  onClick={() => navigate(`/cases/${id}`)}
                  className="px-3 py-2 text-sm bg-emerald-700 hover:bg-emerald-600 rounded border border-emerald-500"
                >
                  View Case Details
                </button>
                <button
                  onClick={() => navigate('/cases/new')}
                  className="px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 rounded"
                >
                  Create Another
                </button>
              </div>
              {data.analyzed_at ? (
                <div className="mt-4 text-xs text-gray-400">Analyzed: {new Date(data.analyzed_at).toLocaleString()}</div>
              ) : (
                <div className="mt-4 text-xs text-amber-300">Analysis is running in background. You can view results on the Case page shortly.</div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

