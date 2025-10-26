export type BrandfetchResponse = {
  name?: string;
  domain?: string;
  description?: string;
  logos?: Array<{
    type?: string;
    theme?: string;
    formats?: Array<{ format?: string; src?: string }>;
    variants?: Array<{
      type?: string;
      theme?: string;
      formats?: Array<{ format?: string; src?: string }>;
    }>;
  }>;
  colors?: Array<{ type?: string; hex?: string; name?: string }>;
  fonts?: Array<{
    type?: string;
    name?: string;
    origin?: string;
    family?: string;
    full?: string;
    web?: { woff?: string; woff2?: string; ttf?: string; otf?: string };
  }>;
  images?: Array<{ type?: string; url?: string }>;
  links?: Array<{ name?: string; url?: string }>;
};

export type ParsedBrand = {
  name?: string;
  domain?: string;
  description?: string;
  logos: Array<{
    type?: string;
    theme?: string;
    format?: string;
    url: string;
  }>;
  colors: Array<{
    type?: string;
    hex: string;
    name?: string;
  }>;
  fonts: Array<{
    type?: string;
    name?: string;
    origin?: string;
    family?: string;
    full?: string;
    files: Record<string, string>;
  }>;
  images: Array<{
    type?: string;
    url: string;
  }>;
  links: Array<{
    name?: string;
    url: string;
  }>;
};

const pickLogoFormats = (
  type: string | undefined,
  theme: string | undefined,
  formats: Array<{ format?: string; src?: string }> | undefined,
) =>
  (formats ?? [])
    .map(format => ({
      type,
      theme,
      format: format.format,
      url: format.src ?? '',
    }))
    .filter(item => item.url.length > 0);

export const parseBrandfetch = (data: BrandfetchResponse): ParsedBrand => {
  const logos = (data.logos ?? []).flatMap(logo => {
    const variants = (logo.variants ?? []).flatMap(variant =>
      pickLogoFormats(variant.type ?? logo.type, variant.theme ?? logo.theme, variant.formats),
    );
    return [
      ...pickLogoFormats(logo.type, logo.theme, logo.formats),
      ...variants,
    ];
  });

  const colors = (data.colors ?? [])
    .map(color => ({
      type: color.type,
      hex: color.hex ?? '',
      name: color.name,
    }))
    .filter(color => color.hex.length > 0);

  const fonts = (data.fonts ?? []).map(font => ({
    type: font.type,
    name: font.name,
    origin: font.origin,
    family: font.family,
    full: font.full,
    files: Object.fromEntries(
      Object.entries(font.web ?? {})
        .filter(([, value]) => typeof value === 'string' && value.length > 0)
        .map(([key, value]) => [key, value as string]),
    ),
  }));

  const images = (data.images ?? [])
    .map(image => ({ type: image.type, url: image.url ?? '' }))
    .filter(image => image.url.length > 0);

  const links = (data.links ?? [])
    .map(link => ({ name: link.name, url: link.url ?? '' }))
    .filter(link => link.url.length > 0);

  return {
    name: data.name,
    domain: data.domain,
    description: data.description,
    logos,
    colors,
    fonts,
    images,
    links,
  };
};
