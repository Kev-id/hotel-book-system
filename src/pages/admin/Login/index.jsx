import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { userLogin } from '../../../api/userApi';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import './styles.css';

const Login = () => {
  const [form] = Form.useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const userInfo = await userLogin(values.username, values.password, values.role);
    if (userInfo) {
      login(userInfo);
      message.success('登录成功！');
      userInfo.role === 'merchant' ? navigate('/admin/hotel-form') : navigate('/admin/audit');
    } else {
      message.error('账号、密码或角色错误，请重试');
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="login-content">
        <Card className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">
                <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop" 
                  alt="Hotel Logo"
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              </div>
              <h1 className="logo-title">酒店管理系统</h1>
            </div>
            <p className="login-subtitle">欢迎回来，请登录您的账号</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ role: 'merchant' }}
            className="login-form"
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="请输入用户名" 
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />}
                placeholder="请输入密码" 
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label="登录角色"
              name="role"
              rules={[{ required: true, message: '请选择登录角色' }]}
            >
              <Select 
                placeholder="请选择登录角色" 
                size="large"
                className="form-select"
                suffixIcon={<SafetyOutlined />}
              >
                <Select.Option value="merchant">
                  <span className="role-option">
                    <UserOutlined /> 商户
                  </span>
                </Select.Option>
                <Select.Option value="admin">
                  <span className="role-option">
                    <SafetyOutlined /> 管理员
                  </span>
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block
                className="login-button"
              >
                登录
              </Button>
            </Form.Item>

            <div className="form-footer">
              <span className="footer-text">还没有账号？</span>
              <Button 
                type="link" 
                onClick={() => navigate('/admin/register')}
                className="register-link"
              >
                立即注册
              </Button>
            </div>
          </Form>
        </Card>

        <div className="login-info">
          <p className="info-text">💡 提示：商户可以发布和管理酒店信息</p>
          <p className="info-text">🔒 管理员可以审核酒店发布申请</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
