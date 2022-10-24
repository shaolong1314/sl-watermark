/*
 * @Author: shaolong
 * @Date: 2022-10-23 15:38:49
 * @LastEditors: shaolong
 * @LastEditTime: 2022-10-24 14:35:30
 * @Description:
 */

export default class WaterMaker {
  constructor(base64Img, wmConfig) {
    this.base64Img = base64Img;
    this.wmConfig = wmConfig;
  }
  render() {
    if (this.wmConfig.textArray.length === 0) {
      console.error("****没有水印内容*****");
      return this.base64Img;
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      let resultBase64 = null;
      img.src = this.base64Img;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        //canvas绘制图片，0 0  为左上角坐标原点
        ctx.drawImage(img, 0, 0);
        //写入水印
        drawWaterMark(ctx, img.width, img.height, this.wmConfig);
        resultBase64 = canvas.toDataURL("image/png");

        if (this.wmConfig.fileType == "blob") {
          resultBase64 = base64ToBlob(resultBase64);
        }
        if (!resultBase64) {
          reject();
        } else {
          resolve(resultBase64);
        }
      };
    });
  }
}

//画布添加水印
const drawWaterMark = (ctx, imgWidth, imgHeight, wmConfig) => {
  try {
    let fontSize;
    if (imgWidth >= 3456) {
      fontSize = 120;
    } else if (imgWidth >= 2700) {
      fontSize = 100;
    } else if (imgWidth >= 2000) {
      fontSize = 80;
    } else if (imgWidth >= 1436) {
      fontSize = 70;
    } else if (imgWidth >= 1300) {
      fontSize = 60;
    } else if (imgWidth >= 1100) {
      fontSize = 50;
    } else if (imgWidth >= 900) {
      fontSize = 40;
    } else if (imgWidth >= 700) {
      fontSize = 30;
    } else if (imgWidth >= 500) {
      fontSize = 20;
    } else {
      fontSize = 18;
    }
    console.log(imgWidth, imgHeight, fontSize);

    // 字体
    const fontFamily = wmConfig.font || "microsoft yahei";
    ctx.lineWidth = 1;
    // ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = 0.8;

    ctx.save();

    // 计算水印的位置
    const { x, y } = calculatePosition(imgWidth, imgHeight, wmConfig);
    ctx.translate(x, y); ///画布旋转原点 移到特定的位置
    ctx.rotate(wmConfig.rotate); // 水印旋转设置

    // let maxTextWidth = 0;
    if (wmConfig.textArray.length > 3) {
      wmConfig.textArray = wmConfig.textArray.slice(0, 3);
    }
    wmConfig.textArray.forEach((item, index) => {
      // const { width } = ctx.measureText(item.value);
      // maxTextWidth = maxTextWidth > width ? maxTextWidth : width;
      let _fontSize = "";
      if (item.type == "title") {
        _fontSize = item.fontSize || 3 * fontSize + "px";
      } else {
        _fontSize = item.fontSize || fontSize + "px";
      }
      ctx.fillStyle = item.color || "white";
      ctx.font = `${item.bold ? "bold" : ""} ${_fontSize} ${fontFamily}`;
      let offsetY = fontSize * index * 2;
      canvasTextAutoLine(item.value, imgWidth, ctx, 0, 0, offsetY);
      // ctx.fillText(item.value, 0, offsetY);
    });

    // // 文字背景色设置（以最长文字为宽）
    // ctx.fillStyle = "red";
    // ctx.fillRect(x, 100, maxTextWidth, 24);

    ctx.restore();
  } catch (error) {
    throw new Error(error);
  }
};

function calculatePosition(imgWidth, imgHeight, wmConfig) {
  try {
    let x = imgWidth / 2;
    let y = imgHeight / 2;

    // 默认居中
    if (!wmConfig.position) {
      return {
        x,
        y,
      };
    }
    // [right, top]  [center, top]  [left, top]
    // [right, center]  [center, center]  [left, center]
    // [right, bottom]  [center, bottom]  [left, bottom]

    const position = wmConfig.position;
    if (!Array.isArray(position)) {
      throw new Error("wmConfig.position参数必须为一个数组");
    }

    return {
      x: formatPosition(position[0], imgWidth, "X"),
      y: formatPosition(position[1], imgHeight, "Y"),
    };
  } catch (error) {
    throw new Error(error);
  }
}

function formatPosition(value, imgSize, type) {
  if (!["right", "center", "left", "top", "bottom"].includes(value)) {
    if (Number(value) > imgSize) {
      throw new Error(`wmConfig.position中${type}方向偏移量不能超过图片${type == "X" ? "宽" : "高"}的最大值`);
    }
    return Number(value);
  }

  switch (value) {
    case "right":
    case "top":
      return imgSize / 4;
    case "center":
      return imgSize / 2;
    case "left":
    case "bottom":
      return imgSize * 0.75;
  }
}

/*
str:要绘制的字符串
canvas:canvas对象
initX:绘制字符串起始x坐标
initY:绘制字符串起始y坐标
lineHeight:字行高，自己定义个值即可
*/
function canvasTextAutoLine(str, imgWidth, ctx, initX, initY, lineHeight) {
  var lineWidth = 0;
  var lastSubStrIndex = 0;
  for (let i = 0; i < str.length; i++) {
    lineWidth += ctx.measureText(str[i]).width;
    if (lineWidth > imgWidth - initX) {
      initY += lineHeight;
      //减去initX,防止边界出现的问题
      ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
      lineWidth = 0;
      lastSubStrIndex = i;
    }
    if (i == str.length - 1) {
      initY += lineHeight;
      ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
    }
  }
}

/**
 * 将以base64的图片url数据转换为Blob
 * @param base64 用url方式表示的base64图片数据
 */
function base64ToBlob(base64) {
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;

  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; i += 1) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}
