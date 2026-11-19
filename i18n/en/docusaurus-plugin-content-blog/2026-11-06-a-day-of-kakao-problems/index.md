---
slug: a-day-of-kakao-problems
title: "The Day Kakao Gave Me a Beating"
date: 2026-11-06T16:05:22.829551+09:00
authors: hyoyoonnam
tags: [기술]
image: ../../../../blog/2026-11-06-a-day-of-kakao-problems/hide-the-cactus.png
---

## Getting stuck counts as growth, right?

![image.png](../../../../blog/2026-11-06-a-day-of-kakao-problems/hide-the-cactus.png)

<!-- truncate -->

## The source of my heartburn

![17bcf00719bce84c1058d82030c7fe08307e20d2.heic](../../../../blog/2026-11-06-a-day-of-kakao-problems/photo-1.jpg)

## Please don’t cross that river

I looked up some Level 1 problems I’d solved more than a year ago. Back then their solve rates had been low. They’d gone up quite a bit since.

![9f16ab6e49b557894e94c39a26da45c22d0aff1e.heic](../../../../blog/2026-11-06-a-day-of-kakao-problems/photo-2.jpg)

I figured the same thing had happened with Hide the Cactus.\
I really should’ve left that one alone…

## Time complexity

I’ll reconstruct the problem roughly from memory. Absolutely nothing to do with being afraid to look at it again.

* 1 &lt;= m, n &lt;= 500_000
* 1 &lt;= m x n &lt;= 500_000

Given those constraints, even a loop over m with a loop over n inside it would stay within a reasonable bound. “Well, I can just brute-force this,” I thought.

Then my very humble solution (does it count as a solution if I never solved it?) grew to four nested loops, and suddenly I was looking at `250_000_000_000`.

“I’ll come up with something so ingenious even Ludens will fall over backwards.” I turned it over every which way. What actually fell into a ditch was two hours of my time.

![2fd49a82ca3d4bc0b6da2b998aeaa165ed8b23e2.jpeg](../../../../blog/2026-11-06-a-day-of-kakao-problems/reaction.jpg)

I tried an easier Kakao problem after that. I don’t know. The problem itself seemed fine. My head and whatever was going on inside it were another story.\
One more failed attempt, and then the eleven o’clock ride home from campus.

Where did my time go?

## Next time, cactus

Ludens looked through a few blogs and told me this one called for a monotonic queue. I’ve done a few monotonic stack problems before. I wonder how much carries over? A few more stack problems, and next week I’ll come back and give that cactus what for.

![image.png](../../../../blog/2026-11-06-a-day-of-kakao-problems/next-problem.png)

---

[Original post on Rilog (Korean)](https://www.rilog.kr/@homo_scribens/posts/512)
