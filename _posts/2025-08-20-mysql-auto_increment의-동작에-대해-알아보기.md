---

title: MySQL AUTO_INCREMENT의 동작에 대해 알아보기
date: 2025-08-20 14:50:07 +09:00
categories:
  - Database
tags:
toc: true
comments: true

---

`MySQL Server와 Workbench 8.0.43`을 사용합니다.

코드와 사진이 같이 존재하는 경우 코드(위)와 사진(아래)이 한 쌍을 이룹니다.
  
 
> **해당 포스트를 읽으면:**
> 
> MySQL에서 테이블을 생성할 때 컬럼에 사용할 수 있는 옵션인 AUTO_INCREMENT의 상황별 동작에 대해 파악할 수 있습니다.  
{: .prompt-info }

---
## 1. 서론
[김영한의 실전 데이터베이스 입문](https://www.inflearn.com/courses/lecture?courseId=338210&type=LECTURE&unitId=328681&subtitleLanguage=ko&tab=curriculum) 강의를 듣던 중 AUTO_INCREMENT(이하 'AI') 옵션이 여러 상황에서 어떻게 동작하는지에 대해 의문이 들었다.

내가 가정한 상황들은 다음과 같다.

- 상황1: id 값이 1, 2까지 AI로 추가가 된 상태에서 명시적으로 id 값을 5로 준다면, 다음 AI 추가 때의 값은 3일까? 아니면 6일까?
- 상황2: id 값이 1, 2, ..., 10까지 있는 상태에서 id=10을 지우면, 다음 AI 추가 때의 값은 11일까? 아니면 10일까?


## 2. 본론
`서론`에서 가정한 상황들을 예제 코드를 통해 확인해본다. 먼저 다음과 같이 데이터베이스와 테이블을 생성하자. 해당 테이블은 `서론`에서 언급한 김영한 님의 db 강의 중 일부 내용임을 밝힌다.

```sql
CREATE DATABASE blog_test;
USE blog_test;

CREATE TABLE table1 (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL
);
```

  
### 2.1. 상황1: 중간에 비어있는 값이 있는 경우
```sql
-- 상황 1: 중간에 비어있는 값이 있는 경우
INSERT INTO table1 (name) VALUES ('A'); -- id=1 by A.I.
INSERT INTO table1 (name) VALUES ('B'); -- id=2 by A.I.
INSERT INTO table1 (id, name) VALUES (5, 'C'); -- id=5 by 값 전달
SELECT * FROM table1; -- id가 1, 2, 5로 추가되었는지 확인
```
![상황1-SQL 결과(1)](assets/img/posts/2025-08-20-mysql-auto_increment의-동작에-대해-알아보기.png)  
정상적으로 추가되었음을 확인할 수 있다. 이제 id=3으로 전달해서 데이터를 추가해보자.

  
```sql
INSERT INTO table1 (name) VALUES ('D'); -- id=? by A.I.
SELECT * FROM table1; -- A.I.로 추가된 id를 확인 (6)
```
![상황1-SQL 결과(2)](assets/img/posts/2025-08-20-mysql-auto_increment의-동작에-대해-알아보기-1.png)  
상황1에서는 현재 테이블의 id값 중 최댓값을 기준으로 거기에 1을 더해 A.I. 값이 생성됨을 확인할 수 있다.

  

### 2.2. 데이터베이스가 유지하는 STATUS 값
다음 상황을 확인하기 전에 먼저 데이터베이스가 유지하는 STATUS 값에 대해 알아본 후 넘어가자(현재 id의 최댓값은 6임을 인지하자).

```sql
-- 다음 명령으로 특정 테이블의 STATUS 값들을 확인할 수 있다.
-- SHOW TABLE STATUS FROM `데이터베이스_이름` WHERE `name` LIKE '테이블_이름' ;
SHOW TABLE STATUS FROM `blog_test` WHERE `name` LIKE 'table1' ;
```
![STATUS 값 확인 쿼리의 결과](assets/img/posts/2025-08-20-mysql-auto_increment의-동작에-대해-알아보기-2.png)  
MySQL은 STATUS를 통해  `Auto_increment` 컬럼을 통해 다음에 A.I.에 의해 생성될 값(7)을 유지하고, 필요할 때 사용한다.

또는 다음 명령으로 `Auto_increment` 값만 확인할 수 있다. 이제부터 'A.I. 값을 확인'하라고 하면 해당 코드를 실행하시면 된다.

```sql
SELECT  `AUTO_INCREMENT`
FROM    INFORMATION_SCHEMA.TABLES
WHERE   TABLE_SCHEMA = 'blog_test'
AND     TABLE_NAME   = 'table1';
```
![Auto_increment 값만 확인한 결과](assets/img/posts/2025-08-20-mysql-auto_increment의-동작에-대해-알아보기-3.png)  

  
### 2.3. 상황2: 기존의 id 최댓값을 지우고 다시 A.I.로 생성하는 경우
현재 id의 최댓값은 6이다.

```sql
-- 상황 2: 기존의 최댓값(6)을 삭제한 경우
DELETE FROM table1 WHERE id = 6;

-- A.I.값을 확인: 6으로 하향 조정된 것이 아니라, 여전히 7이다.
```
![](assets/img/posts/2025-08-20-mysql-auto_increment의-동작에-대해-알아보기-4.png)  

```sql
INSERT INTO table1 (name) VALUES ('E'); -- id=7 by A.I.
SELECT * FROM table1; -- A.I.로 추가된 id를 확인 (7). id=6은 이전에 삭제되어서 없다.
```
![](assets/img/posts/2025-08-20-mysql-auto_increment의-동작에-대해-알아보기-5.png)  
## 3. 결론
(MySQL 기준) DBMS는 내부적으로 각 테이블의 STATUS 정보를 관리하고, 여기에는 AUTO_INCREMENT에서 사용할 값도 포함되어 있습니다.

STATUS에서는 `사용된 기록이 있는 최댓값 + 1`을 AUTO_INCREMENT 값으로 유지하며 다음 A.I. 때 활용합니다.

  
## 4. 새롭게 도출한 사실
해당 포스팅을 작성하면서 새롭게 알아낸 사실에 대해 다룹니다.

### 4.1. AUTO_INCREMENT는 테이블 당 하나의 컬럼에만 지정할 수 있다.
`SHOW TABLE STATUS FROM blog_test;` 명령을 통해서 STATUS 정보를 <ins>테이블마다</ins> 관리함을 확인할 수 있었다. 이로부터 '그러면 한 테이블에서 A.I.를 여러 개 사용할 수 없겠네?'라고 추정했고, 다음과 같이 사실임을 확인할 수 있었다.

```sql
-- A.I.를 두 개 컬럼에 지정을 시도
CREATE TABLE table2 (
  id1    INT AUTO_INCREMENT PRIMARY KEY,
  id2    INT UNIQUE AUTO_INCREMENT,
  name   VARCHAR(50) NOT NULL
);
```

**에러 메시지**   
```text
Error Code: 1075. Incorrect table definition; 
there can be only one auto column 
and it must be defined as a key
```
또한 에러 메시지를 통해 A.I.는 key 컬럼에만 지정할 수 있다는 것도 확인할 수 있었다.

  
## References
[get current auto increment value for any table - 스택오버플로우](https://stackoverflow.com/questions/15821532/get-current-auto-increment-value-for-any-table) - 검색어: how to check auto increment value in mysql

[김영한의 실전 데이터베이스 입문](https://www.inflearn.com/courses/lecture?courseId=338210&type=LECTURE&unitId=328681&subtitleLanguage=ko&tab=curriculum)

