import './styles/App.css';
import AppRouter from './router';
// 引入 AntD 全局样式
// import 'antd/dist/reset.css';
// import 'ant-design-mobile/dist/reset.css';

function App() {
  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App
