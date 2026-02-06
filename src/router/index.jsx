import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '../pages/client/Home';
import HotelList from '../pages/client/List';
import HotelDetail from '../pages/client/Detail';
import Login from '../pages/admin/Login';
import Register from '../pages/admin/Register';
// 新增后台页面
import HotelForm from '../pages/admin/HotelForm';
import Audit from '../pages/admin/Audit';
import AuthGuard from '../components/AuthGuard';
import Navigation from '../components/Navigation';

// 布局包装组件
const Layout = ({ children }) => (
  <>
    <Navigation />
    {children}
  </>
);

const router = createBrowserRouter([
  // 移动端用户端
  { path: '/', element: <Layout><Home /></Layout> },
  { path: '/list', element: <Layout><HotelList /></Layout> },
  { path: '/detail/:id', element: <Layout><HotelDetail /></Layout> },

  // 管理后台
  { path: '/admin/login', element: <Layout><Login /></Layout> },
  { path: '/admin/register', element: <Layout><Register /></Layout> },
  // 商户：酒店录入/编辑
  {
    path: '/admin/hotel-form',
    element: (
      <Layout>
        <AuthGuard allowedRoles={['merchant']}>
          <HotelForm />
        </AuthGuard>
      </Layout>
    )
  },
  // 管理员：酒店审核
  {
    path: '/admin/audit',
    element: (
      <Layout>
        <AuthGuard allowedRoles={['admin']}>
          <Audit />
        </AuthGuard>
      </Layout>
    )
  },
]);

const AppRouter = () => <RouterProvider router={router} />;
export default AppRouter;