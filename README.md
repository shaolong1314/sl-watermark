<!--
 * @Author: shaolong
 * @Date: 2022-10-24 10:34:29
 * @LastEditors: shaolong
 * @LastEditTime: 2022-10-24 11:29:51
 * @Description:
-->

# watermark.js

### 安装

---

```
npm run install sl-watermark

or

yarn add sl-watermark
```

### 使用

---

```
import WaterMaker from "sl-watermark";

// 配置
const config = {
  position: ["center", "bottom"],
  rotate: Math.PI / 5,
  textArray: [
    {
      type: "title",
      value: "9:38:12",
      fontSize: "12px",
      bold: true,
      color: "red",
    },
    {
      type: "content",
      value: "2022-10-24 星期一 广州市 2022-10-24 星期一 广州市 2022-10-24 星期一 广州市",
      fontSize: "12px",
      bold: false,
      color: "white",
    },
  ],
  fileType: "blob",
};


// 使用
  const _WaterMaker = new WaterMaker(file, config);
_WaterMaker.render().then(res => {
  console.log(res)
})

```

### 参数说明

---

- position 值为数组，第一项为 X 轴坐标，第二项为 Y 轴坐标。X 轴支持的值为'right'、'center'、'left'，Y 轴支持的值为'top'、'center'、'bottom'。当然也支持自定义数字，X 轴和 Y 轴都可以。

* rotate 水印的整体旋转角度
* textArray：
  - type：类型，可选的是'title'、'content'
  - value：内容
  - fontSize：字体的大小
  - bold：是否加粗
  - color：字体颜色
* fileType 返回文件的类型，默认 base64, 可选 blob
