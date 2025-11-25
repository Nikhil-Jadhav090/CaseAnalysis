import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, FolderOpen, CheckCircle, Clock, Search } from 'lucide-react'

const sample = [
  { id: 'CASE-1', title: 'Unauthorized access', status: 'Open' },
  { id: 'CASE-2', title: 'Payment dispute', status: 'Closed' },
  { id: 'CASE-3', title: 'Data breach investigation', status: 'Open' },
  { id: 'CASE-4', title: 'Fraud detection', status: 'Closed' },
]

export default function CaseList(){
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCases, setFilteredCases] = useState(sample)
  
  useEffect(() => {
    setFilteredCases(
      sample.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-6">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); } 50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); } }
      `}</style>
      
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-5xl font-black text-white mb-2">Cases</h2>
            <p className="text-purple-200">Manage and track all your cases</p>
          </div>
          <Link to="/cases/new" className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center gap-2 animate-pulse-glow">
            <Plus className="w-5 h-5" />
            <span>Create case</span>
          </Link>
        </motion.div>

        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.2}} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
            <input
              type="text"
              placeholder="Search cases by title or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-purple-300/50 transition-all"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCases.length === 0 ? (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 p-12 rounded-2xl text-center">
              <FolderOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <p className="text-purple-200 text-lg">No cases found matching your search</p>
            </motion.div>
          ) : (
            filteredCases.map((c, i) => {
              const isOpen = c.status === 'Open'
              const StatusIcon = isOpen ? Clock : CheckCircle
              const statusColor = isOpen ? 'from-amber-500 to-orange-500' : 'from-green-500 to-emerald-500'
              const textColor = isOpen ? 'text-amber-300' : 'text-green-300'
              
              return (
                <motion.div
                  key={c.id}
                  initial={{opacity:0, y:30}}
                  animate={{opacity:1, y:0}}
                  transition={{duration:0.5, delay:i*0.1}}
                  className="group relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${statusColor} opacity-10 group-hover:opacity-20 transition-opacity rounded-2xl`} />
                  <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30">
                    <div className="flex items-start justify-between mb-4">
                      <Link to={`/cases/${c.id}`} className="flex-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors mb-2">{c.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-purple-300 font-mono">
                          <FolderOpen className="w-4 h-4" />
                          <span>{c.id}</span>
                        </div>
                      </Link>
                      <div className={`w-10 h-10 bg-gradient-to-br ${statusColor} rounded-xl flex items-center justify-center shadow-lg animate-float`} style={{animationDuration: `${3+i*0.5}s`}}>
                        <StatusIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className={`text-sm font-semibold ${textColor}`}>{c.status}</span>
                      <Link to={`/cases/${c.id}`} className="text-sm text-purple-300 hover:text-white transition-colors font-medium">View details →</Link>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
