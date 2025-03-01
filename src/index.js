const DEFAULT_CONFIG = {
    strokeColor: '#000000',
    strokeWidth: 2,
    cache: true,
    willReadFrequently: true,
    imageSmoothing: true
};

class EdgeIt {

    /* 静态私有字段，用于缓存图片 */
    static #imageCache = new Map();

    constructor(config = {}) {
        /* 合并默认配置和用户配置 */
        this.config = {...DEFAULT_CONFIG, ...config};
    }

    async process(imageSrc) {
        try {
            /* 加载图片 */
            const image = await this.#loadImage(imageSrc);
            const {naturalWidth, naturalHeight} = image;

            /* 计算最终尺寸 */
            const dimensions = this.#calculateDimensions(naturalWidth, naturalHeight);

            /* 创建处理画布 */
            const {canvas: sourceCanvas, context: sourceContext} =
                this.#createCanvas(dimensions.width, dimensions.height);

            /* 准备图像数据 */
            this.#drawSourceImage(sourceContext, image, dimensions);
            const imageData = sourceContext.getImageData(0, 0, dimensions.width, dimensions.height);

            /* 获取轮廓点 */
            const outlinePoints = this.#getOutlinePoints(imageData);

            /* 创建最终画布并合成结果 */
            const resultCanvas = this.#renderResult(image, outlinePoints, dimensions);

            /* 将画布转换为图片对象并返回 */
            return this.#canvasToImage(resultCanvas);
        } catch (error) {
            console.error('Image processing failed:', error);
            throw error;
        }
    }

    /* 计算图片的最终尺寸 */
    #calculateDimensions(naturalWidth, naturalHeight) {
        const {width, height} = this.config;
        const ratio = naturalWidth / naturalHeight;

        return {
            width: width || (height ? height * ratio : naturalWidth),
            height: height || (width ? width / ratio : naturalHeight)
        };
    }

    /* 加载图片，支持缓存 */
    async #loadImage(src) {
        if (src instanceof Image) return src;

        if (EdgeIt.#imageCache.has(src)) {
            return EdgeIt.#imageCache.get(src);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = src;

            img.onload = () => {
                if (this.config.cache) {
                    EdgeIt.#imageCache.set(src, img);
                }
                resolve(img);
            };

            img.onerror = reject;
        });
    }

    /* 创建画布并获取上下文 */
    #createCanvas(width, height) {
        const canvas = typeof OffscreenCanvas !== 'undefined'
            ? new OffscreenCanvas(width, height)
            : document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d', {
            willReadFrequently: this.config.willReadFrequently
        });

        context.imageSmoothingEnabled = this.config.imageSmoothing;

        return {canvas, context};
    }

    /* 在画布上绘制源图片 */
    #drawSourceImage(context, image, dimensions) {
        context.clearRect(0, 0, dimensions.width, dimensions.height);
        context.drawImage(
            image,
            0, 0, image.naturalWidth, image.naturalHeight,
            0, 0, dimensions.width, dimensions.height
        );
    }

    /* 获取图片的轮廓点 */
    #getOutlinePoints(imageData) {
        const data = imageData.data;
        const points = [];
        const {width, height} = imageData;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = data[(y * width + x) * 4 + 3];
                if (alpha === 0) continue;

                if (this.#isEdgePixel(x, y, width, height, data)) {
                    points.push(x, y);
                }
            }
        }
        return points;
    }

    /* 判断当前像素是否为边缘像素 */
    #isEdgePixel(x, y, width, height, data) {
        const neighbors = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1]
        ];

        return neighbors.some(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;

            if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
                return true;
            }

            const alpha = data[(ny * width + nx) * 4 + 3];
            return alpha === 0;
        });
    }

    /* 渲染最终结果，包括描边和原始图片 */
    #renderResult(image, outlinePoints, dimensions) {
        const {canvas, context} = this.#createCanvas(
            dimensions.width + this.config.strokeWidth * 2,
            dimensions.height + this.config.strokeWidth * 2
        );

        /* 绘制描边 */
        context.save();
        context.translate(this.config.strokeWidth, this.config.strokeWidth);
        context.beginPath();
        context.strokeStyle = this.config.strokeColor;
        context.lineWidth = this.config.strokeWidth;
        context.lineJoin = 'round';
        context.lineCap = 'round';

        outlinePoints.forEach((x, i) => {
            if (i % 2 === 0) {
                context.moveTo(x, outlinePoints[i + 1]);
                context.lineTo(x + 1, outlinePoints[i + 1]);
            }
        });

        context.stroke();
        context.restore();

        /* 绘制原始图像 */
        context.drawImage(
            image,
            this.config.strokeWidth,
            this.config.strokeWidth,
            dimensions.width,
            dimensions.height
        );

        return canvas;
    }

    /* 将画布转换为图片对象 */
    #canvasToImage(canvas) {
        return new Promise(async (resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = await this.#canvasToDataURL(canvas);
        });
    }

    /* 将画布转换为DataURL */
    #canvasToDataURL(canvas) {
        if (canvas instanceof OffscreenCanvas) {
            return canvas.convertToBlob().then(URL.createObjectURL);
        }
        return canvas.toDataURL();
    }
}

/* 导出模块 */
export default EdgeIt;