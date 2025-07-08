import { useState, useEffect } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...')

  useEffect(() => {
    fetch('http://localhost:3001/health')
      .then(res => res.json())
      .then(data => setApiStatus(`API Status: ${data.status} - ${data.timestamp}`))
      .catch(err => setApiStatus(`API Error: ${err.message}`))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Student Profile & Goal Tracking System
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">System Status</h2>
          <div className="space-y-2">
            <p className="text-green-600">✓ Frontend: React + Vite + TypeScript + Tailwind CSS</p>
            <p className="text-green-600">✓ Backend: Express + TypeScript</p>
            <p className="text-gray-600">{apiStatus}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Next Steps</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Set up MariaDB database</li>
            <li>• Implement authentication system</li>
            <li>• Create user registration and login</li>
            <li>• Build student profile management</li>
            <li>• Add resume upload functionality</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
