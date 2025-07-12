type Resolution = {
  width: number;
  height: number;
};

type AspectRatioKey = '16:9' | '9:16' | '4:5';

const formats: Record<AspectRatioKey, string[]> = {
  '16:9': [
    '1920x1080',
    '1280x720',
    '854x480',
    '640x360',
    '426x240',
  ],
  '9:16': [
    '1080x1920',
    '720x1280',
    '480x854',
    '360x640',
    '240x426',
  ],
  '4:5': [
    '864x1080',
    '576x720',
    '384x480',
    '288x360',
    '192x240',
  ]
};

function parseResolution(resolutionStr: string): Resolution {
  const [w, h] = resolutionStr.toLowerCase().split('x').map(Number);
  return { width: w, height: h };
}

function isAspectRatio(width: number, height: number, ratioW: number, ratioH: number): boolean {
  return Math.abs(width / height - ratioW / ratioH) < 0.01;
}

export default function generateFixedResolutions(resolutionStr: string): string {
  const { width, height } = parseResolution(resolutionStr);

  let aspectKey: AspectRatioKey | null = null;

  if (isAspectRatio(width, height, 16, 9)) {
    aspectKey = '16:9';
  } else if (isAspectRatio(width, height, 9, 16)) {
    aspectKey = '9:16';
  } else if (isAspectRatio(width, height, 4, 5)) {
    aspectKey = '4:5';
  }

  if (!aspectKey) return 'Aspect ratio not supported.';

  const basePixels = width * height;

  return formats[aspectKey]
    .filter(res => {
      const [w, h] = res.split('x').map(Number);
      return w * h <= basePixels;
    })
    .join(' ').trim()
}
