import { CITIES } from '../config/cities';

/**
 * 城市名称映射表（用于匹配地理编码返回的城市名）
 */
const CITY_NAME_MAP = {
  '北京': 'beijing',
  '北京市': 'beijing',
  '上海': 'shanghai',
  '上海市': 'shanghai',
  '天津': 'tianjin',
  '天津市': 'tianjin',
  '重庆': 'chongqing',
  '重庆市': 'chongqing',
  '广州': 'guangzhou',
  '广州市': 'guangzhou',
  '深圳': 'shenzhen',
  '深圳市': 'shenzhen',
  '杭州': 'hangzhou',
  '杭州市': 'hangzhou',
  '南京': 'nanjing',
  '南京市': 'nanjing',
  '武汉': 'wuhan',
  '武汉市': 'wuhan',
  '成都': 'chengdu',
  '成都市': 'chengdu',
  '西安': 'xian',
  '西安市': 'xian',
  '苏州': 'suzhou',
  '苏州市': 'suzhou',
  '郑州': 'zhengzhou',
  '郑州市': 'zhengzhou',
  '长沙': 'changsha',
  '长沙市': 'changsha',
  '沈阳': 'shenyang',
  '沈阳市': 'shenyang',
  '青岛': 'qingdao',
  '青岛市': 'qingdao',
  '厦门': 'xiamen',
  '厦门市': 'xiamen',
  '大连': 'dalian',
  '大连市': 'dalian',
  '宁波': 'ningbo',
  '宁波市': 'ningbo',
  '济南': 'jinan',
  '济南市': 'jinan',
  '昆明': 'kunming',
  '昆明市': 'kunming',
  '南昌': 'nanchang',
  '南昌市': 'nanchang',
  '福州': 'fuzhou',
  '福州市': 'fuzhou',
  '合肥': 'hefei',
  '合肥市': 'hefei',
  '石家庄': 'shijiazhuang',
  '石家庄市': 'shijiazhuang',
  '太原': 'taiyuan',
  '太原市': 'taiyuan',
  '南宁': 'nanning',
  '南宁市': 'nanning',
  '贵阳': 'guiyang',
  '贵阳市': 'guiyang',
  '兰州': 'lanzhou',
  '兰州市': 'lanzhou',
  '海口': 'haikou',
  '海口市': 'haikou',
  '三亚': 'sanya',
  '三亚市': 'sanya',
  '乌鲁木齐': 'urumqi',
  '乌鲁木齐市': 'urumqi',
  '拉萨': 'lhasa',
  '拉萨市': 'lhasa',
  '银川': 'yinchuan',
  '银川市': 'yinchuan',
  '西宁': 'xining',
  '西宁市': 'xining',
  '呼和浩特': 'hohhot',
  '呼和浩特市': 'hohhot',
  '哈尔滨': 'harbin',
  '哈尔滨市': 'harbin',
  '长春': 'changchun',
  '长春市': 'changchun',
  '无锡': 'wuxi',
  '无锡市': 'wuxi',
  '常州': 'changzhou',
  '常州市': 'changzhou',
  '东莞': 'dongguan',
  '东莞市': 'dongguan',
  '佛山': 'foshan',
  '佛山市': 'foshan',
  '珠海': 'zhuhai',
  '珠海市': 'zhuhai',
  '惠州': 'huizhou',
  '惠州市': 'huizhou',
  '温州': 'wenzhou',
  '温州市': 'wenzhou',
  '嘉兴': 'jiaxing',
  '嘉兴市': 'jiaxing',
  '绍兴': 'shaoxing',
  '绍兴市': 'shaoxing',
  '台州': 'taizhou',
  '台州市': 'taizhou',
  '金华': 'jinhua',
  '金华市': 'jinhua',
  '徐州': 'xuzhou',
  '徐州市': 'xuzhou',
  '扬州': 'yangzhou',
  '扬州市': 'yangzhou',
  '南通': 'nantong',
  '南通市': 'nantong',
  '烟台': 'yantai',
  '烟台市': 'yantai',
  '潍坊': 'weifang',
  '潍坊市': 'weifang',
  '淄博': 'zibo',
  '淄博市': 'zibo',
  '洛阳': 'luoyang',
  '洛阳市': 'luoyang',
  '开封': 'kaifeng',
  '开封市': 'kaifeng',
  '保定': 'baoding',
  '保定市': 'baoding',
  '唐山': 'tangshan',
  '唐山市': 'tangshan',
};

/**
 * 使用 OpenStreetMap Nominatim API 进行逆地理编码
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @returns {Promise<string|null>} 城市代码
 */
const reverseGeocodeWithNominatim = async (lat, lng) => {
  try {
    console.log('尝试 Nominatim 逆地理编码...');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh-CN`,
      {
        headers: {
          'User-Agent': 'HotelBookingApp/1.0'
        }
      }
    );
    const data = await response.json();
    console.log('Nominatim 返回数据:', data);
    
    if (data.address) {
      const city = data.address.city || 
                   data.address.town || 
                   data.address.county ||
                   data.address.state;
      console.log('Nominatim 返回城市:', city);
      return matchCityName(city);
    }
  } catch (error) {
    console.error('Nominatim 逆地理编码失败:', error);
  }
  return null;
};

/**
 * 使用 BigDataCloud API 进行逆地理编码（备用方案1）
 * @param {number} lat - 纬度
 * @param {number} lng - 经度
 * @returns {Promise<string|null>} 城市代码
 */
const reverseGeocodeWithBigDataCloud = async (lat, lng) => {
  try {
    console.log('尝试 BigDataCloud 逆地理编码...');
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`
    );
    const data = await response.json();
    console.log('BigDataCloud 返回数据:', data);
    
    if (data.city || data.locality) {
      const city = data.city || data.locality;
      console.log('BigDataCloud 返回城市:', city);
      return matchCityName(city);
    }
  } catch (error) {
    console.error('BigDataCloud 逆地理编码失败:', error);
  }
  return null;
};

