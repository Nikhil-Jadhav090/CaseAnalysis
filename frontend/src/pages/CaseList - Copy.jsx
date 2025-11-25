import React from 'react'
import { Link } from 'react-router-dom'

const sample = [
  { id: 'CASE-1', title: 'Unauthorized access', status: 'Open' },
  { id: 'CASE-2', title: 'Payment dispute', status: 'Closed' },
]

export default function CaseList(){
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cases</h2>
        <Link to="/cases/new" className="text-sm text-indigo-600">Create case</Link>
      </div>

      <div className="mt-6 bg-white rounded shadow">
        <ul>
          {sample.map(c=> (
            <li key={c.id} className="p-4 border-b last:border-b-0 flex justify-between items-center">
              <div>
                <Link to={`/cases/${c.id}`} className="font-medium text-indigo-600">{c.title}</Link>
                <div className="text-sm text-gray-500">{c.id}</div>
              </div>
              <div className="text-sm">{c.status}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

