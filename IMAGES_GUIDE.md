# 图片使用指南

## 📸 图片来源

所有图片均来自 **Unsplash**（免费高质量图片库），无需授权即可商用。

---

## 🎨 已添加的图片

### 1. 首页（Home）

#### 轮播图（3张）
- **豪华五星酒店**
  - URL: `https://images.unsplash.com/photo-1566073771259-6a8506099945`
  - 尺寸: 1200x400
  - 描述: 豪华酒店大堂

- **舒适商务酒店**
  - URL: `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa`
  - 尺寸: 1200x400
  - 描述: 现代商务酒店房间

- **经济实惠酒店**
  - URL: `https://images.unsplash.com/photo-1445019980597-93fa8acb246c`
  - 尺寸: 1200x400
  - 描述: 舒适酒店客房

#### 特色卡片（3张）
- **精选酒店**
  - URL: `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb`
  - 尺寸: 400x300
  - 描述: 酒店外观

- **价格优惠**
  - URL: `https://images.unsplash.com/photo-1607863680198-23d4b2565df0`
  - 尺寸: 400x300
  - 描述: 钱币/优惠

- **快速预订**
  - URL: `https://images.unsplash.com/photo-1496417263034-38ec4f0b665a`
  - 尺寸: 400x300
  - 描述: 笔记本电脑/预订

---

### 2. 列表页（List）

#### 酒店缩略图（动态）
根据酒店星级显示不同图片：

- **4-5星酒店**
  - URL: `https://images.unsplash.com/photo-1566073771259-6a8506099945`
  - 尺寸: 300x200
  - 描述: 豪华酒店

- **3星酒店**
  - URL: `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa`
  - 尺寸: 300x200
  - 描述: 商务酒店

- **1-2星酒店**
  - URL: `https://images.unsplash.com/photo-1445019980597-93fa8acb246c`
  - 尺寸: 300x200
  - 描述: 经济酒店

**特性：**
- 懒加载（`loading="lazy"`）
- 悬停放大效果（scale 1.05）
- 圆角 8px

---

### 3. 详情页（Detail）

#### 酒店主图（动态）
根据酒店星级显示不同图片：

- **4-5星酒店**
  - URL: `https://images.unsplash.com/photo-1566073771259-6a8506099945`
  - 尺寸: 1200x400
  - 描述: 豪华酒店大堂

- **3星酒店**
  - URL: `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa`
  - 尺寸: 1200x400
  - 描述: 商务酒店房间

- **1-2星酒店**
  - URL: `https://images.unsplash.com/photo-1445019980597-93fa8acb246c`
  - 尺寸: 1200x400
  - 描述: 经济酒店客房

**特性：**
- 全宽展示
- 高度 400px（桌面）/ 300px（移动端）
- 完美适配容器

---

### 4. 登录页（Login）

#### Logo 图标
- URL: `https://images.unsplash.com/photo-1566073771259-6a8506099945`
- 尺寸: 100x100（显示为 80x80）
- 样式: 圆形、白色边框、阴影
- 描述: 豪华酒店

---

### 5. 注册页（Register）

#### Logo 图标
- URL: `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa`
- 尺寸: 100x100（显示为 80x80）
- 样式: 圆形、白色边框、阴影
- 描述: 商务酒店

---

### 6. 酒店表单页（HotelForm）

#### Header Logo
- URL: `https://images.unsplash.com/photo-1445019980597-93fa8acb246c`
- 尺寸: 60x60（显示为 50x50）
- 样式: 圆角 8px
- 描述: 酒店客房

---

## 🔧 Unsplash 图片参数

### URL 格式
```
https://images.unsplash.com/photo-{PHOTO_ID}?w={WIDTH}&h={HEIGHT}&fit=crop
```

### 常用参数
- `w`: 宽度（像素）
- `h`: 高度（像素）
- `fit=crop`: 裁剪模式（保持比例并填充）
- `q=80`: 质量（1-100，默认 75）
- `auto=format`: 自动格式（WebP/JPEG）

### 示例
```
https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop&q=80&auto=format
```

---

