# Git 推送手动操作指南

## 🚨 当前状态

✅ **本地提交已完成**（commit: 2e923bc）
❌ **推送到 GitHub 失败**（网络连接问题）

---

## 📋 方案一：等待网络恢复后直接推送（推荐）

当网络恢复或 VPN 连接稳定后：

```bash
cd hotel-book-system-master
git push origin master
```

---

## 📋 方案二：使用 GitHub Desktop（最简单）

1. 下载并安装 GitHub Desktop
   - 官网：https://desktop.github.com/

2. 打开 GitHub Desktop

3. 添加本地仓库
   - File → Add Local Repository
   - 选择：`D:\Downloads\hotel-book-system-master\hotel-book-system-master`

4. 点击右上角的 "Push origin" 按钮

5. 等待推送完成

---

## 📋 方案三：配置代理后推送

### 如果你使用 VPN/代理（例如端口 7890）：

```bash
# 设置 HTTP 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 推送
git push origin master

# 推送成功后取消代理（可选）
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 如果你使用 Clash 等代理工具：

1. 打开代理工具，查看端口号（通常是 7890 或 7891）
2. 执行上述命令，替换端口号
3. 推送

---

## 📋 方案四：切换到 SSH 方式推送

### 1. 检查是否已有 SSH 密钥

```bash
ls ~/.ssh
```

如果看到 `id_rsa` 和 `id_rsa.pub`，说明已有密钥，跳到第3步。

### 2. 生成 SSH 密钥（如果没有）

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

一路回车即可。

### 3. 复制公钥

```bash
cat ~/.ssh/id_rsa.pub
```

复制输出的内容。

### 4. 添加到 GitHub

1. 访问：https://github.com/settings/keys
2. 点击 "New SSH key"
3. 粘贴公钥内容
4. 点击 "Add SSH key"

### 5. 修改远程仓库地址

```bash
cd hotel-book-system-master
git remote set-url origin git@github.com:Kev-id/hotel-book-system.git
```

### 6. 推送

```bash
git push origin master
```

---

## 📋 方案五：使用 Git Bash 或 PowerShell 重试

有时候换个终端工具会有不同的网络行为：

### 使用 Git Bash：
```bash
# 打开 Git Bash
cd /d/Downloads/hotel-book-system-master/hotel-book-system-master
git push origin master
```

### 使用 PowerShell（管理员模式）：
```powershell
# 以管理员身份运行 PowerShell
cd D:\Downloads\hotel-book-system-master\hotel-book-system-master
git push origin master
```

---

## 📋 方案六：分批推送（如果文件太大）

```bash
# 查看提交大小
git show --stat

# 如果太大，可以尝试压缩
git gc --aggressive

# 再次推送
git push origin master
```

---

## 📋 方案七：使用 GitHub CLI

### 1. 安装 GitHub CLI

```bash
winget install GitHub.cli
```

### 2. 登录

```bash
gh auth login
```

### 3. 推送

```bash
cd hotel-book-system-master
gh repo sync
```

---

## 🔍 诊断网络问题

### 测试 GitHub 连接

```bash
# 测试 HTTPS 连接
curl -I https://github.com

# 测试 SSH 连接
ssh -T git@github.com

# 查看 DNS 解析
nslookup github.com
```

### 常见问题

1. **防火墙阻止**
   - 临时关闭防火墙测试
   - 或添加 Git 到防火墙白名单

2. **DNS 污染**
   - 修改 hosts 文件
   - 添加：`140.82.113.4 github.com`

3. **代理设置错误**
   - 检查系统代理设置
   - 确保代理工具正在运行

---

## ✅ 验证推送成功

推送成功后，访问以下地址验证：

```
https://github.com/Kev-id/hotel-book-system
```

应该能看到：
- 最新提交：`fix: v2.1.0 - 修复关键Bug并优化功能`
- 提交时间：今天
- 文件变更：26 files changed

---

## 📞 如果所有方法都失败

1. **使用移动热点**
   - 手机开热点，电脑连接
   - 再次尝试推送

2. **换个时间段**
   - GitHub 有时在某些时段访问较慢
   - 可以晚上或凌晨再试

3. **联系网络管理员**
   - 如果在公司/学校网络
   - 可能需要申请开放 GitHub 访问权限

4. **使用 Gitee 镜像**
   - 先推送到 Gitee
   - 再从 Gitee 同步到 GitHub

---

## 📝 当前提交信息

```
commit 2e923bc (HEAD -> master)
Author: Your Name
Date: 2026-02-06

fix: v2.1.0 - 修复关键Bug并优化功能

变更统计：
- 26 files changed
- 1044 insertions(+)
- 1480 deletions(-)
- 净减少 436 行
```

---

**创建时间**: 2026-02-06  
**状态**: 等待手动推送  
**优先级**: 高
