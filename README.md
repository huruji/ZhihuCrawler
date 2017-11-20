# 知乎站点爬虫

<p align="center">
  <img width="467px" src="./logo.png">
</p>

## 特点
+ 自动抓取整站内容（用户、live、话题、收藏夹、问题）

+ 为各个内容提供单独命令抓取

+ 自动生成内容预览

+ 自动生成数据分析报告

## 使用

1.下载
```
git clone https://github.com/huruji/ZhihuCrawler
```

2.配置数据库
在项目文件夹下的config.js文件中配置mongodb数据库地址，如
```
db:'mongodb://127.0.0.1/zhihu'
```

3.启动项目
在命令行工具中使用以下命令启动：
```
npm run start
```