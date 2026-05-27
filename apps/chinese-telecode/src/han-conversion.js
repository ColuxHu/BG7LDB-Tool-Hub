const converterLoaders = {
  s2t: () => loadOpenCCModule("cn2t.js"),
  t2s: () => loadOpenCCModule("t2cn.js"),
};

const converterOptions = {
  s2t: { from: "cn", to: "t" },
  t2s: { from: "t", to: "cn" },
};

const converters = new Map();
const pendingLoads = new Map();

function getVendorCandidates(fileName) {
  return [
    `vendor/opencc-js/${fileName}`,
    `public/vendor/opencc-js/${fileName}`,
  ].map((path) => new URL(path, document.baseURI).href);
}

async function loadOpenCCModule(fileName) {
  const errors = [];
  for (const url of getVendorCandidates(fileName)) {
    try {
      return await import(/* @vite-ignore */ url);
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }
  throw new Error(errors.join("; "));
}

export function isHanConversionMode(mode) {
  return Object.hasOwn(converterLoaders, mode);
}

export async function getHanConverter(mode) {
  if (!isHanConversionMode(mode)) {
    return null;
  }
  if (converters.has(mode)) {
    return converters.get(mode);
  }
  if (!pendingLoads.has(mode)) {
    const load = converterLoaders[mode]()
      .then(({ default: OpenCC }) => {
        const converter = OpenCC.Converter(converterOptions[mode]);
        converters.set(mode, converter);
        return converter;
      })
      .catch((error) => {
        pendingLoads.delete(mode);
        throw new Error(`OpenCC ${mode} module unavailable: ${error.message}`);
      });

    pendingLoads.set(mode, load);
  }
  return pendingLoads.get(mode);
}

export async function convertHanText(text, mode) {
  const converter = await getHanConverter(mode);
  return converter ? converter(text) : text;
}
