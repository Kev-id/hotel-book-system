// 报告生成工具
class Reporter {
  constructor() {
    this.startTime = null;
    this.stats = {
      orders: 0,
      reviews: 0,
      favorites: 0,
      priceHistory: 0
    };
    this.errors = [];
  }

  start() {
    this.startTime = new Date();
    console.log('\n🚀 开始数据库清理和数据准备');
    console.log(`⏰ 开始时间: ${this.formatTime(this.startTime)}\n`);
  }

  phase(name) {
    console.log(`\n📋 ${name}...`);
  }

  success(message) {
    console.log(`  ✓ ${message}`);
  }

  warning(message) {
    console.log(`  ⚠️  ${message}`);
  }

  error(message, error = null) {
    console.log(`  ❌ ${message}`);
    if (error) {
      console.error(`     ${error.message}`);
      this.errors.push({ message, error: error.message, stack: error.stack });
    }
  }

  info(message) {
    console.log(`  ${message}`);
  }

  updateStats(type, count) {
    if (this.stats.hasOwnProperty(type)) {
      this.stats[type] = count;
    }
  }

  finish() {
    const endTime = new Date();
    const duration = (endTime - this.startTime) / 1000;

    console.log('\n✅ 数据库清理和数据准备完成！');
    console.log('\n📊 数据统计:');
    console.log(`  - 订单: ${this.stats.orders} 条`);
    console.log(`  - 评价: ${this.stats.reviews} 条`);
    console.log(`  - 收藏: ${this.stats.favorites} 条`);
    console.log(`  - 价格历史: ${this.stats.priceHistory} 条`);
    
    console.log(`\n⏱️  总执行时间: ${duration.toFixed(2)} 秒`);
    console.log(`⏰ 结束时间: ${this.formatTime(endTime)}\n`);

    if (this.errors.length > 0) {
      console.log(`\n⚠️  发现 ${this.errors.length} 个错误`);
    }
  }

  formatTime(date) {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  getErrors() {
    return this.errors;
  }

  hasErrors() {
    return this.errors.length > 0;
  }
}

module.exports = Reporter;
