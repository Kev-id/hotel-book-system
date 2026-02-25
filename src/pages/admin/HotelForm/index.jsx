import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { addHotel } from '../../../api/hotelApi';
import { DateFormatter, DateValidator } from '../../../utils/dateUtils';
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, message, Steps, Checkbox, Space, Tag, Upload } from 'antd';
import { HomeOutlined, EnvironmentOutlined, DollarOutlined, CalendarOutlined, StarOutlined, CheckCircleOutlined, LogoutOutlined, TagsOutlined, FileTextOutlined, PictureOutlined, UploadOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { CITIES } from '../../../config/cities';
import './styles.css';

const AVAILABLE_TAGS = ['WiFi', '停车场', '健身房', '游泳池', 'SPA', '餐厅', '会议室', '前台24小时', '中餐厅', '茶楼', '商务中心', '行李寄存', '接送服务', '洗衣服务'];

const TAG_COMBINATIONS = {
  'WiFi,停车场,健身房': '现代化商务酒店，配备完善的商务设施和健身设备，是商务旅客的理想选择。',
  'SPA,WiFi,停车场,健身房,游泳池': '五星级豪华酒店，拥有完善的娱乐和休闲设施，提供顶级的住宿体验。',
  'WiFi,会议室,餐厅': '商务酒店，设施完善，服务周到，是商务旅客的首选。',
  'WiFi,中餐厅,停车场,茶楼,健身房': '融合文化特色的酒店，提供独特的文化体验和传统服务。',
  'WiFi,前台24小时': '经济实惠的酒店，提供基础但舒适的住宿环境。'
};

const HotelForm = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedTags, setSelectedTags] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [roomTypes, setRoomTypes] = useState([{ roomType: '', price: '' }]);

  const handleTagsChange = (tags) => {
    setSelectedTags(tags);
    const sortedTags = [...tags].sort().join(',');
    for (const [combination, description] of Object.entries(TAG_COMBINATIONS)) {
      const sortedCombination = combination.split(',').sort().join(',');
      if (sortedTags === sortedCombination) {
        form.setFieldValue('description', description);
        return;
      }
    }
    form.setFieldValue('description', '');
  };

  const handleSubmit = async (values) => {
    // 验证房型
    if (roomTypes.length === 0 || !roomTypes.every(rt => rt.roomType && rt.price)) {
      message.error('请至少添加一个房型并填写完整信息');
      return;
    }

    // 格式化并验证开业日期
    const openingDate = DateFormatter.toAPIFormat(values.openingDate);
    
    if (!DateValidator.isValidOpeningDate(openingDate)) {
      message.error('开业日期不合理，请检查');
      return;
    }

    // 创建 FormData 对象
    const formData = new FormData();
    
    // 添加基本字段
    formData.append('name', values.name);
    formData.append('address', values.address);
    formData.append('city', values.city);
    formData.append('stars', Number(values.stars));
    formData.append('openingDate', openingDate);
    formData.append('description', values.description);
    formData.append('merchantId', user.id);
    formData.append('status', 'pending');
    formData.append('tags', JSON.stringify(selectedTags));
    formData.append('roomTypes', JSON.stringify(roomTypes));
    
    // 添加图片文件
    fileList.forEach(file => {
      if (file.originFileObj) {
        formData.append('images', file.originFileObj);
      }
    });
    
    try {
      const response = await fetch('http://localhost:5000/api/hotels', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        message.success('酒店提交成功，等待管理员审核！');
        form.resetFields();
        setSelectedTags([]);
        setFileList([]);
        setRoomTypes([{ roomType: '', price: '' }]);
      } else {
        message.error('提交失败，请重试');
      }
    } catch (error) {
      message.error('提交失败：' + error.message);
    }
  };

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { roomType: '', price: '' }]);
  };

  const removeRoomType = (index) => {
    if (roomTypes.length > 1) {
      const newRoomTypes = roomTypes.filter((_, i) => i !== index);
      setRoomTypes(newRoomTypes);
    }
  };

  const updateRoomType = (index, field, value) => {
    const newRoomTypes = [...roomTypes];
    newRoomTypes[index][field] = value;
    setRoomTypes(newRoomTypes);
  };

  const handleLogout = () => { logout(); message.success('已退出登录'); navigate('/admin/login'); };

  const uploadProps = {
    listType: 'picture-card',
    fileList: fileList,
    beforeUpload: (file) => {
      // 检查文件类型
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      
      // 检查文件大小（5MB）
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB！');
        return false;
      }
      
      // 检查数量限制
      if (fileList.length >= 10) {
        message.error('最多只能上传 10 张图片！');
        return false;
      }
      
      return false; // 阻止自动上传
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    onRemove: (file) => {
      setFileList(fileList.filter(item => item.uid !== file.uid));
    },
    onPreview: async (file) => {
      let src = file.url;
      if (!src) {
        src = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj);
          reader.onload = () => resolve(reader.result);
        });
      }
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    }
  };

  return (
    <div className="hotel-form-container">
      <div className="form-header">
        <div className="header-left">
          <div className="logo"><img src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=60&h=60&fit=crop" alt="Hotel" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /></div>
          <div className="header-info"><h1 className="header-title">酒店管理系统</h1><p className="header-subtitle">商户：{user?.username}</p></div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            size="large"
            onClick={() => navigate('/admin/merchant-status')}
          >
            查看我的酒店
          </Button>
          <Button icon={<LogoutOutlined />} onClick={handleLogout} className="logout-button">退出登录</Button>
        </div>
      </div>
      <Card className="steps-card"><Steps current={0} items={[{ title: '填写信息', icon: <HomeOutlined /> }, { title: '提交审核', icon: <CheckCircleOutlined /> }, { title: '等待审核', icon: <StarOutlined /> }]} /></Card>
      <Card className="form-card">
        <div className="form-card-header"><h2 className="form-title">酒店信息录入</h2><p className="form-desc">请填写完整的酒店信息，提交后将进入审核流程</p></div>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="hotel-form">
          <div className="form-section"><h3 className="section-title"><HomeOutlined /> 基本信息</h3>
            <Form.Item label="酒店名称" name="name" rules={[{ required: true, message: '请输入酒店名称' }, { min: 2, message: '酒店名称至少2个字符' }]}><Input placeholder="例如：北京国际大酒店" size="large" prefix={<HomeOutlined />} /></Form.Item>
            <Form.Item label="酒店地址" name="address" rules={[{ required: true, message: '请输入酒店地址' }, { min: 5, message: '地址至少5个字符' }]}><Input placeholder="例如：北京市朝阳区建国路88号" size="large" prefix={<EnvironmentOutlined />} /></Form.Item>
            <Form.Item label="所在城市" name="city" rules={[{ required: true, message: '请选择酒店城市' }]}>
              <Select placeholder="请选择酒店城市" size="large" suffixIcon={<EnvironmentOutlined />}>
                {CITIES.map(city => (
                  <Select.Option key={city.value} value={city.value}>
                    {city.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div className="form-section"><h3 className="section-title"><DollarOutlined /> 房型与价格</h3><p className="section-desc">添加酒店的各个房型及对应价格，至少添加一个房型</p>
            {roomTypes.map((room, index) => (
              <div key={index} className="room-type-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <Input
                  placeholder="房型名称（如：豪华大床房）"
                  value={room.roomType}
                  onChange={(e) => updateRoomType(index, 'roomType', e.target.value)}
                  style={{ flex: 2 }}
                  size="large"
                />
                <InputNumber
                  placeholder="价格（元/晚）"
                  value={room.price}
                  onChange={(value) => updateRoomType(index, 'price', value)}
                  min={0}
                  max={99999}
                  style={{ flex: 1 }}
                  size="large"
                />
                {roomTypes.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeRoomType(index)}
                    size="large"
                  />
                )}
              </div>
            ))}
            <Button
              type="dashed"
              onClick={addRoomType}
              icon={<PlusOutlined />}
              block
              size="large"
              style={{ marginTop: '8px' }}
            >
              添加房型
            </Button>
          </div>
          <div className="form-section"><h3 className="section-title"><StarOutlined /> 星级</h3>
            <Form.Item label="酒店星级" name="stars" rules={[{ required: true, message: '请选择星级' }]}><Select placeholder="请选择星级" size="large" suffixIcon={<StarOutlined />}><Select.Option value="1"> 1星</Select.Option><Select.Option value="2"> 2星</Select.Option><Select.Option value="3"> 3星</Select.Option><Select.Option value="4"> 4星</Select.Option><Select.Option value="5"> 5星</Select.Option></Select></Form.Item>
          </div>
          <div className="form-section"><h3 className="section-title"><CalendarOutlined /> 开业时间</h3>
            <Form.Item label="开业时间" name="openingDate" rules={[{ required: true, message: '请选择开业时间' }]}><DatePicker size="large" style={{ width: '100%' }} placeholder="选择开业日期" /></Form.Item>
          </div>
          <div className="form-section"><h3 className="section-title"><TagsOutlined /> 酒店标签</h3><p className="section-desc">选择酒店的特色标签，帮助用户更好地了解酒店设施</p>
            <div className="tags-container"><Checkbox.Group value={selectedTags} onChange={handleTagsChange} style={{ width: '100%' }}><Space wrap>{AVAILABLE_TAGS.map(tag => (<Checkbox key={tag} value={tag}><Tag color="blue">{tag}</Tag></Checkbox>))}</Space></Checkbox.Group></div>
          </div>
          <div className="form-section"><h3 className="section-title"><PictureOutlined /> 酒店图片</h3><p className="section-desc">上传酒店真实图片，最多 10 张，每张不超过 5MB</p>
            <Form.Item name="images">
              <Upload {...uploadProps}>
                {fileList.length >= 10 ? null : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </div>
          <div className="form-section"><h3 className="section-title"><FileTextOutlined /> 酒店介绍</h3>
            <Form.Item label="酒店介绍" name="description" rules={[{ required: true, message: '请输入酒店介绍' }, { min: 10, message: '介绍至少10个字符' }, { max: 500, message: '介绍最多500个字符' }]}><Input.TextArea placeholder="请输入酒店介绍，介绍您的酒店特色、服务等信息" rows={5} maxLength={500} showCount /></Form.Item>
          </div>
          <Form.Item className="submit-section">
            <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
              <Button size="large" onClick={() => form.resetFields()} style={{ minWidth: '120px' }}>
                重置表单
              </Button>
              <Button type="primary" htmlType="submit" size="large" className="submit-button" icon={<CheckCircleOutlined />} style={{ minWidth: '120px' }}>
                确认提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      <Card className="info-card"><h3 className="info-title">提交须知</h3><ul className="info-list"><li>请确保所有信息真实准确</li><li>提交后将进入审核流程，通常1-3个工作日</li><li>审核通过后，酒店信息将在平台上线</li><li>如有疑问，请联系客服：400-123-4567</li></ul></Card>
    </div>
  );
};

export default HotelForm;
