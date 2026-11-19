const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const {load} = require('cheerio');
const {execFileSync} = require('node:child_process');
const {postInfo} = require('./translate-blog.cjs');

const posts = execFileSync('git', ['ls-files', '-z', 'blog'], {encoding: 'utf8'}).split('\0')
  .filter(file => /^blog\/\d{4}-\d{2}-\d{2}-[^/]+\/index\.mdx?$/.test(file));
let checked = 0;
for (const file of posts) {
  const {target} = postInfo(file);
  if (!fs.existsSync(target)) {
    assert.notEqual(file, process.env.POST_PATH, '생성한 영어판을 찾을 수 없습니다.');
    continue;
  }
  const korean = matter(fs.readFileSync(file, 'utf8'));
  if (korean.data.draft) continue;
  const english = matter(fs.readFileSync(target, 'utf8'));
  for (const field of ['slug', 'date', 'authors', 'tags']) {
    assert.deepEqual(english.data[field], korean.data[field], `${file} ${field}`);
  }
  const slug = korean.data.slug.replace(/^\//, '');
  const pages = ['', 'en/'].map(prefix => load(fs.readFileSync(path.join('build', prefix, `${slug}.html`), 'utf8')));
  const [ko, en] = pages;
  assert.equal(ko('article time').attr('datetime'), en('article time').attr('datetime'), `${file} 게시 시각`);
  assert.ok(ko('article time').attr('datetime'));
  for (const [i, $] of pages.entries()) {
    const locale = i ? 'en' : 'ko';
    const other = i ? 'ko' : 'en';
    const destination = `/${i ? '' : 'en/'}${slug}`;
    assert.equal($('html').attr('lang'), locale);
    assert.equal($('article header h1').text(), (i ? english : korean).data.title);
    const links = $('nav a[lang="' + other + '"]');
    assert.equal(links.length, 1);
    assert.equal(new URL(links.attr('href'), 'https://hyoyoonnam.github.io').pathname, destination);
    assert.equal(new URL($('link[rel="alternate"][hreflang="' + other + '"]').attr('href')).pathname, destination);
    const instant = new Date($('article time').attr('datetime'));
    assert.equal($('article time').text(), new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul',
    }).format(instant));
    for (const image of $('article .markdown img').toArray()) {
      const url = $(image).attr('src');
      if (/^(https?:|data:)/.test(url)) continue;
      assert.ok(fs.existsSync(path.join('build', decodeURIComponent(url))), `${file} ${url}`);
    }
  }
  checked++;
}
console.log(`글 ${checked}쌍의 작성일과 언어 전환을 확인했습니다.`);
