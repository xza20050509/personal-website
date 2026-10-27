# 第一次完整使用 Git：从 init 到 GitHub Pages

## 为什么学 Git

作为物联网工程专业的学生，以前写代码都是"新建文件夹 → 写代码 → 改文件名加日期"的方式管理版本。直到做团队作业时，一份代码被改得面目全非，才意识到必须学会专业的版本控制工具。

Git 是目前最流行的分布式版本控制系统，而 GitHub 是全球最大的代码托管平台。这篇笔记记录我第一次完整使用 Git 的实操过程。

## 核心概念

在动手之前，先搞懂几个关键概念：

- **工作区（Working Directory）**：你正在编辑的文件
- **暂存区（Staging Area）**：`git add` 后文件进入的区域
- **本地仓库（Local Repository）**：`git commit` 后保存的历史记录
- **远程仓库（Remote Repository）**：GitHub 上的仓库

```
工作区 --git add--> 暂存区 --git commit--> 本地仓库 --git push--> 远程仓库
```

## 实操流程

### 1. 初始化仓库

```bash
git init
```

执行后当前目录会生成一个隐藏的 `.git` 文件夹，这就是 Git 的数据库。

### 2. 配置用户信息

```bash
git config user.name "你的名字"
git config user.email "你的邮箱"
```

> 第一次使用建议加 `--global` 参数，这样所有仓库都用这个配置。

### 3. 查看状态

```bash
git status
```

这个命令会告诉你哪些文件被修改了、哪些在暂存区、哪些还没被追踪。养成随时 `git status` 的好习惯。

### 4. 添加到暂存区

```bash
git add .              # 添加所有变更
git add filename.txt   # 添加指定文件
```

### 5. 提交到本地仓库

```bash
git commit -m "feat: 完成首页布局"
```

提交信息建议遵循 **Conventional Commits** 规范：

| 前缀 | 含义 |
|---|---|
| feat | 新功能 |
| fix | 修复 bug |
| docs | 文档变更 |
| style | 格式调整（不影响逻辑） |
| refactor | 重构 |
| chore | 构建/工具变更 |

### 6. 关联远程仓库

在 GitHub 上新建仓库后，复制仓库地址：

```bash
git remote add origin https://github.com/xza20050509/your-repo.git
```

### 7. 推送到远程

```bash
git push -u origin main
```

`-u` 参数会建立本地分支与远程分支的追踪关系，之后直接 `git push` 即可。

## 用 GitHub Pages 部署静态网站

这是本次学习最有成就感的部分——把写好的 HTML 页面部署到公网。

### 步骤

1. 仓库根目录放一个 `index.html`
2. 推送到 GitHub
3. 进入仓库 **Settings → Pages**
4. Source 选择 `main` 分支，目录选 `/`（根目录）
5. 等待几分钟，访问 `https://xza20050509.github.io/your-repo/`

### 注意事项

- GitHub Pages 项目站点部署在**子路径**下，所以资源引用必须用**相对路径**，不能用 `/css/style.css` 这种绝对路径
- 自定义 404 页面：在根目录放 `404.html` 即可

## 踩坑总结

1. **commit 信息太随意**：一开始写"更新""修改"，后来发现根本不知道改了什么。现在强制自己写清楚变更内容。
2. **忘记 pull 就 push**：远程有新提交时直接 push 会被拒绝。解决：先 `git pull` 合并，再 push。
3. **把敏感信息提交了**：一定要写 `.gitignore`，把密钥、环境变量文件排除掉。
4. **子路径 404**：GitHub Pages 部署后 CSS/JS 加载失败，原因是用了绝对路径。改成相对路径后解决。

## 常用命令速查

```bash
git clone <url>          # 克隆远程仓库
git pull                 # 拉取并合并远程更新
git log --oneline        # 查看简洁的提交历史
git diff                 # 查看未暂存的修改
git checkout -- <file>   # 撤销工作区修改
git reset HEAD <file>    # 从暂存区撤回
```

## 下一步

- [ ] 学习分支管理（branch / merge / rebase）
- [ ] 实践 GitHub Flow 协作流程
- [ ] 学会用 `git stash` 暂存临时修改

版本控制是程序员的基本功，早学早受益。
