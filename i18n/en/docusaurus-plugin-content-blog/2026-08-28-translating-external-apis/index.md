---
slug: translating-external-apis
title: "[Backend] Integrating an External API Means Translating Its Contract"
date: 2026-08-28T12:19:38.489497+09:00
authors: hyoyoonnam
tags: [기술]
---

:::note[What you’ll take away]

* How mapping data between DTOs can involve translating between two different API contracts.
* Where to translate external data, and when it makes sense to move that work closer to the external system.

:::

{/* truncate */}

## 1. Do separate DTOs make us independent of the external API?

Chaekchaek uses Aladin’s Search API to look up books. From the outset, we had one data transfer object (DTO) for the response we received from Aladin and another for the response we returned to our client.

```text
Aladin Search API
        ↓     (enter our backend)
AladinSearchResponse
        ↓
BookSearchResponse
        ↓     (leave our backend)
Chaekchaek Client
```

On paper, that gives the two APIs a clean separation. Yet fields from Aladin’s pagination model showed up in our public response almost word for word.

```java
public record BookSearchResponse(
        int totalResults,
        int startIndex,
        int itemsPerPage,
        boolean hasNext,
        List<BookItem> items
) {
}
```

We had two objects, but **our public contract still reflected the way Aladin represented its data**. A client using Chaekchaek should only have to learn Chaekchaek’s contract. Splitting the DTOs had left that part of the job unfinished.

***

## 2. The provider and our service speak different languages

Even two providers offering the same book search can describe a result quite differently.

| Meaning | Aladin | Another provider |
| --- | --- | --- |
| Search results | `item` | `documents` |
| Authors | `author: String`, including contributor roles | `authors: String[]` |
| Translators | Included in `author` | `translators: String[]` |
| Next page | Calculated from pagination fields | A separate flag such as `is_end` |

The differences go deeper than field names. Providers decide how to divide the same information into fields and how to represent state. Each model makes sense in its own context. **Aladin has a model for its service, and Chaekchaek needs one for ours.**

In practice, we made three kinds of translation.

1. We adopted our own terms. For the number of books found, `totalResults` became `totalCount`.
2. We gave loosely structured data a shape our client could use. One string containing authors and translators became a separate array for each role.
3. We turned the provider’s state into the client’s next action. The current page number helped us work out which page to request next.

The last two in particular required a decision about **which information matters to our service**.

***

## 3. The external DTO keeps the provider’s vocabulary

That raises a fair question.

> If our service needs authors and translators separately, why don’t we split them as soon as we receive the response? Do we really need both `AladinSearchResponse` and `BookSearchResponse`?

Technically, we could do that. I’d still keep a DTO specifically for Aladin’s response. If you’re familiar with SOLID, the single responsibility principle gives a good reason. Consider what would make us change each model:

```text
AladinSearchResponse changes
→ when Aladin changes its API contract

Chaekchaek’s search result model changes
→ when Chaekchaek’s requirements change
```

Those are two different responsibilities. Keeping them separate gives us somewhere to absorb a change in Aladin’s API before it reaches our clients.

***

## 4. What the translation actually does

Two parts of the implementation made this especially clear.

### 4.1. Turning contributor credits into structured data

Aladin puts authors and translators in a single string:

```text
앤디 위어 (지은이), 박아람 (옮긴이)
```

Here, `지은이` marks the author and `옮긴이` marks the translator. Our client needs to use those roles separately:

```json
{
  "authors": ["앤디 위어"],
  "translators": ["박아람"]
}
```

I wrote an `AladinContributorParser` to interpret the string. Along the way I found a case where splitting on commas would give the wrong answer:

```text
민관식 (필명, 청원) (지은이)
```

The comma inside the parentheses introduces a pen name. It doesn’t separate two contributors.

We had to interpret Aladin’s conventions to get a structure Chaekchaek could use. That also meant deciding what to keep. Suppose our service uses only authors and translators and drops illustrators (`그림`), editorial supervisors (`감수`), and compilers (`엮은이`). That’s a product decision, too.

