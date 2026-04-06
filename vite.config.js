import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRootDirectoryPath = dirname(fileURLToPath(import.meta.url));

/**
 * 멀티 페이지: 메인 앱 + Figma MCP 대시보드
 * 개발: / 및 /figma-mcp-dashboard/index.html
 */
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRootDirectoryPath, "index.html"),
        figmaMcpDashboard: resolve(
          projectRootDirectoryPath,
          "figma-mcp-dashboard/index.html"
        ),
      },
    },
  },
});
