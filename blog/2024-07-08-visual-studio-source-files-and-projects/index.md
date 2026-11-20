---
slug: visual-studio-source-files-and-projects
title: "C | 소스 코드 파일만 제출? 프로젝트 폴더 제출? 프로젝트 폴더에 소스 코드가 없을 때"
date: 2024-07-07T15:16:00+00:00
authors: hyoyoonnam
tags: [C]
---

## 서론

<strong>결론부터 보실 분</strong>은 <strong>좌측(모바일) 또는 상단(PC) 목차에서 결론을 클릭</strong>해주세요.

---

대학이나 기타 기관 등에서 C언어 수업을 배우게 된다면 대부분 Visual Studio를 IDE로 사용합니다.

이때 과제나 시험 문제 풀이 등을 제출할 때 교수가 <strong><u>다음과 같이 요구하는 경우</u></strong>가 많습니다.

> 🗣️ “<strong>소스 파일만</strong> 제출하세요!”

> 🗣️ “<strong>프로젝트 파일</strong> 제출하세요!”

이때 교수의 요구대로 제출하지 못하면 감점되거나, 0점 처리 당하는 경우가 생길 수 있으니 해당 글에서는 다음과 같은 부분들을 알아보도록 하겠습니다.

- Visual Studio에서 C언어 관련 파일을 어떻게 구분하고, 관리하는가?

- `소스 코드`, `프로젝트`, `솔루션`의 차이가 무엇인가?

<!-- truncate -->

## 1. Visual Studio의 파일 관리 구조

### 1. Solution만 생성했을 때

Solution을 생성하면 `Solution_name`과 같은 폴더가 생성되고, 내부에 `Solution_name.sln` 파일과 `.vs` 폴더가 생성됩니다.

<figure>

![notion image](./figure-01.webp)

</figure>

### 2. Project 생성

이제 `Solution_1` 하위에 `Project1`를 생성하겠습니다.

(해당 실습과는 관련없음)이때 Solution 옵션을 <strong>Add to solution</strong>이 아닌<strong> Create new solution</strong>으로 설정하면 프로젝트명과 동일한 솔루션을 자동으로 생성하고 그 하위에 프로젝트를 생성합니다.

<figure>

![기존에 생성했던 Solution\_1 하위에 Project를 생성](./figure-02.webp)

<figcaption>기존에 생성했던 Solution\_1 하위에 Project를 생성</figcaption>
</figure>

<figure>

![Visual Studio에서 확인](./figure-03.webp)

<figcaption>Visual Studio에서 확인</figcaption>
</figure>

<figure>

![Solution\_1 폴더에서 확인](./figure-04.webp)

<figcaption>Solution\_1 폴더에서 확인</figcaption>
</figure>

이때 `Project` 내부에서는 `Source code 파일`을 관리할 수 있습니다.

<figure>

![notion image](./figure-05.webp)

</figure>

### 3. Project1 내부에 여러 source code 생성하기

다음과 같이 한 프로젝트에서는 여러 개의 source code를 생성하고, 관리할 수 있습니다.

또한 동일한 프로젝트 내에서 정의된 source code끼리는 별 다른 설정을 하지 않고도 서로의 함수를 호출할 수 있습니다.

> 다른 프로젝트에 있는 함수를 호출하기 위해서는 헤더 파일을 정의하는 것이 필수적입니다.
> (사실 <strong>같은 프로젝트 내의 함수이더라도</strong> 가독성이나 컴파일러 오류 방지를 위해서 <strong>헤더 파일을 정의하는 것이 권장</strong>되지만, 해당 게시글에서는 단순히 ‘같은 프로젝트 내에 있다’라는 것이 무엇인지에 대해 이해하기 위해서 위와 같이 설명했습니다.)

<figure>

![Project1\_of\_Solution1이라는 동일한 프로젝트 내에 존재하는 source\_code\_1, 2, 3.c이다.
동일한 프로젝트 내에 존재하기 때문에 별 다른 설정없이 서로 간의 함수 호출이 가능하다.](./figure-06.webp)

<figcaption>`Project1_of_Solution1`이라는 동일한 프로젝트 내에 존재하는 `source_code_1, 2, 3.c`이다.
동일한 프로젝트 내에 존재하기 때문에 별 다른 설정없이 서로 간의 함수 호출이 가능하다.</figcaption>
</figure>

<figure>

![동일 프로젝트 간의 함수는 별 다른 설정없이 호출할 수 있습니다.](./figure-07.webp)

<figcaption>동일 프로젝트 간의 함수는 별 다른 설정없이 호출할 수 있습니다.</figcaption>
</figure>

#### Project1에서 Project2의 함수 호출을 시도하기

이번에는 `Project2`에 다음과 같이 `source_code_a.c`를 생성하고, Project1에서 호출을 시도하도록 하겠습니다.

<figure>

![Project1과 다른 Project2에 생성된 source\_code\_a.c](./figure-08.webp)

<figcaption>`Project1`과 다른 `Project2`에 생성된 `source_code_a.c`</figcaption>
</figure>

<figure>

