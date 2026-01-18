// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'HyoYoonNam Blog',
  tagline: '개발 블로그',
  // Set the production url of your site here
  url: 'https://hyoyoonnam.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'HyoYoonNam', // Usually your GitHub org/user name.
  projectName: 'hyoyoonnam.github.io', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: false, // 블로그 글 링크에 항상 슬래시(/)를 붙이도록 설정

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  // goat counter page view
  scripts: [
    {
      src: '//gc.zgo.at/count.js',
      async: true,
      'data-goatcounter': 'https://hyoyoon.goatcounter.com/count',
    },
  ],

  // docu plugin
  plugins: [
    // 인덱싱을 통한 글 검색 지원
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ["en", "ko"], // 한국어 지원
        indexBlog: true,        // 블로그 검색 켜기
        indexDocs: false,       // 문서(Docs)는 안 쓰니까 끄기
        // 도큐사우르스 기본에서는 블로그 경로가 /blog이라 이 경로를 default로 써서, 바꿔줘야 됨.
        blogRouteBasePath: "/",
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // 문서 기능은 비활성화(블로그로만 사용할 것임)
        docs: false,
        blog: {
          routeBasePath: '/', // url로 접속하자마자 블로그로 연결되도록 설정
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // blogSidebarTitle: 'All Posts',
          // blogSidebarCount: 'ALL',
          // default sidebar title='Recent posts'
          blogSidebarCount: 10, // default-5

          editUrl:
            'https://github.com/hyoyoonnam',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      metadata: [
        {
        name:"google-site-verification",
        content: "MpUXs1cY0YU852yOOrtuI5ol_-eWWklSZtPgX1ttkIs"
        },
        {
        name:"naver-site-verification",
        content: "60feb4831bad4f2310f1a92cb2318582d96a0efc"
        },
      ],
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'HyoYoonNam Blog',
        logo: {
          alt: 'HyoYoonNam Blog Logo',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/tags', label: 'Tags', position: 'left'}, // 태그 목록
          {to: '/archive', label: 'Archive', position: 'left'}, // 전체 글 목록
          {
            href: 'https://github.com/HyoYoonNam',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: 'https://www.linkedin.com/in/hyoyoonnam/',
            label: 'LinkedIn',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/HyoYoonNam',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/hyoyoonnam/',
              }
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} HyoYoonNam. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['java', 'javascript'],
      },
    }),
};

export default config;
