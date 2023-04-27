import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";

export default defineConfig({
  plugins: [
    dts({
      entryRoot: path.resolve(__dirname, "src"),
      outputDir: path.resolve(__dirname, "dist"),
    }),
  ],
  define: {
    "process.env.TARO_ENV": "process.env.TARO_ENV",
  },
  build: {
    minify: true,
    target: "es2015",
    rollupOptions: {
      // 请确保外部化那些你的库中不需要的依赖
      external: [
        "react",
        "react-dom",
        "@tarojs/taro",
        "@tarojs/components",
        "@tarojs/react",
        "@tarojs/plugin-framework-react",
        "@tarojs/plugin-platform-alipay",
        "@tarojs/plugin-platform-tt",
        "@tarojs/plugin-platform-weapp",
        "@tarojs/runtime",
        "@tarojs/taro-h5"
      ],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@tarojs/taro": "Taro",
          "@tarojs/components": "TaroComponents",
        },
        plugins: [],
      },
    },
    lib: {
      entry: "./src/index.ts",
      name: "@poster-render/taro",
      fileName: "index",
      formats: ["es", "cjs"],
    },
  },
});
