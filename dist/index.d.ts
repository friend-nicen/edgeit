interface EdgeItConfig {
    strokeColor?: string;
    strokeWidth?: number;
    cache?: boolean;
    willReadFrequently?: boolean;
    imageSmoothing?: boolean;
    width?: number;
    height?: number;
}

declare class EdgeIt {
    constructor(config?: EdgeItConfig);

    process(imageSrc: string | HTMLImageElement): Promise<HTMLImageElement>;
}

export default EdgeIt;