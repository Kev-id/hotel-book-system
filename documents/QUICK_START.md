## 第一步：启动后端 (新终端)

```bash
cd backend
npm install          # 仅第一次需要
npm run init-db     # 仅第一次需要
npm run dev         # 启动后端
```

**成功标志**：看到 `Server is running on port 5000`

---

## 第二步：启动前端 (另一个新终端)

```bash
cd ..                # 回到项目根目录
npm install         # 仅第一次需要
npm run dev        # 启动前端
```

**成功标志**：看到 `VITE v... ready in ... ms`

---

## 第三步：打开浏览器

访问：**http://localhost:5173**

---

##测试账号

**管理员账号**
- 用户名：`admin1`
- 密码：`123456`

**商户账号**
- 用户名：`merchant1`
- 密码：`123456`

或直接注册新账号

---

## 快捷命令

**一键启动（仅限已安装过）**：
```bash
cd backend && npm run dev      # 终端1：启动后端
cd ..  && npm run dev          # 终端2：启动前端
```

**重置数据库**：
```bash
cd backend
npm run init-db
```

**检查 MySQL 状态**：
```bash
mysql -u root -p -e "SELECT 1;"    # 密码：Kv20060426
```
