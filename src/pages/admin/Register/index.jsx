import { useNavigate } from 'react-router-dom';
import { userRegister } from '../../../api/userApi';
import { Form, Input, Button, Card, message, Radio } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import './styles.css';

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const result = await userRegister(values.username, values.password, values.role);
      if (result) {
        message.success('注册成功！请登录');
        navigate('/admin/login');
      }
    } catch (error) {
      message.error(error.message || '注册失败，请重试');
    }
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="register-content">
        <Card className="register-card">
          <div className="register-header">
            <div className="logo-section">
              <div className="logo-icon">
                <img 
                  src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=100&h=100&fit=crop" 
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
              <h1 className="logo-title">用户注册</h1>
            </div>
            <p className="register-subtitle">创建您的账号，开始使用酒店预订系统</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="register-form"
            initialValues={{ role: 'admin' }}
          >
            <Form.Item
              label="注册身份"
              name="role"
              rules={[{ required: true, message: '请选择注册身份' }]}
            >
              <Radio.Group>
                <Radio value="admin">管理员（可审核酒店）</Radio>
                <Radio value="merchant">商户（可发布酒店）</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="用户名"
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 20, message: '用户名最多20个字符' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="请输入用户名（3-20个字符）" 
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
                { max: 20, message: '密码最多20个字符' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />}
                placeholder="请输入密码（6-20个字符）" 
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label="确认密码"
              name="confirmPwd"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />}
                placeholder="请再次输入密码" 
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label="邮箱（选填）"
              name="email"
              rules={[
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />}
                placeholder="请输入邮箱地址" 
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item
              label="手机号（选填）"
              name="phone"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined />}
                placeholder="请输入手机号" 
                size="large"
                className="form-input"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block
                className="register-button"
              >
                注册
              </Button>
            </Form.Item>

            <div className="form-footer">
              <span className="footer-text">已有账号？</span>
              <Button 
                type="link" 
                onClick={() => navigate('/admin/login')}
                className="login-link"
              >
                立即登录
              </Button>
            </div>
          </Form>
        </Card>

        <div className="register-info">
          <p className="info-text">📝 普通用户可以浏览和查询酒店信息</p>
          <p className="info-text">🏨 商户可以发布和管理酒店信息</p>
          <p className="info-text">✅ 商户发布的酒店需经管理员审核后上线</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
