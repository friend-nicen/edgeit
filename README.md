# EdgeIt

> 智能图片描边处理库 | **[在线演示](https://diyjs.nicen.cn/edgeit)** | **[在线文档](https://diyjs.nicen.cn/edgeit/edgeit.html)**

## 🚀 核心特性

- 智能边缘检测算法
- 抗锯齿描边渲染
- 零依赖，纯原生实现

## 📦 安装方式

```bash
npm install edgeit
# 或
yarn add edgeit
```

## 🛠 基础用法

```javascript
const processor = new EdgeIt({
    strokeColor: '#ff3b30', // 描边颜色
    strokeWidth: 4          // 描边宽度（像素）
});

// 处理网络图片
processor.process('https://example.com/image.jpg')
    .then(result => document.body.appendChild(result));

```

## ⚙️ 配置选项

| 参数                   | 类型      | 默认值       | 说明                |
|----------------------|---------|-----------|-------------------|
| `strokeColor`        | String  | `#000000` | 描边颜色（支持 CSS 颜色格式） |
| `strokeWidth`        | Number  | `2`       | 描边宽度（像素）          |
| `cache`              | Boolean | `true`    | 缓存图片对象，下次不用重新加载   |
| `willReadFrequently` | Boolean | `true`    | 启用抗锯齿             |
| `imageSmoothing`     | Boolean | `true`    | 启用imageSmoothing  |
| `width`              | Number  | `null`    | 指定输出图像的宽度 (可选）    |
| `height`             | Number  | `null`    | 指定输出图像的高度（可选）     |
