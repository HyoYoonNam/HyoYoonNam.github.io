---
slug: visual-studio-source-files-and-projects
title: "C | Submit Source Files or the Project Folder? What to Do When Source Files Are Missing"
date: 2024-07-07T15:16:00+00:00
authors: hyoyoonnam
tags: [C]
---

<!-- translation-source-sha256: f893381aa90978aac7d1ac0d44341e71341fdfbe3bd9e627e53f089daefb4c25 -->
<!-- translation-glossary-sha256: d478daf8b916b21cba43a1597cb2015b9270fb6305a97c298947c551b22b1a96 -->

## Introduction

<strong>If you want to skip to the conclusion</strong>, <strong>click Conclusion in the table of contents on the left \(mobile\) or at the top \(desktop\)</strong>\.

---

If you take a C programming class at a university or another institution, you will most likely use Visual Studio as your IDE\.

When you submit assignments or exam solutions, your instructor will often <strong><u>ask for one of the following</u></strong>:

> 🗣️ “<strong>Submit source files only</strong>\!”

> 🗣️ “<strong>Submit the project files</strong>\!”

Failing to submit what your instructor asks for can cost you points, or even result in a zero\. This post covers the following questions\.

- How does Visual Studio organize and manage files for C programs?

- `소스 코드`, `프로젝트`, `솔루션` \(source code, project, and solution\): how do they differ?

<!-- truncate -->

## 1\. How Visual Studio organizes files

### 1\. Creating only a solution

Creating a solution creates a folder such as `Solution_name`\. Inside it, you will find a `Solution_name.sln` file and a `.vs` folder\.

<figure>

![notion image](./figure-01.webp)

</figure>

### 2\. Creating a project

Within `Solution_1`, I will now create `Project1`\.

\(This is separate from the exercise\.\) If you change the Solution option from <strong>Add to solution</strong> to<strong> Create new solution</strong>, Visual Studio automatically creates a solution with the same name as the project, then creates the project inside it\.

<figure>

![Creating a project inside the previously created Solution\_1](./figure-02.webp)

<figcaption>Creating a project inside the previously created Solution\_1</figcaption>
</figure>

<figure>

![As shown in Visual Studio](./figure-03.webp)

<figcaption>As shown in Visual Studio</figcaption>
</figure>

<figure>

![As shown in the Solution\_1 folder](./figure-04.webp)

<figcaption>As shown in the Solution\_1 folder</figcaption>
</figure>

Inside a `Project`, you can manage `Source code 파일` \(source code files\)\.

<figure>

![notion image](./figure-05.webp)

</figure>

### 3\. Creating multiple source files inside Project1

As shown below, you can create and manage multiple source files in a single project\.

Source files defined in the same project can also call one another’s functions without any additional configuration\.

> To call a function in another project, you must define a header file\. \(In fact, <strong>even for functions in the same project</strong>, for readability and to avoid compiler errors, <strong>defining header files is recommended</strong>\. Here, however, I have described it this way simply to explain what it means for files to be in the same project\.\)

<figure>

![source\_code\_1, 2, 3\.c all belong to the same project, Project1\_of\_Solution1\. Since they are in the same project, they can call one another’s functions without any additional configuration\.](./figure-06.webp)

<figcaption>`Project1_of_Solution1` contains `source_code_1, 2, 3.c`\. Since these files are in the same project, they can call one another’s functions without any additional configuration\.</figcaption>
</figure>

<figure>

![Functions within the same project can be called without any additional configuration\.](./figure-07.webp)

<figcaption>Functions within the same project can be called without any additional configuration\.</figcaption>
</figure>

#### Trying to call a function in Project2 from Project1

This time, in `Project2`, I will create `source_code_a.c` as shown below and try to call it from Project1\.

<figure>

![source\_code\_a\.c created in Project2, a separate project from Project1](./figure-08.webp)

<figcaption>`Project1` and the separate project `Project2`: a file created in the latter, `source_code_a.c`</figcaption>
</figure>

<figure>

![The kbsa\(\) function cannot be called from Project1 because it is created and managed in a different project, Project2\. \(Functions in different projects can be called by defining header files, but that is outside the scope of this post\.\)](./figure-09.webp)

<figcaption>`kbsa()` cannot be called from `Project1` because it is created and managed in a different project, `Project2`\. \(Functions in different projects can be called by defining header files, but that is outside the scope of this post\.\)</figcaption>
</figure>

## 2\. A visual overview

The following diagram summarizes what we have covered\.

<figure>

![notion image](./figure-10.webp)

</figure>

## Conclusion: How do you submit source files or project files?

### 1\. Submitting source files only

To submit only the source files, follow these steps to find the folder that contains them\. For this example, I will use the solution `Solution_1 솔루션`, its project `Project1_of_Solution1 프로젝트`, and the source file created in that project, `source_code_1.c 소스코드`\.

1. Go to the solution folder containing the project that contains the source code you want to submit\.

   In my case, that is `C:\Blog_C\Solution_1`



   <figure>

   ![notion image](./figure-11.webp)

   </figure>

2. Go to the project folder containing the source code you want to submit\.

   `C:\Blog_C\Solution_1\Project1_of_Solution1`



   <figure>

   ![notion image](./figure-12.webp)

   </figure>

3. Submit the source files as they are, or compress them and submit the archive\. That is all\.

<figure>

![notion image](./figure-13.webp)

</figure>

### 2\. Submitting project files

1. Following step 1 above, go only as far as the solution folder, such as `C:\Blog_C\Solution_1`\.

2. Compress the project folder containing the source code you want to submit, `Project_of_Solution1`, and submit the archive\.

   <figure>

   ![notion image](./figure-14.webp)

   </figure>

### \*\*The source code is missing from my project folder\!

Sometimes you create and save source code in a project, only to find that the source files are missing when you open the project folder\. Yet compiling, building, and running the program all work\.

I ran into this confusing situation myself: as shown below, malloc1\.c was in the Project1\_of\_Solution1 project and ran correctly, but the source file was nowhere to be found in the project folder\.

<figure>

![notion image](./figure-15.webp)

</figure>

<figure>

![notion image](./figure-16.webp)

</figure>

---

When adding source code, you can choose between `새 항목(New Item)` and `기존 항목(Existing Item)`\. If you used `기존 항목`<u> to add the source code</u>, you can encounter the situation above\.

<figure>

![notion image](./figure-17.webp)

</figure>

You can resolve it with one of the following options\.

- Need to submit source files only?

  - `기존 항목`? Find the source file you added using that option and submit it\.

- Need to submit the project?

  - Option 1\. `기존 항목`: copy the source file you added using that option and paste it into the project folder\.
  - Option 2\. `기존 항목`: move the source file you added using that option into the project folder\.
  - Option 3\. `새 항목`: create a blank source file using that option, then copy and paste the code from your existing source file into it\.

---

[Original post on Inblog](https://codesharpener.inblog.io/c-%EC%86%8C%EC%8A%A4-%EC%BD%94%EB%93%9C-%ED%8C%8C%EC%9D%BC%EB%A7%8C-%EC%A0%9C%EC%B6%9C-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%ED%8F%B4%EB%8D%94-%EC%A0%9C%EC%B6%9C-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%ED%8F%B4%EB%8D%94%EC%97%90-%EC%86%8C%EC%8A%A4-%EC%BD%94%EB%93%9C%EA%B0%80-%EC%97%86%EC%9D%84-%EB%95%8C-23634)

[Original post on Notion](https://app.notion.com/p/a7643e3f0d5b4cb681e853709d3ab212)
