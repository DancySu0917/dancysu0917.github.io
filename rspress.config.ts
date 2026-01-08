import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: '面试喵',
  description: '前端面试题库 - 帮助你系统地准备前端面试',
  icon: '/logo.svg',
  logo: {
    light: '/logo.svg',
    dark: '/logo.svg',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com',
      },
    ],
  },
  globalStyles: path.join(__dirname, 'docs/index.css'),
});
