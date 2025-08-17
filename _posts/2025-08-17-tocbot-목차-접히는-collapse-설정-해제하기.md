---
title: tocbot 목차 접히는 collapse 설정 해제하기
date: 2025-08-17 22:14:40 +09:00
categories:
  - 깃허브 블로그 운영하기
tags:
  - tocbot
toc: true
comments: true
---

> **요약:** 깃허브 블로그에서 자주 사용하는 jekyll 테마에서는 대부분 tocbot을 통해 목차를 제공합니다. 이때 기본적으로 최상위 제목 외에는 접히도록(collapse) 설정된 경우가 많은데 이를 펼치는 방법에 대해서 다룹니다.


> jekyll - chirpy 테마 사용자가 작성한 글입니다. 다른 테마의 경우 설정 파일 등이 달라서 해당 포스트에서 제시하는 해결 방법을 적용하기에 어려울 수 있습니다.   
{: .prompt-warning }

  

---
## 1. 문제 상황
![](assets/img/posts/2025-08-17-tocbot-목차-접히는-collapse-설정-해제하기.png)

현재는 이렇게 최상위 제목만 toc 부분에 노출되고 있습니다.

![](assets/img/posts/2025-08-17-tocbot-목차-접히는-collapse-설정-해제하기-1.png)

`2. 본론`의 경우 그 하위에도 제목이 존재하는데, 평소에는 접혀있다가, 해당 상위 제목으로 스크롤이 이동했을 때만 그에 해당하는 하위 제목들이 펼쳐지는 상황입니다.

제 경우에는 이런 기본 설정이 아니라, 항상 모든 하위 제목까지 펼쳐지도록 하는 편이 포스트 읽기에 더 적합하다고 판단해서 모두 펼치도록 하는 방법을 제시하려고 합니다.

### 1.1. 원하는 결과
![](assets/img/posts/2025-08-17-tocbot-목차-접히는-collapse-설정-해제하기-2.png)

이렇게 항상 하위 목차들이 펼쳐져 있도록 하는 것이 해당 포스트의 목적입니다!

## 2. 해결 방법
github 블로그를 관리하기 위한 로컬 디렉토리에서 `assets/css/jekyll-theme-chirpy.scss` 파일로 들어가면 아마 다음과 같이 초기 코드가 작성되어 있을 것입니다.

```scss
---
---

/* prettier-ignore */
@use 'main
{%- if jekyll.environment == 'production' -%}
  .bundle
{%- endif -%}
';

/* append your custom style below */

```

이때 코드 파일 하단 부에 다음과 같은 코드를 추가해주면 끝입니다!

```scss
.is-collapsed {
  max-height: none !important;
}
```

### 2.1. 내부 동작
> 해당 챕터에서는 `2. 해결 방법`에서 추가한 css 코드가 어떻게 동작하길래 우리가 원하는 결과를 주는 것인지를 내부 동작을 분석하며 설명합니다.
> 
> 이미 위에서 다룬 내용만으로 문제 상황은 해결이 가능하니 더 궁금하신 분들만 확인하시면 좋을 챕터입니다.   
{: .prompt-tip }

chirpy 테마가 사용하는 [tocbot 라이브러리의 css 파일](https://github.com/tscanlin/tocbot/blob/master/src/scss/_tocbot-core.scss)을 보면 다음과 같은 코드가 있습니다.

```scss
.is-collapsed {
  max-height: 0;
}
```

이 코드의 동작 방식은 간단합니다.

1. 자바스크립트(Tocbot)는 스크롤 위치에 따라, 숨겨야 할 하위 목차에 `.is-collapsed` 라는 이름표(클래스)를 붙입니다.
	- 현재 스크롤이 `##1. 문제 상황`이라면 그 하위인 `###1.1. 원하는 결과`를 제외한 다른 하위 목차 `### 2.1. 내부 동작` 등에는 `.is_collapsed` 클래스를 붙인다.
2. 브라우저는 이 이름표가 붙은 요소에 위 CSS 규칙을 적용합니다.
3. `max-height: 0;`은 말 그대로 **"최대 높이를 0으로 만들어라"** 는 뜻입니다. 따라서 내용물이 있더라도 높이가 0이 되어 화면에서 보이지 않게 되는 것, 즉 '접힘' 효과가 만들어집니다.

<br>

그런데 우리는 chripy 테마 자체의 css 파일에 다음과 같은 코드를 추가했었죠.

```css
.is-collapsed {
  max-height: none !important;
}
```

이 코드는 `!important` 옵션을 함께 줘서 해당 규칙이 항상 이기게끔 하여 <ins>tocbot의 css를 무력화시키는</ins> 효과를 가집니다. `.is-collapsed` 클래스가 붙은 경우에도 max-height를 따로 지정하지 않기 때문에 모든 하위 목차를 펼치도록 하는 것이죠.

## 3. 여담
![](assets/img/posts/2025-08-17-tocbot-목차-접히는-collapse-설정-해제하기-3.png)

*사진: tocbot api 중 일부*


tocbot api를 사용할 때 options args를 넘겨서 어떤 수준의 제목까지 고정적으로 펼칠 것인지 확인할 수가 있습니다.

그래서 처음에는 `_javascripts/modules/components/toc/toc-desktop.js` 파일에서 해당 옵션을 설정하는 방식으로 해결하려 했으나, 결과적으로 옵션이 정상적으로 적용되지 않아 해결에 실패했습니다.

이후 구글링을 하다가 찾은 해결 방법이 위에서 다룬 css 파일 수정인데, collapse와 같은 설정을 css 파일 한 곳에서 관리할 수 있다는 장점 덕분에 더 유용하다고 생각되네요.

## References
[chripy 테마 github discussions - How to prevent the TOC from being collapsed initially when I use chirpy-starter](https://github.com/cotes2020/jekyll-theme-chirpy/discussions/1706)

[tocbot api](https://github.com/tscanlin/tocbot#usage)

