import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import 'antd/dist/reset.css'
import { AuthProvider } from './context/AuthContext.jsx' // 新增

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* 包裹根组件 */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)