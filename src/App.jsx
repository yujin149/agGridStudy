import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GridPage from './pages/GridPage'
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GridPage />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App