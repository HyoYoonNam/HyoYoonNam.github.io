const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const matter = require('gray-matter');
const {createProcessor} = require('@mdx-js/mdx');
const {translationSegments, applyTranslationSegments, readGlossary, matchesTranslation, postInfo, render, requestTranslation} = require('./translate-blog.cjs');

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

test('기존 글의 MDX 구문과 코드를 유지하며 문장을 교체할 수 있다', () => {
  for (const folder of fs.readdirSync('blog')) {
    const file = `blog/${folder}/index.md`;
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const parsed = matter(text);
    render(text, {title: parsed.data.title, description: parsed.data.description, body: parsed.content});
    const segments = translationSegments(parsed.content);
    const body = applyTranslationSegments(parsed.content, segments, segments.map(segment => segment.text));
    render(text, {title: parsed.data.title, description: parsed.data.description, body});
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
    const input = JSON.parse(request.input);
    assert.deepEqual(input.segments, {segment_0: '안녕하세요.', segment_1: '사진'});
    assert.deepEqual(input.glossary, readGlossary().glossary);
    assert.ok(input.glossary.terms.some(term => term.korean === '우테코' && term.english === 'Woowacourse'));
    assert.equal(request.text.format.type, 'json_schema');
    assert.equal(request.text.format.strict, true);
    assert.deepEqual(request.text.format.schema.properties.translations.required, ['segment_0', 'segment_1']);
    assert.equal(request.text.format.schema.properties.translations.additionalProperties, false);
    attempts++;
    if (attempts === 1) return {ok: false, status: 429};
    return {ok: true, json: async () => ({status: 'completed', output: [{content: [{type: 'output_text', text: JSON.stringify({title: translation.title, description: translation.description, translations: {segment_1: 'A photo', segment_0: 'Hello.'}})}]}]})};
  };
  assert.deepEqual(await requestTranslation(matter(source), [], {fetchImpl, wait: async () => {}}), {...translation, body: translation.body.replace('Hello.', 'Hello\\.')});
  assert.equal(attempts, 2);
  await assert.rejects(requestTranslation(matter(source), [], {fetchImpl: async () => ({ok: false, status: 401})}), /HTTP 401/);
  await assert.rejects(requestTranslation(matter(source), [], {fetchImpl: async () => ({ok: true, json: async () => ({status: 'incomplete'})})}), /완료/);
  for (const translations of [{segment_0: 'Hello.'}, {segment_0: 'Hello.', segment_1: 'A photo', segment_2: 'Extra'}]) {
    const fetchImpl = async () => ({ok: true, json: async () => ({status: 'completed', output: [{content: [{type: 'output_text', text: JSON.stringify({title: translation.title, description: translation.description, translations})}]}]})});
    await assert.rejects(requestTranslation(matter(source), [], {fetchImpl}), /식별자/);
  }
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


test('원문과 용어 사전이 모두 같은 경우에만 자동 번역을 재사용한다', () => {
  const {fingerprint} = readGlossary();
  const output = render(source, translation, fingerprint);
  assert.ok(matchesTranslation(output, source, fingerprint));
  assert.equal(matchesTranslation(output, source + '\n수정', fingerprint), false);
  assert.equal(matchesTranslation(output, source, 'changed-glossary'), false);
  assert.equal(matchesTranslation(output.replace(/<!-- translation-glossary-sha256:.*? -->/, ''), source, fingerprint), false);
});
test('번역 문장만 교체해 인라인 코드와 HTML, 링크 순서를 유지한다', () => {
  const text = '<strong>기존 파일</strong>은 `기존 항목`으로 추가합니다.\n\n![사진 [설명]](./photo.png)\n\n<!-- truncate -->\n\n```java\nString value = "한글";\n```';
  const segments = translationSegments(text);
  assert.deepEqual(segments.map(segment => segment.text), ['기존 파일', '은 ', '으로 추가합니다.', '사진 [설명]']);
  const body = applyTranslationSegments(text, segments, ['Existing files', ' are added with ', '.', 'A photo']);
  assert.ok(body.includes('`기존 항목`'));
  assert.ok(body.includes('<strong>Existing files</strong>'));
  assert.ok(body.includes('![A photo](./photo.png)'));
  assert.ok(body.includes('<!-- truncate -->'));
  render('---\ntitle: 글\nslug: post\n---\n' + text, {title: 'Post', description: null, body});
  assert.throws(() => applyTranslationSegments(text, segments, []));
  const escaped = applyTranslationSegments(text, segments, segments.map(() => '`new-code` {process.env.SECRET} <script>'));
  render('---\ntitle: 글\nslug: post\n---\n' + text, {title: 'Post', description: null, body: escaped});
});

test('축약 참조의 표시 문구를 번역해도 원래 링크와 이미지 정의로 연결한다', () => {
  for (const prefix of ['', '!']) {
    for (const suffix of ['', '[]', '[한국어]']) {
      const body = `${prefix}[한국어]${suffix}\n\n[한국어]: https://example.com`;
      const segments = translationSegments(body);
      const translated = applyTranslationSegments(body, segments, ['English']);
      assert.ok(translated.startsWith(`${prefix}[English][한국어]`));
      const original = '---\ntitle: 글\nslug: post\n---\n' + body;
      render(original, {title: 'Post', description: null, body: translated});
      assert.throws(() => render(original, {title: 'Post', description: null, body: translated.replace('[English][한국어]', '[English][missing]')}));
    }
  }
  const body = '[한\\[국어\\]]\n\n[한\\[국어\\]]: https://example.com';
  const translated = applyTranslationSegments(body, translationSegments(body), ['English']);
  assert.ok(translated.startsWith('[English][한\\[국어\\]]'));
  render('---\ntitle: 글\nslug: post\n---\n' + body, {title: 'Post', description: null, body: translated});
});

test('번역 문장의 목록 표식을 일반 문장으로 표시한다', () => {
  const body = '한국어 문장입니다.';
  for (const text of ['- Option A', '+ Option A', '1. First', '1) First', '---']) {
    const translated = applyTranslationSegments(body, translationSegments(body), [text]);
    const tree = createProcessor().parse(translated);
    assert.equal(tree.children.length, 1);
    assert.equal(tree.children[0].type, 'paragraph');
    assert.equal(tree.children[0].children[0].value, text);
  }
});
