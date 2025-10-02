---
title: "MySQL, HAVING 절에서 SELECT 절의 Alias(별칭)를 사용해도 에러가 발생하지 않는 이유"
slug: why-can-use-alias-of-select-list-in-having-clause
date: 2025-08-22 14:45:28 +09:00
categories:
  - Database
tags:
  - mysql
toc: true
comments: true
---

  
> **해당 포스팅을 읽으면:**
> 
> SQL 각 절(clause)의 논리적 실행 순서에 위배되는 `HAVING` 절에서의 Alias 사용이 MySQL에서 허용되는 이유가 무엇인지에 대해 공식 문서를 근거로 확인할 수 있습니다.  
{: .prompt-info }

해당 포스팅에서 사용한 DB 데이터는 [김영한의 데이터베이스 실전 입문](https://www.inflearn.com/courses/lecture?courseId=338210&unitId=328702) 내용 중 일부임을 밝힙니다.

---

## Environments
- **OS:** macOS Sequoia 15.6
- **CPU:** x86
- **DB:** MySQL Server/Workbench 8.0.4

## 실습 데이터
```sql
-- CREATE DATABASE blog_test;
USE blog_test;

CREATE TABLE order_stat (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(50),
  category VARCHAR(50),
  product_name VARCHAR(100),
  price INT,
  quantity INT,
  order_date DATE
);

INSERT INTO order_stat (customer_name, category, product_name, price, quantity, order_date) VALUES
('이순신', '전자기기', '프리미엄 기계식 키보드', 150000, 1, '2025-05-10'),
('세종대왕', '도서', 'SQL 마스터링', 35000, 2, '2025-05-10'),
('신사임당', '가구', '인체공학 사무용 의자', 250000, 1, '2025-05-11'),
('이순신', '전자기기', '고성능 게이밍 마우스', 80000, 1, '2025-05-12'),
('세종대왕', '전자기기', '4K 모니터', 450000, 1, '2025-05-12'),
('장영실', '도서', '파이썬 데이터 분석', 40000, 3, '2025-05-13'),
('이순신', '문구', '고급 만년필 세트', 200000, 1, '2025-05-14'),
('세종대왕', '가구', '높이조절 스탠딩 데스크', 320000, 1, '2025-05-15'),
('신사임당', '전자기기', '노이즈캔슬링 블루투스 이어폰', 180000, 1, '2025-05-15'),
('장영실', '전자기기', '보조배터리 20000mAh', 50000, 2, '2025-05-16'),
('홍길동', NULL, 'USB-C 허브', 65000, 1, '2025-05-17');
```
  
## 1. 서론
이 글을 읽으시는 분들이 이미 알고 계실, SQL 각 절의 논리적인 실행 순서는 다음과 같습니다.

```text
FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
```

위 작동 순서대로라면 아래 코드는 오류가 발생해야 됩니다. `HAVING` 절 실행 시점에는 `SELECT` list의 `카테고리별 매출`이라는 Alias(별칭)가 아직 정의되지 않았기 때문이죠.

```sql
SELECT 
    category,
    SUM(price * quantity) AS `카테고리별 매출` 
FROM 
    order_stat 
GROUP BY 
    category 
HAVING 
    `카테고리별 매출` > 500000 
ORDER BY 
    `카테고리별 매출` DESC
;
```


그런데 실제로 쿼리를 실행하면 에러가 발생하지 않고, 정상적으로 실행됨을 확인할 수 있습니다. 왜일까요?

![HAVING 절에서 Alias를 참조한 쿼리의 실행 결과](assets/img/posts/2025-08-22-mysql,-having-절에서-select-절의-alias(별칭)를-사용해도-에러가-발생하지-않는-이유.png)


  
## 2. 본론
이제 에러가 발생하지 않은 이유에 대해서 알아봅시다!

  
### 2.1. SQL Extension (확장된 SQL)
MySQL, PostgreSQL, Oracle 등의 DBMS 구현체들은 SQL 표준을 따르면서도, 추가적으로 본인들이 제작한 편의 기능이나 문법 등을 추가하기도 합니다.

[MySQL의 매뉴얼](https://dev.mysql.com/doc/refman/8.0/en/group-by-handling.html)에서는 그 중 하나로 Extension(확장) 기능을 다루고 있는데요.

![MySQL 8.0 Reference Manual 중 일부](assets/img/posts/2025-08-22-mysql,-having-절에서-select-절의-alias(별칭)를-사용해도-에러가-발생하지-않는-이유-1.png)  
위 사진에 적힌 그대로 **"MySQL extension은 (집계 함수를 사용한) 집계된 컬럼의 별칭을 HAVING 절에서 사용하는 것을 허용한다."**고 명시되어 있습니다. 이 덕분에 에러가 나지 않던 것이네요!

제가 포스팅에 작성한 예제 코드도 `SUM(price * quantity) AS 카테고리별 매출`로 집계 함수를 사용한 집계 컬럼이기 때문에 그 별칭을 `HAVING` 절에서도 사용이 가능했던 것입니다.

  
### 2.2. SQL 표준과 비표준, Extension
MySQL extension 덕분에 `HAVING` 절에서의 별칭 사용이 허용되어 코드 중복을 최소화하고 가독성을 증대시킬 수 있었습니다. **그런데 여기서 주의할 점이 있습니다.**

앞서 언급했듯이 extension은 <ins>SQL 표준이 아닙니다</ins>. 덕분에 얻은 이점도 존재하지만, 향후의 DB 호환성이나 유연성 등을 고려하면 비표준을 사용함으로써 얻는 이점보다 잠재적 위험으로 인한 단점이 더 커질 위험도 있겠네요.

(SQL 표준을 엄격하게 지키는 SQL Server, Oracle 등의 DBMS에서는 해당 쿼리가 에러를 발생시킵니다.)

영한님께서도 **"HAVING 절에 별칭을 사용하지 않고 SUM(price * quantity)와 같이 집계 함수 표현식을 사용하는 것이 안전하고 호환성이 높은 방법이다."**라고 설명하고 있습니다. 이에 대한 내용은 [해당 강의](https://www.inflearn.com/courses/lecture?courseId=338210&type=LECTURE&unitId=328706&subtitleLanguage=ko&tab=curriculum)를 참고해주세요. 무료 강의입니다!

  
## 3. 결론
SQL 표준을 넘어서 각 DBMS가 추가적으로 지원하는 비표준 편의 기능이 있고, 그 중 하나가 MySQL의 HAVING 절에서의 Alias 허용이라는 사실에 대해 알아봤습니다.

또한 비표준 기능을 사용함으로써 얻는 이점도 분명히 존재하지만, 그에 대한 단점도 무시할 수 없으며 정말 필요한 상황이 아니라면 표준을 준수하는 방향이 더 권장된다는 것도 알 수 있었네요.

  
## References
[MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/group-by-handling.html)

[김영한의 실전 데이터베이스 입문: HAVING - 그룹 필터링1 - 인프런](https://www.inflearn.com/courses/lecture?courseId=338210&type=LECTURE&unitId=328706&subtitleLanguage=ko&tab=curriculum)