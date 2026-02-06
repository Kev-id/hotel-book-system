import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { addHotel } from '../../../api/userApi';
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, message, Steps } from 'antd';
import { 
  HomeOutlined, 
  EnvironmentOutlined, 
  DollarOutlined,
  CalendarOutlined,
  StarOutlined,
  CheckCircleOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import './styles.css';

const HotelForm = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const params = {
      ...values,
      price: Number(values.price),
      stars: Number(values.stars),
      merchantId: user.id,
      status: 'pending',
      openingDate: values.openingDate.format('YYYY-MM-DD')
    };
    const res = await addHotel(params);
    if (res) {
      message.success('酒店提交成功，等待管理员审核！');
      form.resetFields();
    } else {
      message.error('提交失败，请重试');
    }
  };

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/admin/login');
  };

  return (
    <div className="hotel-form-container">
      {/* Header */}
      <div className="form-header">
        <div className="header-left">
          <div className="logo">
            <img 
              src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=60&h=60&fit=crop" 
              alt="Hotel"
              style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '8px',
                objectFit: 'cover'
              }}
            />
          </div>
          <div className="header-info">
            <h1 className="header-title">酒店管理系统</h1>
            <p className="header-subtitle">商户：{user?.username}</p>
          </div>
        </div>
        <Button 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          className="logout-button"
        >
          退出登录
        </Button>
      </div>

      {/* Steps */}
      <Card className="steps-card">
        <Steps
          current={0}
          items={[
            {
              title: '填写信息',
              icon: <HomeOutlined />,
            },
            {
              title: '提交审核',
              icon: <CheckCircleOutlined />,
            },
            {
              title: '等待审核',
              icon: <StarOutlined />,
            },
          ]}
        />
      </Card>

      {/* Form Card */}
      <Card className="form-card">
        <div className="form-card-header">
          <h2 className="form-title">酒店信息录入</h2>
          <p className="form-desc">请填写完整的酒店信息，提交后将进入审核流程</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="hotel-form"
        >
          {/* 基本信息 */}
          <div className="form-section">
            <h3 className="section-title">
              <HomeOutlined /> 基本信息
            </h3>

            <Form.Item
              label="酒店名称"
              name="name"
              rules={[
                { required: true, message: '请输入酒店名称' },
                { min: 2, message: '酒店名称至少2个字符' }
              ]}
            >
              <Input 
                placeholder="例如：北京国际大酒店" 
                size="large"
                prefix={<HomeOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="酒店地址"
              name="address"
              rules={[
                { required: true, message: '请输入酒店地址' },
                { min: 5, message: '地址至少5个字符' }
              ]}
            >
              <Input 
                placeholder="例如：北京市朝阳区建国路88号" 
                size="large"
                prefix={<EnvironmentOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="所在城市"
              name="city"
              rules={[{ required: true, message: '请选择酒店城市' }]}
            >
              <Select 
                placeholder="请选择酒店城市" 
                size="large"
                suffixIcon={<EnvironmentOutlined />}
              >
                <Select.Option value="beijing">北京</Select.Option>
                <Select.Option value="shanghai">上海</Select.Option>
                <Select.Option value="guangzhou">广州</Select.Option>
                <Select.Option value="shenzhen">深圳</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* 价格与星级 */}
          <div className="form-section">
            <h3 className="section-title">
              <DollarOutlined /> 价格与星级
            </h3>

            <div className="form-row">
              <Form.Item
                label="每晚价格（元）"
                name="price"
                rules={[
                  { required: true, message: '请输入价格' },
                  { type: 'number', min: 1, message: '价格必须大于0' }
                ]}
                className="form-item-half"
              >
                <InputNumber 
                  min={0} 
                  max={99999}
                  placeholder="例如：588" 
                  size="large"
                  prefix="¥"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="酒店星级"
                name="stars"
                rules={[{ required: true, message: '请选择星级' }]}
                className="form-item-half"
              >
                <Select 
                  placeholder="请选择星级" 
                  size="large"
                  suffixIcon={<StarOutlined />}
                >
                  <Select.Option value="1">⭐ 1星</Select.Option>
                  <Select.Option value="2">⭐⭐ 2星</Select.Option>
                  <Select.Option value="3">⭐⭐⭐ 3星</Select.Option>
                  <Select.Option value="4">⭐⭐⭐⭐ 4星</Select.Option>
                  <Select.Option value="5">⭐⭐⭐⭐⭐ 5星</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* 其他信息 */}
          <div className="form-section">
            <h3 className="section-title">
              <CalendarOutlined /> 其他信息
            </h3>

            <div className="form-row">
              <Form.Item
                label="开业时间"
                name="openingDate"
                rules={[{ required: true, message: '请选择开业时间' }]}
                className="form-item-half"
              >
                <DatePicker 
                  size="large"
                  style={{ width: '100%' }} 
                  placeholder="选择开业日期"
                />
              </Form.Item>

              <Form.Item
                label="房型"
                name="roomType"
                rules={[{ required: true, message: '请选择房型' }]}
                className="form-item-half"
              >
                <Select 
                  placeholder="请选择房型" 
                  size="large"
                >
                  <Select.Option value="经济间">经济间</Select.Option>
                  <Select.Option value="标准间">标准间</Select.Option>
                  <Select.Option value="商务间">商务间</Select.Option>
                  <Select.Option value="豪华大床房">豪华大床房</Select.Option>
                  <Select.Option value="套房">套房</Select.Option>
                  <Select.Option value="总统套房">总统套房</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* Submit Button */}
          <Form.Item className="submit-section">
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              className="submit-button"
              icon={<CheckCircleOutlined />}
            >
              提交审核
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Info Card */}
      <Card className="info-card">
        <h3 className="info-title">📋 提交须知</h3>
        <ul className="info-list">
          <li>请确保所有信息真实准确</li>
          <li>提交后将进入审核流程，通常1-3个工作日</li>
          <li>审核通过后，酒店信息将在平台上线</li>
          <li>如有疑问，请联系客服：400-123-4567</li>
        </ul>
      </Card>
    </div>
  );
};

export default HotelForm;
