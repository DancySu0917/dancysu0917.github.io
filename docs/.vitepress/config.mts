/**
 * @author 'Dancy'
 * @description 'VitePress配置'
 */

import { defineConfig } from "vitepress"
import { nav } from "./nav.mts"
import { sidebar } from "./sidebar.mts"

export default defineConfig({
	// 站点的标题
	title: "Learn Doc",

	// 标题后缀
	titleTemplate: "博客",

	// 站点的描述
	description: "A knowledge storage site",

	// 要在页面 HTML 的 <head> 标签中呈现的其他元素。
	head: [
		[
			"link",
			{
				rel: "icon",
				href: "/logo/code_logo_light.svg",
			},
		],
	],

	// 站点的 lang 属性
	lang: "zh-CN",

	// 站点将部署到的 base URL
	base: "/",

	// 删除 .html 后缀
	cleanUrls: false,

	// 自定义目录 <-> URL 映射
	rewrites: {},

	// markdown 页面的目录
	srcDir: "./src",

	// 用于匹配应作为源内容输出的 markdown 文件的全局模式
	srcExclude: ["**/README.md"],

	// 项目的构建输出位置
	outDir: "../dist",

	// 指定放置生成的静态资源的目录。该路径应位于 outDir 内，并相对于它进行解析。
	assetsDir: "assets",

	// 缓存文件的目录，相对于项目根目录。
	cacheDir: "./.vitepress/cache",

	// VitePress 不会因为死链而导致构建失败
	ignoreDeadLinks: true,

	// 主题模式：深色浅色
	appearance: true,

	// 获取每个页面的最后更新时间戳
	lastUpdated: true,

	// 行号
	markdown: {
		lineNumbers: true,
	},

	// 主题相关配置
	themeConfig: {
		// 导航栏上显示的 Logo，位于站点标题前。
		logo: {
			light: "/logo/code_logo_light.svg",
			dark: "/logo/code_logo_dark.svg",
		},

		// 站点标题，当设置为 false 时，导航中的标题将被禁用。
		siteTitle: "Learn Doc",

		// 导航菜单项的配置。
		nav,

		// 侧边栏菜单项的配置。
		sidebar,

		// 将此值设置为 false 可禁止渲染大纲容器。
		outline: {
			level: "deep", // 右侧大纲标题层级
			label: "目录", // 右侧大纲标题文本配置
		},

		// 可以定义此选项以在导航栏中展示带有图标的社交帐户链接。
		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/dancysu",
			},
		],

		// 页脚配置。
		footer: {
			message: "",
			copyright:
				'©2025 Learn Doc 版权所有',
		},

		// 编辑链接。
		editLink: {
			pattern: "",
			text: "在 GitHub 上编辑此页面",
		},

		// 允许自定义上次更新的文本和日期格式。
		lastUpdated: {
			text: "最后更新于",
			formatOptions: {
				dateStyle: "full",
				timeStyle: "medium",
			},
		},

		// 搜索。
		search: {
			provider: "local",
			options: {
				locales: {
					zh: {
						translations: {
							button: {
								buttonText: "搜索文档",
								buttonAriaLabel: "搜索文档",
							},
							modal: {
								noResultsText: "无法找到相关结果",
								resetButtonTitle: "清除查询条件",
								footer: {
									selectText: "选择",
									navigateText: "切换",
								},
							},
						},
					},
				},
			},
		},

		// 自定义出现在上一页和下一页链接上方的文本。
		docFooter: {
			prev: "上一篇",
			next: "下一篇",
		},

		// 用于自定义深色模式开关标签，该标签仅在移动端视图中显示。
		darkModeSwitchLabel: "切换日光/暗黑模式",

		// 用于自定义悬停时显示的浅色模式开关标题。
		lightModeSwitchTitle: "暗黑模式",

		// 用于自定义悬停时显示的深色模式开关标题。
		darkModeSwitchTitle: "日光模式",

		// 用于自定义侧边栏菜单标签，该标签仅在移动端视图中显示。
		sidebarMenuLabel: "文章",

		// 用于自定义返回顶部按钮的标签，该标签仅在移动端视图中显示。
		returnToTopLabel: "Top",

		// 是否在 markdown 中的外部链接旁显示外部链接图标。
		externalLinkIcon: true,
	},
})