![kbsa() 함수는 Project1과 다른 프로젝트인 Project2에서 생성되고, 관리되기 때문에 호출할 수 없습니다.
(서로 다른 프로젝트 간에는 헤더 파일의 정의를 통해 호출할 수 있지만, 해당 내용은 본 게시글에서는 다루지 않습니다.)](./figure-09.webp)

<figcaption>`kbsa()` 함수는 `Project1`과 다른 프로젝트인 `Project2`에서 생성되고, 관리되기 때문에 호출할 수 없습니다.
(서로 다른 프로젝트 간에는 헤더 파일의 정의를 통해 호출할 수 있지만, 해당 내용은 본 게시글에서는 다루지 않습니다.)</figcaption>
</figure>

## 2. 그림으로 알아보기

위에서 알아본 내용들을 다음 그림과 같이 정리할 수 있습니다.

<figure>

![notion image](./figure-10.webp)

</figure>

## 결론: 소스 코드 / 프로젝트 파일로 제출하려면 어떻게 하는가?

### 1. 소스 코드만 제출하는 방법

소스 코드만 제출하기 위해서는 다음과 같은 단계를 거쳐 소스 코드가 존재하는 폴더로 이동할 수 있습니다. 제 경우에는 `Solution_1 솔루션`의 `Project1_of_Solution1 프로젝트`에서 생성한 `source_code_1.c 소스코드`로 가정하겠습니다.

1. 본인이 제출하려는 소스 코드가 포함된 프로젝트가 포함된 솔루션 폴더로 이동

   제 경우에는 다음과 같습니다. `C:\Blog_C\Solution_1`



   <figure>

   ![notion image](./figure-11.webp)

   </figure>

2. 본인이 제출하려는 소스 코드가 포함된 프로젝트 폴더로 이동

   `C:\Blog_C\Solution_1\Project1_of_Solution1`



   <figure>

   ![notion image](./figure-12.webp)

   </figure>

3. 본인이 제출하려는 소스 코드를 그대로 제출하거나, 압축하여 제출하면 끝.

<figure>

![notion image](./figure-13.webp)

</figure>

### 2. 프로젝트 파일로 제출하는 방법

1. 위 1번을 참고하셔서 `C:\Blog_C\Solution_1`과 같이 솔루션 폴더까지만 이동합니다.

2. 본인이 제출하려는 소스 코드가 포함된 프로젝트 `Project_of_Solution1` 폴더를 압축하여 제출합니다.

   <figure>

   ![notion image](./figure-14.webp)

   </figure>

### \*\*프로젝트 폴더에 소스 코드가 없어요!

분명히 나는 프로젝트에서 소스 코드를 생성하고, 저장했는데 프로젝트 폴더로 가서 확인해보면 소스 코드가 존재하지 않는 경우가 있습니다. 컴파일이나 빌드, 실행도 모두 정상적으로 되는데 말이죠.

다음과 같이 malloc1.c가 Project1\_of\_Solution1 프로젝트에 존재하고, 실행도 잘 되는 것을 확인했는데 막상 프로젝트 폴더로 가보니 소스 코드가 존재하지 않는 당황스러운 일이 발생했습니다.

<figure>

![notion image](./figure-15.webp)

</figure>

<figure>

![notion image](./figure-16.webp)

</figure>

---

소스 코드를 생성할 때는 `새 항목(New Item)`과 `기존 항목(Existing Item)` 중에서 선택할 수 있는데 `기존 항목`<u>으로 소스 코드를 생성한 경우</u> 위와 같은 현상이 발생합니다.

<figure>

![notion image](./figure-17.webp)

</figure>

이때는 다음과 같은 선택지 중에서 선택하여 문제를 해결할 수 있습니다.

- 소스 코드만 제출해야 된다면?

  - `기존 항목`으로 불러왔던 소스 코드를 찾아서 제출하면 됩니다.

- 프로젝트로 제출해야 된다면?

  - 방법1. `기존 항목`으로 불러왔던 소스 코드를 복사하여 프로젝트 폴더로 붙여넣기합니다.
  - 방법2. `기존 항목`으로 불러왔던 소스 코드를 프로젝트 폴더로 이동시킵니다.
  - 방법3. `새 항목`으로 빈 소스 코드 파일을 생성하고, 기존에 작성하던 소스 코드의 내용을 복사하여 붙여넣기합니다.

---

[인블로그 원문](https://codesharpener.inblog.io/c-%EC%86%8C%EC%8A%A4-%EC%BD%94%EB%93%9C-%ED%8C%8C%EC%9D%BC%EB%A7%8C-%EC%A0%9C%EC%B6%9C-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%ED%8F%B4%EB%8D%94-%EC%A0%9C%EC%B6%9C-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%ED%8F%B4%EB%8D%94%EC%97%90-%EC%86%8C%EC%8A%A4-%EC%BD%94%EB%93%9C%EA%B0%80-%EC%97%86%EC%9D%84-%EB%95%8C-23634)

[Notion 원문](https://app.notion.com/p/a7643e3f0d5b4cb681e853709d3ab212)
