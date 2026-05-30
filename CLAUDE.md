# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project: 云开发 QuickStart 微信小程序

**Location:** `~/Desktop/0530小程序`

**Stack:** 微信小程序原生框架 + 微信云开发（Cloud Development）
- 前端：WXML + WXSS + JS（原生小程序，无第三方框架）
- 后端：云函数 Node.js（wx-server-sdk ~2.4.0）
- 基础库版本：2.20.1
- AppID：wx74954e5be6ac2037

**开发工具：** 微信开发者工具（WeChat DevTools）

## Project Structure

```
0530小程序/
├── miniprogram/                  ← 小程序前端代码
│   ├── app.js                    ← 入口，云开发初始化（env 在此配置）
│   ├── app.json                  ← 全局配置（页面路由、窗口样式）
│   ├── app.wxss                  ← 全局样式
│   ├── envList.js                ← 环境列表配置（空模板）
│   ├── sitemap.json              ← 站点地图
│   ├── components/
│   │   └── cloudTipModal/        ← 通用提示弹窗组件
│   ├── pages/
│   │   ├── index/                ← 主页：展示云开发各能力入口
│   │   └── example/              ← 示例页：各功能的详细演示和代码示例
│   └── images/                   ← 图片资源（icons、截图等）
├── cloudfunctions/
│   └── quickstartFunctions/      ← 云函数：集中处理各类后端逻辑
│       ├── index.js              ← 入口，通过 event.type 路由到不同操作
│       ├── package.json          ← 依赖：wx-server-sdk
│       └── config.json           ← 权限：wxacode.get openapi
├── project.config.json           ← 微信开发者工具项目配置
├── project.private.config.json   ← 私有配置（不提交）
└── uploadCloudFunction.sh        ← 云函数上传脚本
```

## Key Architecture

### 页面路由
- `pages/index/index` — 首页，展示云开发六大能力（云托管、云函数、数据库、云存储、AI接入、AI智能开发）
- `pages/example/index` — 通过 URL 参数 `type` 切换不同功能的演示页面
  - `getOpenId`：获取用户 OpenID
  - `getMiniProgramCode`：生成小程序码
  - `createCollection`：创建数据库集合
  - `selectRecord`：数据库增删改查
  - `uploadFile`：云存储文件上传
  - `model-guide`：AI Agent-UI 组件集成指引
  - `cloudbaserun`：云托管容器调用
  - `ai-assistant`：AI 智能开发扩展使用说明

### 云函数调用模式
所有云函数调用统一通过 `quickstartFunctions`，通过 `data.type` 字段路由：
```js
wx.cloud.callFunction({
  name: "quickstartFunctions",
  data: { type: "getOpenId" }  // 或 createCollection / selectRecord / updateRecord / insertRecord / deleteRecord / getMiniProgramCode
})
```

### 环境配置
- 云开发环境 ID 在 `miniprogram/app.js` 的 `globalData.env` 中配置，当前为空字符串
- 运行前必须在微信开发者工具中开通云开发，并将环境 ID 填入 `app.js`

### 数据库
- 集合名：`sales`
- 字段：`region`（地域）、`city`（城市）、`sales`（销量）
- 支持完整的 CRUD 操作

## Development Commands

无 CLI 命令。所有操作在微信开发者工具中完成：
- **预览/调试**：微信开发者工具点击「编译」
- **上传云函数**：在 `cloudfunctions/quickstartFunctions` 目录右键 →「上传并部署：云端安装依赖」
- **云开发控制台**：微信开发者工具右上角「云开发」按钮

## Notes
- 本项目是微信云开发官方 QuickStart 模板，用于演示云开发基础能力
- 没有 package.json 或 npm 构建流程，纯原生小程序开发
- 云函数依赖 `wx-server-sdk`，部署时会自动在云端安装
