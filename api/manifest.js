export default async function handler(req, res) {
  const { shop_code } = req.query;

  if (!shop_code || typeof shop_code !== 'string') {
    return res.status(400).json({ error: "Missing shop_code" });
  }

  const apiDomain = "https://onlineapi.chomnenhapp.com";
  let shopName = shop_code;
  let logoUrl = '/images/chomnenh.png'; 

  try {
    const apiUrl = `${apiDomain}/api/settings?shop_code=${shop_code}`;
    const apiResponse = await fetch(apiUrl);
    
    if (apiResponse.ok) {
      const result = await apiResponse.json();
      if (result.success && result.data) {
        const setting = (result.data.shop && typeof result.data.shop === 'object')
          ? result.data.shop
          : (result.data.setting || result.data);
        
        if (setting.shop_name) {
          shopName = setting.shop_name;
        }
        if (setting.logo) {
          const logoPath = setting.logo;
          logoUrl = logoPath.startsWith('http')
            ? logoPath
            : `${apiDomain}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
        }
      }
    }
  } catch (error) {
    console.error("Manifest: មិនអាចទាញទិន្នន័យពី API:", error);
  }

  const getMimeType = (url) => {
    if (/\.jpe?g$/i.test(url)) return "image/jpeg";
    if (/\.webp$/i.test(url)) return "image/webp";
    if (/\.svg$/i.test(url)) return "image/svg+xml";
    return "image/png";
  };

  const manifest = {
    id: `/${shop_code}/`,
    name: shopName,
    short_name: shopName,
    start_url: `/${shop_code}/`,
    scope: `/${shop_code}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: logoUrl,
        sizes: "192x192",
        type: getMimeType(logoUrl),
        purpose: "any maskable"
      },
      {
        src: logoUrl,
        sizes: "512x512",
        type: getMimeType(logoUrl),
        purpose: "any maskable"
      }
    ]
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  res.status(200).json(manifest);
}
