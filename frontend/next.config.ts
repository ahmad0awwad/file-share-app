// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Tells Next.js to use static export (next export)
  trailingSlash: true, // Optional: better compatibility with GitHub Pages
};

export default nextConfig;
