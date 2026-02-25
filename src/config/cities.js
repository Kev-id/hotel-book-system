// 中国主要城市配置
// 格式：{ value: '英文标识', label: '中文名称' }

export const CITIES = [
  // 直辖市
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'tianjin', label: '天津' },
  { value: 'chongqing', label: '重庆' },
  
  // 省会城市
  { value: 'guangzhou', label: '广州' },
  { value: 'shenzhen', label: '深圳' },
  { value: 'hangzhou', label: '杭州' },
  { value: 'nanjing', label: '南京' },
  { value: 'wuhan', label: '武汉' },
  { value: 'chengdu', label: '成都' },
  { value: 'xian', label: '西安' },
  { value: 'suzhou', label: '苏州' },
  { value: 'zhengzhou', label: '郑州' },
  { value: 'changsha', label: '长沙' },
  { value: 'shenyang', label: '沈阳' },
  { value: 'qingdao', label: '青岛' },
  { value: 'xiamen', label: '厦门' },
  { value: 'dalian', label: '大连' },
  { value: 'ningbo', label: '宁波' },
  { value: 'jinan', label: '济南' },
  
  // 其他重要城市
  { value: 'kunming', label: '昆明' },
  { value: 'nanchang', label: '南昌' },
  { value: 'fuzhou', label: '福州' },
  { value: 'hefei', label: '合肥' },
  { value: 'shijiazhuang', label: '石家庄' },
  { value: 'taiyuan', label: '太原' },
  { value: 'nanning', label: '南宁' },
  { value: 'guiyang', label: '贵阳' },
  { value: 'lanzhou', label: '兰州' },
  { value: 'haikou', label: '海口' },
  { value: 'sanya', label: '三亚' },
  { value: 'urumqi', label: '乌鲁木齐' },
  { value: 'lhasa', label: '拉萨' },
  { value: 'yinchuan', label: '银川' },
  { value: 'xining', label: '西宁' },
  { value: 'hohhot', label: '呼和浩特' },
  { value: 'harbin', label: '哈尔滨' },
  { value: 'changchun', label: '长春' },
  { value: 'wuxi', label: '无锡' },
  { value: 'changzhou', label: '常州' },
  { value: 'dongguan', label: '东莞' },
  { value: 'foshan', label: '佛山' },
  { value: 'zhuhai', label: '珠海' },
  { value: 'huizhou', label: '惠州' },
  { value: 'wenzhou', label: '温州' },
  { value: 'jiaxing', label: '嘉兴' },
  { value: 'shaoxing', label: '绍兴' },
  { value: 'taizhou', label: '台州' },
  { value: 'jinhua', label: '金华' },
  { value: 'xuzhou', label: '徐州' },
  { value: 'yangzhou', label: '扬州' },
  { value: 'nantong', label: '南通' },
  { value: 'yantai', label: '烟台' },
  { value: 'weifang', label: '潍坊' },
  { value: 'zibo', label: '淄博' },
  { value: 'luoyang', label: '洛阳' },
  { value: 'kaifeng', label: '开封' },
  { value: 'baoding', label: '保定' },
  { value: 'tangshan', label: '唐山' },
];

// 获取城市中文名
export const getCityLabel = (value) => {
  const city = CITIES.find(c => c.value === value);
  return city ? city.label : value;
};

// 获取城市英文值
export const getCityValue = (label) => {
  const city = CITIES.find(c => c.label === label);
  return city ? city.value : label;
};

export default CITIES;
