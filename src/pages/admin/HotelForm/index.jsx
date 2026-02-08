import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { addHotel } from '../../../api/hotelApi';
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, message, Steps, Checkbox, Space, Tag, Upload } from 'antd';
import { HomeOutlined, EnvironmentOutlined, DollarOutlined, CalendarOutlined, StarOutlined, CheckCircleOutlined, LogoutOutlined, TagsOutlined, FileTextOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
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
    // 创建 FormData 对象
    const formData = new FormData();
    
    // 添加基本字段
    formData.append('name', values.name);
    formData.append('address', values.address);
    formData.append('city', values.city);
    formData.append('price', Number(values.price));
    formData.append('stars', Number(values.stars));
    formData.append('roomType', values.roomType);
    formData.append('openingDate', values.openingDate.format('YYYY-MM-DD'));
    formData.append('description', values.description);
    formData.append('merchantId', user.id);
    formData.append('status', 'pending');
    formData.append('tags', JSON.stringify(selectedTags));
    
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
      } else {
        message.error('提交失败，请重试');
      }
    } catch (error) {
      message.error('提交失败：' + error.message);
    }
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
        <Button icon={<LogoutOutlined />} onClick={handleLogout} className="logout-button">退出登录</Button>
      </div>
      <Card className="steps-card"><Steps current={0} items={[{ title: '填写信息', icon: <HomeOutlined /> }, { title: '提交审核', icon: <CheckCircleOutlined /> }, { title: '等待审核', icon: <StarOutlined /> }]} /></Card>
      <Card className="form-card">
        <div className="form-card-header"><h2 className="form-title">酒店信息录入</h2><p className="form-desc">请填写完整的酒店信息，提交后将进入审核流程</p></div>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="hotel-form">
          <div className="form-section"><h3 className="section-title"><HomeOutlined /> 基本信息</h3>
            <Form.Item label="酒店名称" name="name" rules={[{ required: true, message: '请输入酒店名称' }, { min: 2, message: '酒店名称至少2个字符' }]}><Input placeholder="例如：北京国际大酒店" size="large" prefix={<HomeOutlined />} /></Form.Item>
            <Form.Item label="酒店地址" name="address" rules={[{ required: true, message: '请输入酒店地址' }, { min: 5, message: '地址至少5个字符' }]}><Input placeholder="例如：北京市朝阳区建国路88号" size="large" prefix={<EnvironmentOutlined />} /></Form.Item>
            <Form.Item label="所在城市" name="city" rules={[{ required: true, message: '请选择酒店城市' }]}><Select placeholder="请选择酒店城市" size="large" suffixIcon={<EnvironmentOutlined />}><Select.Option value="beijing">北京</Select.Option><Select.Option value="shanghai">上海</Select.Option><Select.Option value="guangzhou">广州</Select.Option><Select.Option value="shenzhen">深圳</Select.Option></Select></Form.Item>
          </div>
          <div className="form-section"><h3 className="section-title"><DollarOutlined /> 价格与星级</h3>
            <div className="form-row">
              <Form.Item label="每晚价格（元）" name="price" rules={[{ required: true, message: '请输入价格' }, { type: 'number', min: 1, message: '价格必须大于0' }]} className="form-item-half"><InputNumber min={0} max={99999} placeholder="例如：588" size="large" style={{ width: '100%' }} /></Form.Item>
              <Form.Item label="酒店星级" name="stars" rules={[{ required: true, message: '请选择星级' }]} className="form-item-half"><Select placeholder="请选择星级" size="large" suffixIcon={<StarOutlined />}><Select.Option value="1"> 1星</Select.Option><Select.Option value="2"> 2星</Select.Option><Select.Option value="3"> 3星</Select.Option><Select.Option value="4"> 4星</Select.Option><Select.Option value="5"> 5星</Select.Option></Select></Form.Item>
            </div>
          </div>
          <div className="form-section"><h3 className="section-title"><CalendarOutlined /> 其他信息</h3>
            <div className="form-row">
              <Form.Item label="开业时间" name="openingDate" rules={[{ required: true, message: '请选择开业时间' }]} className="form-item-half"><DatePicker size="large" style={{ width: '100%' }} placeholder="选择开业日期" /></Form.Item>
              <Form.Item label="房型" name="roomType" rules={[{ required: true, message: '请选择房型' }]} className="form-item-half"><Select placeholder="请选择房型" size="large"><Select.Option value="经济间">经济间</Select.Option><Select.Option value="标准间">标准间</Select.Option><Select.Option value="商务间">商务间</Select.Option><Select.Option value="豪华大床房">豪华大床房</Select.Option><Select.Option value="套房">套房</Select.Option><Select.Option value="总统套房">总统套房</Select.Option></Select></Form.Item>
            </div>
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
          <div className="form-section"><h3 className="section-title"><FileTextOutlined /> 酒店介绍</h3><p className="section-desc">{selectedTags.length > 0 ? ' 根据您选择的标签，我们已为您生成默认介绍。您也可以自定义修改。' : '请先选择酒店标签，系统将自动生成介绍。您也可以手动编写。'}</p>
            <Form.Item label="酒店介绍" name="description" rules={[{ required: true, message: '请输入酒店介绍' }, { min: 10, message: '介绍至少10个字符' }, { max: 500, message: '介绍最多500个字符' }]}><Input.TextArea placeholder="请输入酒店介绍，介绍您的酒店特色、服务等信息" rows={5} maxLength={500} showCount /></Form.Item>
          </div>
          <Form.Item className="submit-section"><Button type="primary" htmlType="submit" size="large" block className="submit-button" icon={<CheckCircleOutlined />}>提交审核</Button></Form.Item>
        </Form>
      </Card>
      <Card className="info-card"><h3 className="info-title"> 提交须知</h3><ul className="info-list"><li>请确保所有信息真实准确</li><li>选择酒店标签可以帮助用户快速了解酒店设施</li><li>系统会根据标签组合自动生成介绍，您也可以自定义修改</li><li>提交后将进入审核流程，通常1-3个工作日</li><li>审核通过后，酒店信息将在平台上线</li><li>如有疑问，请联系客服：400-123-4567</li></ul></Card>
    </div>
  );
};

export default HotelForm;
