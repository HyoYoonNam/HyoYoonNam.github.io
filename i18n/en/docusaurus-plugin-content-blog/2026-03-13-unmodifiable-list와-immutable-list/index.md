---
slug: difference-between-collections-unmodifiablelist-and-List-of-immutablelist
title: "Unmodifiable Lists and Immutable Lists in Java"
authors: hyoyoonnam
tags: [Java]
status: 🟩_done
topics: ['[[woowa]]', '[[Lv 1]]', '[[Java]]']
started: '2026-03-13T00:00:00.000Z'
deadline(or finished): '2026-03-16T22:00:00.000Z'
---

:::note[What you’ll take away]

1. How a view and a snapshot explain the difference between an unmodifiable collection and an immutable one.

2. How the lists produced by these calls differ:
    - `Collections.unmodifiableList()`
    - `List.of()` or `List.copyOf()`

:::

<!-- truncate -->

# 1. What they have in common

Calling a mutating method throws an `UnsupportedOperationException`.

<iframe
  frameBorder="0"
  src="https://onecompiler.com/java/44gg6wqev?codeEditors=true&hideNew=true&hideNewFile=true"
  width="100%"
  height="600px"
  title="Unmodifiable vs Immutable List Java Example">
</iframe>

# 2. Where they differ

## 2.1. They use different implementation classes

<iframe
  frameBorder="0"
  src="https://onecompiler.com/java/44gh4m5rq?codeEditors=true&hideNew=true&hideNewFile=true"
  width="100%"
  height="600px"
  title="Unmodifiable vs Immutable List Java Example">
</iframe>

## 2.2. They have different relationships to the original collection

### UnmodifiableList

The `UnmodifiableRandomAccessList` implementation (which I’ll call `UnmodifiableList` here) is a **view** of the original collection.

As the code below shows, it holds the original `list` in a field. For a read like `get`, the wrapper delegates to the corresponding method on that list and returns the result.

Say `x001` refers to the original list and `x002` to the view. You can call `add` through `x001`. Trying it through `x002` throws.

A change made through `x001` also shows up through `x002`, since the wrapper still holds that same list.

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

You can try it in this example.

<iframe
  frameBorder="0"
  src="https://onecompiler.com/java/44gh57eya?codeEditors=true&hideNew=true&hideNewFile=true"
  width="100%"
  height="600px"
  title="Unmodifiable vs Immutable List Java Example">
</iframe>

### ImmutableList

This list captures the contents of the original collection at the moment of the copy. Later structural changes to the original list don’t affect it.

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
        // Copy the elements into a collection independent of the original.
        return (List<E>)List.of(coll.toArray());
    }
}
...
```

# 3. When List.copyOf() can return the list it was given

I left out a branch earlier to keep the example manageable. Here’s the full body of `ImmutableCollections.listCopy()`. Look at the first `if`.

```java
static <E> List<E> listCopy(Collection<? extends E> coll) {
    // List12 and ListN both extend AbstractImmutableList.
    // For these compatible immutable lists, copyOf can return the input itself.
    if (coll instanceof List12 || (coll instanceof ListN<?> c && !c.allowNulls)) {
        return (List<E>)coll;
    // The remaining branches handle other inputs.
    } else if (coll.isEmpty()) {
        return List.of();
    } else {
        return (List<E>)List.of(coll.toArray());
    }
}
```

<br></br>

You can also find this in the Javadoc’s implementation note:

:::note[Implementation Note:]

If the given Collection is an unmodifiable List, calling copyOf will generally not create a copy.

:::

<br></br>

In the next example, compare the references. For this immutable list, `List.copyOf` returns the same object.

<iframe
  frameBorder="0"
  src="https://onecompiler.com/embed/java/44gg6962y?codeEditors=true&hideNew=true&hideNewFile=true"
  width="100%"
  height="500px">
</iframe>

The last example times repeated calls with the same immutable input. There’s no copying to do, and the elapsed time shown in this run is 0 ms.

<iframe
  frameBorder="0"
  src="https://onecompiler.com/embed/java/44gh5xgjx?codeEditors=true&hideNew=true&hideNewFile=true"
  width="100%"
  height="500px">
</iframe>

## References
