const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const matter = require('gray-matter');
const {postInfo, render, requestTranslation} = require('./translate-blog.cjs');

const source = `---
slug: a-new-post
title: 새 글
date: 2026-11-19T23:59:59.123456+09:00
authors: hyoyoonnam
tags: [기술]
description: 원문 요약
---
안녕하세요.

<!-- truncate -->

![사진](./photo.png)

\`\`\`java
System.out.println("안녕");
\`\`\`

<iframe src="https://example.com/demo" />
`;
const translation = {title: 'A New Post', description: 'A summary', body: matter(source).content.replace('안녕하세요.', 'Hello.').replace('![사진]', '![A photo]')};

test('작성일 문자열, slug, 태그와 상대 경로를 보존한다', () => {
  const result = render(source, translation);
  assert.ok(result.includes('date: 2026-11-19T23:59:59.123456+09:00'));
  assert.equal(matter(result).data.slug, 'a-new-post');
  assert.deepEqual(matter(result).data.tags, ['기술']);
  assert.equal(matter(result).data.title, 'A New Post');
  assert.equal(matter(result).data.description, 'A summary');
  assert.ok(result.includes('translation-source-sha256:'));
});

test('기존 글처럼 date가 없으면 파일명에서 날짜를 유추하도록 그대로 둔다', () => {
  assert.equal(matter(render(source.replace(/^date:.*\n/m, ''), translation)).data.date, undefined);
});

test('코드, 링크, MDX 실행 구문, 미리보기 구분자의 변경을 차단한다', () => {
  for (const body of [
    translation.body.replace('System.out', 'System.err'),
    translation.body.replace('./photo.png', './other.png'),
    translation.body + '\n{process.env.GITHUB_TOKEN}\n',
    translation.body.replace('src="https://example.com/demo"', 'src="https://example.com/other"'),
    translation.body.replace('<!-- truncate -->', ''),
  ]) assert.throws(() => render(source, {...translation, body}));
});

test('기존 16편의 MDX 구문과 코드도 검사할 수 있다', () => {
  for (const folder of fs.readdirSync('blog')) {
    const file = `blog/${folder}/index.md`;
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const parsed = matter(text);
    render(text, {title: parsed.data.title, description: parsed.data.description, body: parsed.content});
  }
});

test('같은 글은 항상 같은 작업 브랜치와 영어 경로를 사용한다', () => {
  const file = 'blog/2026-11-19-새-글/index.md';
  assert.deepEqual(postInfo(file), postInfo(file));
  assert.ok(postInfo(file).target.endsWith('/2026-11-19-새-글/index.md'));
  assert.throws(() => postInfo('blog/../../.env'));
});

test('Responses 요청 형식, 완료 검사와 일시 오류 재시도를 확인한다', async () => {
  let attempts = 0;
  const fetchImpl = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const request = JSON.parse(options.body);
    assert.equal(request.store, false);
    assert.equal(request.text.format.type, 'json_schema');
    assert.equal(request.text.format.strict, true);
    attempts++;
    if (attempts === 1) return {ok: false, status: 429};
    return {ok: true, json: async () => ({status: 'completed', output: [{content: [{type: 'output_text', text: JSON.stringify(translation)}]}]})};
  };
  assert.deepEqual(await requestTranslation(matter(source), [], {fetchImpl, wait: async () => {}}), translation);
  assert.equal(attempts, 2);
  await assert.rejects(requestTranslation(matter(source), [], {fetchImpl: async () => ({ok: false, status: 401})}), /HTTP 401/);
  await assert.rejects(requestTranslation(matter(source), [], {fetchImpl: async () => ({ok: true, json: async () => ({status: 'incomplete'})})}), /완료/);
});

test('자동 실행의 추가, 수정 감지와 수동 실행의 누락 글 탐색을 확인한다', () => {
  const os = require('node:os');
  const path = require('node:path');
  const {execFileSync} = require('node:child_process');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-translation-test-'));
  const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
  const oldFile = 'blog/2026-11-18-old/index.md';
  const newFile = 'blog/2026-11-19-new/index.md';
  const write = (file, text) => {
    fs.mkdirSync(path.join(root, path.dirname(file)), {recursive: true});
    fs.writeFileSync(path.join(root, file), text);
  };
  try {
    git('init', '-q');
    git('config', 'user.name', 'Test');
    git('config', 'user.email', 'test@example.com');
    write(oldFile, source);
    write(postInfo(oldFile).target, render(source, translation));
    git('add', '.');
    git('commit', '-qm', 'initial');
    const before = git('rev-parse', 'HEAD');
    write(oldFile, source + '\n수정\n');
    write(newFile, source);
    git('add', '.');
    git('commit', '-qm', 'update');
    const after = git('rev-parse', 'HEAD');
    const run = env => {
      const output = path.join(root, 'output');
      fs.writeFileSync(output, '');
      execFileSync(process.execPath, [path.join(__dirname, 'translate-blog.cjs'), 'prepare'], {
        cwd: root, env: {...process.env, BEFORE_SHA: '', AFTER_SHA: '', POST_PATH: '', ...env, GITHUB_OUTPUT: output},
      });
      return JSON.parse(fs.readFileSync(output, 'utf8').trim().slice('posts='.length)).map(post => post.file);
    };
    assert.deepEqual(run({BEFORE_SHA: before, AFTER_SHA: after}), [oldFile, newFile]);
    assert.deepEqual(run({}), [oldFile, newFile]);
    assert.deepEqual(run({POST_PATH: oldFile}), [oldFile]);
    write(newFile, source.replace('authors:', 'draft: true\nauthors:'));
    assert.deepEqual(run({}), [oldFile]);
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
});


test('인용문 안 코드와 길이가 다른 fence, 인라인 코드를 보존한다', () => {
  for (const block of ['> ```java\n> int x = 1;\n> ```', '```java\nint x = 1;\n````', '값은 `x = 1`이다.']) {
    const text = source + '\n' + block + '\n';
    assert.throws(() => render(text, {...translation, body: translation.body + '\n' + block.replace('x = 1', 'x = 2') + '\n'}));
  }
});
