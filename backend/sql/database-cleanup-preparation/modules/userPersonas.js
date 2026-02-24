// 用户画像系统
const USER_PERSONAS = {
  BUSINESS_TRAVELER: {
    id: 'business',
    name: '商务旅客',
    preferences: {
      location: ['市中心', '商务区'],
      facilities: ['会议室', 'WiFi', '健身房'],
      priceRange: [800, 2000],
      stars: [4, 5],
      bookingPattern: {
        daysOfWeek: [1, 2, 3, 4, 5], // 周一到周五
        advanceBooking: [7, 30], // 提前7-30天
        stayDuration: [1, 3]
      }
    }
  },
  
  FAMILY_VACATION: {
    id: 'family',
    name: '家庭度假',
    preferences: {
      location: ['景区附近', '郊区'],
      facilities: ['游泳池', '儿童乐园', '家庭房'],
      priceRange: [400, 1200],
      stars: [3, 4],
      bookingPattern: {
        daysOfWeek: [0, 6], // 周末
        seasons: ['summer', 'winter'], // 寒暑假
        advanceBooking: [30, 90],
        stayDuration: [3, 7],
        children: [1, 2]
      }
    }
  },
  
  BUDGET_TRAVELER: {
    id: 'budget',
    name: '预算旅客',
    preferences: {
      priceRange: [200, 600],
      stars: [2, 3],
      tags: ['性价比高', '交通便利'],
      bookingPattern: {
        advanceBooking: [1, 14],
        stayDuration: [1, 2]
      }
    }
  },
  
  LUXURY_SEEKER: {
    id: 'luxury',
    name: '奢华追求者',
    preferences: {
      priceRange: [1500, 5000],
      stars: [5],
      facilities: ['SPA', '米其林餐厅', '管家服务'],
      bookingPattern: {
        advanceBooking: [30, 60],
        stayDuration: [2, 5]
      }
    }
  }
};

// 为用户分配画像
function assignPersonasToUsers(users) {
  const personas = Object.values(USER_PERSONAS);
  return users.map(user => ({
    ...user,
    persona: personas[user.id % personas.length]
  }));
}

// 根据画像筛选酒店
function filterHotelsByPersona(hotels, persona) {
  return hotels.filter(hotel => {
    // 检查星级
    if (persona.preferences.stars) {
      if (!persona.preferences.stars.includes(hotel.stars)) {
        return false;
      }
    }
    
    // 检查设施（如果酒店有tags字段）
    if (persona.preferences.facilities && hotel.tags) {
      const hotelTags = typeof hotel.tags === 'string' 
        ? JSON.parse(hotel.tags) 
        : hotel.tags;
      
      const hasRequiredFacility = persona.preferences.facilities.some(
        facility => hotelTags.includes(facility)
      );
      
      if (!hasRequiredFacility) {
        return false;
      }
    }
    
    return true;
  });
}

// 获取画像对应的收藏类别
function getCategoryByPersona(persona) {
  const categoryMap = {
    business: '商务',
    family: '家庭',
    budget: '休闲',
    luxury: '浪漫'
  };
  return categoryMap[persona.id] || '休闲';
}

module.exports = {
  USER_PERSONAS,
  assignPersonasToUsers,
  filterHotelsByPersona,
  getCategoryByPersona
};
