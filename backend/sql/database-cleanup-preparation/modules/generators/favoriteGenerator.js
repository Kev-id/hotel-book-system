// 收藏数据生成器
const DateHelper = require('../../utils/dateHelper');
const { assignPersonasToUsers, filterHotelsByPersona, getCategoryByPersona } = require('../userPersonas');

class FavoriteGenerator {
  constructor(db, config) {
    this.db = db;
    this.config = config;
    this.favoriteIdCounter = 1;
  }

  async generate(users, hotels) {
    const favorites = [];
    const usersWithPersonas = assignPersonasToUsers(users);
    
    for (const user of usersWithPersonas) {
      // 每个用户2-4个收藏
      const favoriteCount = this.randomInt(
        this.config.favoritesPerUser.min,
        this.config.favoritesPerUser.max
      );
      
      // 根据用户画像选择酒店
      let suitableHotels = filterHotelsByPersona(hotels, user.persona);
      
      // 如果没有合适的酒店，使用所有酒店
      if (suitableHotels.length === 0) {
        suitableHotels = hotels;
      }
      
      // 随机选择酒店
      const selectedHotels = this.selectRandomItems(suitableHotels, favoriteCount);
      
      for (const hotel of selectedHotels) {
        const favorite = this.generateFavorite(user, hotel);
        favorites.push(favorite);
      }
    }
    
    return favorites;
  }

  generateFavorite(user, hotel) {
    // 获取画像对应的类别
    const category = getCategoryByPersona(user.persona);
    
    // 30%概率添加备注
    const note = Math.random() < 0.3 ? this.generateNote(user.persona, hotel) : null;
    
    // 生成创建时间（过去180天内）
    const createTime = DateHelper.getRandomPastDate(180);
    
    return {
      id: this.favoriteIdCounter++,
      userId: user.id,
      hotelId: hotel.id,
      category,
      note,
      createTime: DateHelper.formatDateTime(createTime)
    };
  }

  generateNote(persona, hotel) {
    const notes = {
      business: [
        '会议方便',
        '离公司近',
        '商务设施齐全',
        '适合接待客户'
      ],
      family: [
        '孩子喜欢',
        '适合全家出游',
        '有儿童设施',
        '环境安全'
      ],
      budget: [
        '性价比高',
        '价格实惠',
        '交通方便',
        '干净卫生'
      ],
      luxury: [
        '服务一流',
        '环境优雅',
        '设施豪华',
        '值得体验'
      ]
    };
    
    const personaNotes = notes[persona.id] || notes.budget;
    return this.selectRandom(personaNotes);
  }

  // 工具方法
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  selectRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  selectRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }
}

module.exports = FavoriteGenerator;
