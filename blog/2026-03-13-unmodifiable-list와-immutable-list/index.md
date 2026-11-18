---
slug: difference-between-collections-unmodifiablelist-and-List-of-immutablelist
title: unmodifiableList와 ImmutableList
authors: hyoyoonnam
tags: [Java]
status: 🟩_done
topics: ['[[woowa]]', '[[Lv 1]]', '[[Java]]']
started: '2026-03-13T00:00:00.000Z'
deadline(or finished): '2026-03-16T22:00:00.000Z'
---

:::note[이 글을 읽으면]

1. '수정이 불가능한' 컬렉션과 '불변' 컬렉션의 차이를 view와 capture로 설명할 수 있어요.

2. 다음 두 코드로 생성한 컬렉션 객체의 차이를 알 수 있어요.
    - `Collections.unmodifiableList()`
    - `List.of()` 또는 `List.copyOf()`

:::

<!-- truncate -->

# 1. 공통점: 수정 메서드를 호출하면 예외가 발생한다

수정 메서드를 호출하면 `UnsupportedOperationException` 예외가 발생한다.

<iframe
  frameBorder="0"
  src="https://onecompiler.com/java/44gg6wqev?codeEditors=true&hideNew=true&hideNewFile=true"
  width="100%"
  height="600px"
  title="Unmodifiable vs Immutable List Java Example">
</iframe>

# 2. 차이점

## 2.1. 구현체 클래스가 다르다

<iframe
  frameBorder="0"
  src="https://onecompiler.com/java/44gh4m5rq?codeEditors=true&hideNew=true&hideNewFile=true"
  width="100%"
  height="600px"
  title="Unmodifiable vs Immutable List Java Example">
</iframe>

## 2.2. 원본 컬렉션과의 관계성이 다르다

### UnmodifiableList

`UnmodifiableRandomAccessList` 구현체(이하 `UnmodifiableList`)는 원본 컬렉션에 대한 **view**이다.

다음처럼 원본 컬렉션인 `list`를 필드로 가지고, 외부에서 컬렉션 메서드를 호출하면 그대로 `list.method()`를 대신 호출하여 리턴하는 프록시에 불과하다.

따라서, 원본 컬렉션인 list의 참조를 `x001`, view(또는 프록시)인 UnmodifiableList의 참조를 `x002`라고 한다면 `x002.add()`는 불가능하고 `x001.add()`는 가능하다.

또한 `x001`에 변화가 생기면, 이를 필드로 가지는 `x002`에도 반영된다.

```java
static class UnmodifiableList<E> extends UnmodifiableCollection<E>
                              implements List<E> {
    final List<? extends E> list;

    UnmodifiableList(List<? extends E> list) {
        super(list);
        this.list = list;
    }

    ...

    public E get(int index) {return list.get(index);}

    public void add(int index, E element) {
        throw new UnsupportedOperationException();
    }
    ...
}
```

<br></br>

다음 예시를 보자.

<iframe
  frameBorder="0"
  src="https://onecompiler.com/java/44gh57eya?codeEditors=true&hideNew=true&hideNewFile=true"
  width="100%"
  height="600px"
  title="Unmodifiable vs Immutable List Java Example">
</iframe>

### ImmutableList

카피를 한 순간의 원본 컬렉션을 capture한 리스트다. 즉, 원본 리스트로부터 독립적이다.

```java
// List.java
...
static <E> List<E> copyOf(Collection<? extends E> coll) {
    return ImmutableCollections.listCopy(coll);
}
...
```

```java
// ImmutableCollections.java
...
static <E> List<E> listCopy(Collection<? extends E> coll) {
    ...
    } else {
        // 결국 전체를 복사해서 넘긴다 = 원본과 독립된 새로운 컬렉션
        return (List<E>)List.of(coll.toArray());
    }
}
...
```

# 2. List.copyOf()에 불변 컬렉션을 전달하면, 복사를 수행하지 않고 그대로 반환한다

위에서는 복잡하다고 판단해 설명하지 않은 부분이 있다. 일단 `ImmutableCollections.listCopy()`의 메서드 바디 전체를 첨부한다. 여기서 첫 번째 `if` 분기를 보자.

```java
static <E> List<E> listCopy(Collection<? extends E> coll) {
    // List12와 ListN은 둘 다 AbstractImmutableList의 자식이다. 즉, 불변 리스트다.
    // 그렇다. List.copyOf()는 불변 리스트가 인자로 오면 아무 작업도 수행하지 않고, 인자로 들어온 컬렉션을 그대로 리턴한다.
    if (coll instanceof List12 || (coll instanceof ListN<?> c && !c.allowNulls)) {
        return (List<E>)coll;
    // 이 밑은 무시
    } else if (coll.isEmpty()) {
        return List.of();
    } else {
        return (List<E>)List.of(coll.toArray());
    }
}
```

<br></br>

사실 구현을 직접 보지 않더라도, Javadoc의 Implementation Note를 통해 확인할 수 있다.

:::note[Implementation Note:]

If the given Collection is an unmodifiable List, calling copyOf will generally not create a copy.

:::

<br></br>

다음 예시를 보자. `List.copyOf(불변리스트)`와 원본의 참조가 동일한 것을 확인할 수 있다.

<iframe
  frameBorder="0"
  src="https://onecompiler.com/embed/java/44gg6962y?codeEditors=true&hideNew=true&hideNewFile=true"
  width="100%"
  height="500px">
</iframe>

다음 예시에서는 `List.copyOf(불변리스트)`가 아무 것도 수행하지 않음을 수치적으로 확인할 수 있다. 여러 번 메서드를 호출해도 복사가 일어나지 않으므로, 0ms가 소요된다.

<iframe
  frameBorder="0"
  src="https://onecompiler.com/embed/java/44gh5xgjx?codeEditors=true&hideNew=true&hideNewFile=true"
  width="100%"
  height="500px">
</iframe>

## References