> **The information we allow a translation to lose is part of our policy.**

### 4.2. Turning pagination state into a next action

Aladin describes pagination with three fields:

```text
totalResults
startIndex
itemsPerPage
```

At first, we exposed those fields alongside `hasNext`. To fetch another page, the client had to know the rule:

```js
const nextPage = hasNext ? startIndex + 1 : null;
```

Our server already understood Aladin’s pagination model. It made sense to do the calculation there. That gave us a simpler public response:

```java
public record BookSearchResponse(
        int totalCount,
        Integer nextPage,
        List<BookItem> items
) {
}
```

The client can now use the value of `nextPage` directly:

```text
nextPage = 3
→ Request page 3 next.

nextPage = null
→ There are no more pages.
```

The distinction between these fields is easy to miss. `hasNext` describes **the current state**. `nextPage` gives the client **the value it needs to act**. The client no longer needs to interpret `startIndex` and `itemsPerPage` or work out the page number itself.

> **We translated the provider’s state into the next action our client could take.**

***

## 5. Where should the translation happen?

At the time, we did the translation in `BookSearchService`:

```text
Aladin Search API
        ↓
AladinBookClient
        ↓
AladinSearchResponse
        ↓
BookSearchService
  - Structure the contributor credits
  - Calculate nextPage
  - Convert fields
        ↓
BookSearchResponse
        ↓
Chaekchaek Client
```

This kept Aladin’s field names and pagination rules out of the client. Inside the backend, though, `BookSearchService` still depended directly on provider types such as `AladinSearchResponse` and `AladinBookItem`. **The external contract reached as far as our application service.**

That was a reasonable trade-off at the time. We had one search provider, and getting search working mattered more. Abstractions have a cost of their own. What I want to understand about a boundary is **what it would cost us to make a change with that boundary in place**.

If adding or replacing a provider became a realistic prospect, we could finish the translation before the response reached the application service:

```text
Aladin Search API
        ↓
Aladin Adapter
  - Interpret the external contract
  - Structure the contributor credits
  - Calculate pagination
        ↓
BookSearchResult
        ↓
BookSearchService
```

By the time the service receives the result, it’s already in Chaekchaek’s terms. The service can use it without knowing who supplied it or how they encoded it. The particular interface or adapter pattern is secondary here.

> **Where a boundary belongs can change as the pressures on the system change.**

***

## 6. A change in the response can break the translation

Our `AladinContributorParser` understands credits like this one:

```text
앤디 위어 (지은이), 박아람 (옮긴이)
```

Its knowledge of labels such as `(지은이)` and `(옮긴이)` comes with an assumption: **Aladin will keep sending credits in a format we recognize.**

What if a new role such as `엮은이` appears? What if the same information arrives as `지은이=앤디 위어, ...`? A missing JSON field might cause deserialization to fail immediately. The harder case is when the code runs successfully and produces the wrong result.

If the parser credits someone as an author by mistake, or silently discards a role it doesn’t recognize, the request can still succeed. **The client receives an incorrect result that looks perfectly ordinary.** How to detect a change upstream, what to do with a value we can’t interpret, and how much to guard against are questions worth a separate post.

***

## 7. Integrating an external API means translating

When I started, I pictured the work like this:

```text
Aladin response
→ Put it in a DTO
→ Pick the fields we need and return them
```

What I ended up doing was different. We read two distinct roles out of a single contributor credit:

```text
앤디 위어 (지은이), 박아람 (옮긴이)

↓

authors: ["앤디 위어"]
translators: ["박아람"]
```

We also turned the pagination fields into a value the client could use directly:

```text
totalResults + startIndex + itemsPerPage

↓

nextPage
```

Seen from the client’s side, that same change looks like this:

```text
Aladin’s pagination data
totalResults + startIndex + itemsPerPage

↓

The value the client will use
nextPage
```

In both cases, the work was in deciding **what the provider’s data meant for our service**. That’s what I mean by translation.

---

[Original post on Rilog (Korean)](https://www.rilog.kr/@chaekchaek/posts/23)