/**
 * 使用 IP 定位获取城市（备用方案）
 * @returns {Promise<string|null>} 城市代码
 */
const getCityByIP = async () => {
  // 尝试多个 IP 定位服务
  const services = [
    {
      name: 'ipapi.co',
      url: 'https://ipapi.co/json/',
      parser: (data) => data.city
    },
    {
      name: 'ip-api.com',
      url: 'http://ip-api.com/json/?lang=zh-CN',
      parser: (data) => data.city
    },
    {
      name: 'ipinfo.io',
      url: 'https://ipinfo.io/json',
      parser: (data) => data.city
    }
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url);
      const data = await response.json();
      const city = service.parser(data);
      
      if (city) {
        console.log(`${service.name} 返回城市:`, city);
        const matchedCity = matchCityName(city);
        if (matchedCity) {
          return matchedCity;
        }
      }
    } catch (error) {
      console.error(`${service.name} IP 定位失败:`, error);
    }
  }
  
  return null;
};

/**
 * 匹配城市名称到城市代码
 * @param {string} cityName - 城市名称
 * @returns {string|null} 城市代码
 */
const matchCityName = (cityName) => {
  if (!cityName) return null;
  
  console.log('尝试匹配城市名称:', cityName);
  
  // 直接匹配
  if (CITY_NAME_MAP[cityName]) {
    console.log('直接匹配成功:', CITY_NAME_MAP[cityName]);
    return CITY_NAME_MAP[cityName];
  }
  
  // 去掉"市"后缀匹配
  const cityNameWithoutSuffix = cityName.replace(/市$/, '');
  if (CITY_NAME_MAP[cityNameWithoutSuffix]) {
    console.log('去掉市后缀匹配成功:', CITY_NAME_MAP[cityNameWithoutSuffix]);
    return CITY_NAME_MAP[cityNameWithoutSuffix];
  }
  
  // 在 CITIES 列表中精确查找
  let city = CITIES.find(c => 
    c.label === cityName || 
    c.label === cityNameWithoutSuffix
  );
  
  if (city) {
    console.log('CITIES 列表精确匹配成功:', city.value);
    return city.value;
  }
  
  // 模糊匹配（包含关系）
  city = CITIES.find(c => 
    cityName.includes(c.label) ||
    c.label.includes(cityNameWithoutSuffix)
  );
  
  if (city) {
    console.log('模糊匹配成功:', city.value);
    return city.value;
  }
  
  // 尝试拼音匹配（处理英文城市名）
  const lowerCityName = cityName.toLowerCase();
  city = CITIES.find(c => c.value === lowerCityName);
  
  if (city) {
    console.log('拼音匹配成功:', city.value);
    return city.value;
  }
  
  console.log('无法匹配城市:', cityName);
  return null;
};

/**
 * 获取用户当前位置的城市
 * @returns {Promise<{city: string|null, method: string}>}
 */
export const getUserCity = async () => {
  // 首先尝试从 localStorage 获取缓存的城市
  const cachedCity = localStorage.getItem('userCity');
  const cacheTime = localStorage.getItem('userCityTime');
  
  // 如果缓存存在且未过期（24小时内），直接返回
  if (cachedCity && cacheTime) {
    const now = Date.now();
    const cacheAge = now - parseInt(cacheTime);
    if (cacheAge < 24 * 60 * 60 * 1000) {
      console.log('使用缓存的城市:', cachedCity);
      return { city: cachedCity, method: 'cache' };
    }
  }
  
  // 尝试使用浏览器地理位置 API
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 0,
          enableHighAccuracy: false
        });
      });
      
      const { latitude, longitude } = position.coords;
      console.log('获取到地理位置:', latitude, longitude);
      
      // 尝试多个逆地理编码服务
      let city = null;
      
      // 1. 尝试 BigDataCloud（最快，无需 key）
      city = await reverseGeocodeWithBigDataCloud(latitude, longitude);
      if (city) {
        localStorage.setItem('userCity', city);
        localStorage.setItem('userCityTime', Date.now().toString());
        console.log('通过 BigDataCloud 识别城市:', city);
        return { city, method: 'geolocation' };
      }
      
      // 2. 尝试 Nominatim
      city = await reverseGeocodeWithNominatim(latitude, longitude);
      if (city) {
        localStorage.setItem('userCity', city);
        localStorage.setItem('userCityTime', Date.now().toString());
        console.log('通过 Nominatim 识别城市:', city);
        return { city, method: 'geolocation' };
      }
      
      console.log('逆地理编码失败，尝试 IP 定位');
    } catch (error) {
      console.log('地理位置获取失败:', error.message);
    }
  }
  
  // 备用方案：使用 IP 定位
  const cityByIP = await getCityByIP();
  if (cityByIP) {
    // 缓存结果
    localStorage.setItem('userCity', cityByIP);
    localStorage.setItem('userCityTime', Date.now().toString());
    console.log('通过 IP 识别城市:', cityByIP);
    return { city: cityByIP, method: 'ip' };
  }
  
  // 都失败了，返回默认城市
  console.log('无法识别城市，使用默认城市');
  return { city: null, method: 'default' };
};

/**
 * 清除城市缓存
 */
export const clearCityCache = () => {
  localStorage.removeItem('userCity');
  localStorage.removeItem('userCityTime');
};
