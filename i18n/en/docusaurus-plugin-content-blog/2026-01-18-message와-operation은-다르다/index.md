---
slug: difference-between-message-sending-and-method-calling
title: "Sending a Message and Calling a Method"
authors: hyoyoonnam
tags: [객체지향]
# image: ./my-award.png
started: '2026-01-18T00:00:00.000Z'
deadline(or finished): null
---

We often say that we *call a method*. Seen through the lens of object-oriented programming, a more precise description of what the sender does is *send a message*.

I learned this in Java, a statically typed language, where the two are easy to conflate. Comparing it with JavaScript helped me see the distinction.

<!-- truncate -->

---

## 0. A little terminology

```java
// The return type, name, and parameters are part of the declaration. In discussing the interface, we’ll refer to the operation and its signature.
public void sayHello(String name) {
	// The body supplies the implementation, also called the method.
	System.out.println("안녕 " + name + "!");
}
```

## 1. Java checks types before the program runs

Java is statically typed. The compiler checks the type at compile time.
When the sender tries to send a message, the receiver’s declared type has to expose the corresponding operation. Otherwise, the program never gets to send it.
Compilation fails.

Working in a language like Java, it’s easy to come away thinking that sending a message and calling a method are the same thing.

<iframe
 frameBorder="0"
 src="https://onecompiler.com/embed/java/44axz2pcq?codeEditors=true&hideNew=true&hideNewFile=true"
 width="100%"
 height="500px">
</iframe>

## 2. JavaScript checks at runtime

JavaScript is dynamically typed. There’s no compile-time check that a `sayHello()` method exists on the receiver.
You can try sending the message to a `rock` object that has no such method. Ordinarily, trying to call it will then fail at runtime.

<iframe
 frameBorder="0"
 src="https://onecompiler.com/embed/java/44axefzbe?codeEditors=true&hideNew=true&hideNewFile=true"
 width="100%"
 height="500px">
</iframe>

### A receiver can even respond without defining the named method

It’s hard to explain the next example as a call to a method on `rock`. There’s no `sayHello()` implementation sitting on that object.

The message model makes it easier to follow. The sender sends a message named `sayHello`. The receiver intercepts it and decides how to respond at runtime.

<iframe
 frameBorder="0"
 src="https://onecompiler.com/embed/java/44ay38vb2?codeEditors=true&hideNew=true&hideNewFile=true"
 width="100%"
 height="500px">
</iframe>

## References
*Objects*, Cho Young-ho, p. 49.
