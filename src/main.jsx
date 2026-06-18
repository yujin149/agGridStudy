import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/common.css'
import App from './App.jsx'

/**
 * AG Grid v33+ 모듈 등록
 * - 사용할 모듈을 등록하지 않으면 해당 기능이 동작하지 않는다.
 */
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
