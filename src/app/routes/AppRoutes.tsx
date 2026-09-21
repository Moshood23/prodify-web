import { Routes, Route } from 'react-router-dom'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 text-2xl">Home Page (placeholder)</div>} />
    </Routes>
  )
}