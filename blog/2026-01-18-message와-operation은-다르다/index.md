---
slug: difference-between-message-sending-and-method-calling
title: message 전송과 메서드 호출은 다르다.
authors: hyoyoonnam
tags: [객체지향]
# image: ./my-award.png
---

우리는 흔히 '*메서드를 호출한다*'는 표현을 쓴다. 하지만 객체지향적인 관점에서 엄밀히 하자면 '*메시지를 전송한다*'는 표현이 더 적절하다.

두 표현이 같다는 오해는 정적 타입 언어인 Java로 학습했기 때문인데, 이번 기회에 동적 타입 언어인 Javascript와의 비교를 통해 그 차이를 확인하자.

<!-- truncate -->

---

## 0. 사전 지식과 용어

```java
// 리턴 타입, 메서드명, 파라미터 등은 '선언'이다. '메서드 시그니처', '인터페이스', '오퍼레이션'이라고도 한다.
public void sayHello(String name) {
	// 메서드 바디는 '구현'이다. 그냥 '메서드'라고도 한다.
	System.out.println("안녕 " + name + "!");
}
```

## 1. Java, 정적 타입 언어

Java는 정적 타입 언어이기 때문에 compile-time에 컴파일러가 그 타입을 체크한다.
따라서 sender가 메시지를 전송하려고 할 때, receiver 객체가 해당 인터페이스를 가지고 있지 않다면 실행(메서드 전송)조차 할 수 없다.
즉, compile error가 발생한다.

이로 인해 Java와 같은 정적 타입 언어에서는 '메시지 전송'과 '메서드 호출'이 같다는 착각을 하기 쉽다.

<iframe
 frameBorder="0"
 src="https://onecompiler.com/embed/java/44axz2pcq?codeEditors=true&hideNew=true&hideNewFile=true" 
 width="100%"
 height="500px">
</iframe>

## 2. Javascript, 동적 타입 언어

자바스크립트는 동적 타입 언어이기 때문에 컴파일러가 `sayHello()` 메서드의 존재 여부를 컴파일 타임에 체크하지 않는다.
따라서 해당 메서드를 가지지 않는 `rock` 객체에게도 메시지를 전송할 수는 있다(물론 메서드가 존재하지 않는데 실행한다면 런타임에 에러가 발생한다).

<iframe
 frameBorder="0"
 src="https://onecompiler.com/embed/java/44axefzbe?codeEditors=true&hideNew=true&hideNewFile=true" 
 width="100%"
 height="500px">
</iframe>

### 심지어는 전송된 메시지에 해당하는 인터페이스가 존재하지 않아도 에러가 발생하지 않을 수도 있다.

다음 코드는 '메서드 호출'이라는 관점에서는 설명이 불가하다. `rock` 객체 안에는 `sayHello()`라는 코드가 물리적으로 존재하지 않기 때문이다.

대신 '메시지 전송'이라는 관점에서 설명이 가능한데, sender는 그저 `sayHello`라는 이름의 메시지를 전송했을 뿐이고, receiver가 그 메시지를 낚아채서 동적으로 응답한 상황이다.

<iframe
 frameBorder="0"
 src="https://onecompiler.com/embed/java/44ay38vb2?codeEditors=true&hideNew=true&hideNewFile=true" 
 width="100%"
 height="500px">
</iframe>

## References
오브젝트(조영호, p.49)