## 🎯 图片优化建议

### 1. 性能优化
```jsx
// 使用懒加载
<img src="..." alt="..." loading="lazy" />

// 添加占位符
<img 
  src="..." 
  alt="..." 
  loading="lazy"
  style={{ backgroundColor: '#f0f0f0' }}
/>
```

### 2. 响应式图片
```jsx
// 使用 srcset 提供多尺寸
<img 
  src="...?w=800"
  srcSet="
    ...?w=400 400w,
    ...?w=800 800w,
    ...?w=1200 1200w
  "
  sizes="(max-width: 768px) 100vw, 800px"
  alt="..."
/>
```

### 3. 添加 WebP 支持
```jsx
<picture>
  <source 
    srcSet="...?w=800&fm=webp" 
    type="image/webp" 
  />
  <img src="...?w=800" alt="..." />
</picture>
```

---

## 🔄 替换图片

### 方法 1：使用其他 Unsplash 图片
1. 访问 [Unsplash](https://unsplash.com/)
2. 搜索关键词（如 "luxury hotel"）
3. 选择图片，复制 Photo ID
4. 替换 URL 中的 Photo ID

### 方法 2：使用本地图片
```jsx
// 1. 将图片放到 public/images/ 目录
// 2. 更新 src 路径
<img src="/images/hotel-1.jpg" alt="..." />
```

### 方法 3：使用其他图片服务
- **Pexels**: `https://images.pexels.com/photos/{ID}/...`
- **Pixabay**: `https://pixabay.com/get/{ID}/...`
- **自建 CDN**: 上传到云存储（阿里云 OSS、腾讯云 COS）

---

## 📊 图片尺寸规范

| 位置 | 推荐尺寸 | 比例 | 格式 |
|------|---------|------|------|
| 首页轮播 | 1200x400 | 3:1 | JPEG/WebP |
| 特色卡片 | 400x300 | 4:3 | JPEG/WebP |
| 列表缩略图 | 300x200 | 3:2 | JPEG/WebP |
| 详情主图 | 1200x400 | 3:1 | JPEG/WebP |
| Logo 图标 | 100x100 | 1:1 | JPEG/WebP/PNG |

---

## ✅ 图片优化检查清单

- [x] 所有图片添加 `alt` 属性（无障碍）
- [x] 列表页图片使用懒加载
- [x] 图片尺寸适配响应式布局
- [x] 悬停效果流畅（transform: scale）
- [x] 图片加载失败有占位符
- [x] 使用 CDN 加速（Unsplash CDN）
- [x] 图片压缩优化（Unsplash 自动优化）

---

## 🎨 设计建议

### 1. 保持一致性
- 所有酒店图片使用相似的色调和风格
- 避免混合不同风格的图片

### 2. 高质量图片
- 最小分辨率：1200px 宽
- 避免模糊或像素化
- 选择光线充足的图片

### 3. 主题相关
- 首页：展示酒店外观和大堂
- 列表：展示房间内部
- 详情：展示酒店特色设施

---

## 📝 版权说明

**Unsplash 许可证：**
- ✅ 免费用于商业和非商业用途
- ✅ 无需署名（但建议署名）
- ✅ 可以修改和分发
- ❌ 不能直接出售原图
- ❌ 不能用于商标或 Logo

**建议：**
在页面底部添加致谢：
```
Photos by Unsplash (https://unsplash.com)
```

---

## 🚀 未来优化

1. **图片懒加载库**
   - 使用 `react-lazy-load-image-component`
   - 添加模糊占位符效果

2. **图片轮播增强**
   - 添加缩略图导航
   - 支持全屏查看
   - 添加图片说明

3. **图片管理系统**
   - 商户上传酒店图片
   - 图片审核功能
   - 图片压缩和优化

4. **CDN 优化**
   - 迁移到自建 CDN
   - 添加图片缓存策略
   - 使用 WebP 格式

---

## 📞 技术支持

如需更换图片或遇到问题，请参考：
- Unsplash API 文档: https://unsplash.com/developers
- React 图片优化: https://web.dev/optimize-images/
- 响应式图片: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
