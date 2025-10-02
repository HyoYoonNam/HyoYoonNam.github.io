---
title: "@ModelAttribute에 대한 생성자, setter 바인딩"
slug: spring-modelattribute-binding
date: 2025-10-01 11:59:58 +09:00
categories:
  - Spring
tags: []
toc: true
comments: true
---

  
> **해당 포스팅을 읽으면:**
> 
> 6가지 케이스에 대한 `Converter` 로그를 통해 {기본 생성자 유무, binding 옵션, 생성자 개수} 등에 의한 `@ModelAttribute` 파라미터의 바인딩 시나리오를 확인할 수 있습니다.  
{: .prompt-info }

---

## Environments
- **OS:** macOS Sequoia 15.6
- **CPU:** x86
- **Spring Boot:** 3.5.6

  
## 1. 서론
[인프런 - 김영한의 스프링 MVC 2편](https://www.inflearn.com/community/questions/490164/convertercontroller-java-%EC%97%90%EC%84%9C-%EC%A0%9C%EC%B6%9C-%EB%B2%84%ED%8A%BC-%EB%88%8C%EB%A0%80%EC%9D%84-%EB%95%8C)을 수강하던 중 과거에 남겨진 질문 글을 통해 다음과 같은 사실을 파악했다.

질문의 요지는 `StringToIpPortConverter` 컨버터가 중복적으로 2회가 호출되는데, 그 이유에 대한 물음이다.

관련하여 여러가지 답변들이 있었는데, 이에 도움을 받아 여러가지 케이스를 작성해보니 기존에 작성된 답변들보다는 내가 작성한 케이스를 통해 추론해낸 결론이 더 합리적이라고 생각되어 그 과정을 작성한다.

  
## 2. 본론
케이스들을 소개하기에 앞서, 해당 포스팅에서 사용된 코드 베이스는 [영한님의 스프링 MVC 2편](https://www.inflearn.com/courses/lecture?courseId=327260&type=LECTURE&unitId=83372&subtitleLanguage=ko)의 것임을 알린다.

아래 코드를 기준으로 `static class Form` 부분만 변경하며 케이스를 다루겠다. 또한 각 케이스에서의 '로그'는 `@PostMapping("/converter/edit") converterEdit()`에 대한 것임을 알린다. post 요청을 보낼 때 `@ModelAttribute Form form`  파라미터에 바인딩하는 과정에서 컨버터가 호출되는 횟수를 확인할 것이다.  
```java
package hello.typeconverter.controller;  
  
import hello.typeconverter.type.IpPort;  
import lombok.Data;  
import lombok.Getter;  
import lombok.Setter;  
import org.springframework.stereotype.Controller;  
import org.springframework.ui.Model;  
import org.springframework.web.bind.annotation.GetMapping;  
import org.springframework.web.bind.annotation.ModelAttribute;  
import org.springframework.web.bind.annotation.PostMapping;  
  
@Controller  
public class ConverterController {  
  
    @GetMapping("/converter-view")  
    public String converterView(Model model) {  
        model.addAttribute("number", 10000);  
        model.addAttribute("ipPort", new IpPort("127.0.0.1", 8080));  
        return "converter-view";  
    }  
  
    @GetMapping("/converter/edit")  
    public String converterForm(Model model) {  
        IpPort ipPort = new IpPort("127.0.0.1", 8080);  
        Form form = new Form(ipPort);  
        model.addAttribute("form", form);  
        return "converter-form";  
    }  
  
    @PostMapping("/converter/edit")  
    public String converterEdit(@ModelAttribute Form form, Model model) {  
        IpPort ipPort = form.getIpPort();  
        model.addAttribute("ipPort", ipPort);  
        return "converter-view";  
    }  
  
    @Data
    static class Form {  
        // "127.0.0.1:8080" 형태의 문자열을 받아 IpPort 객체로 바인딩 해주는 StringToIpPortConverter를 정의해놨다.
        private IpPort ipPort; 
  
        public Form(IpPort ipPort) {  
            this.ipPort = ipPort;
        }  
    }  
}
```

```java
@Getter  
@EqualsAndHashCode  
public class IpPort {  
  
    private String ip;  
    private int port;  
  
    public IpPort(String ip, int port) {  
        this.ip = ip;  
        this.port = port;  
    }  
}
```

    
### 전제: 자바 빈 프로퍼티 규약
아래 사실을 미리 인지해두고 시작하자.

기본적으로 빈 생성자(기본/primary/default 생성자)가 필수로 존재해야 하며, setter로 바인딩을 한다. 하지만 스프링의 경우 빈 생성자가 존재하지 않더라도 생성자가 단 하나만 존재하는 경우(unique)라면 빈 생성자가 없음을 허용한다.

  
### case 0. setter, IpPort 생성자 (컨버터 2회 호출)
```java
@Data
static class Form { 
  private IpPort ipPort; 
  
  public Form(IpPort ipPort) { 
    System.out.println("Form.Form IpPort 생성자"); 
    this.ipPort = ipPort; 
  }
  
  public void setIpPort(IpPort ipPort) {
    System.out.println("Form.setIpPort"); 
    this.ipPort = ipPort; 
  }
}
```
**로그**  
```console
(1회) StringToIpPortConverter : convert source=127.0.0.1:8080 
Form.Form IpPort 생성자 
(2회) StringToIpPortConverter : convert source=127.0.0.1:8080 
Form.setIpPort 

...
```
- (1회) `@ModelAttribute Form form`에 바인딩 하기 위해 일단 객체를 생성해야 된다. 이때 기본 생성자가 존재하지 않으므로 생성자를 호출할 때도 String -> IpPort 컨버터가 동작해야 된다.
- (2회) 자바 빈 프로퍼티 규약에 의해 기본적으로 생성자 호출 -> setter 바인딩을 시도한다. 따라서 생성자 호출 때 컨버터가 호출되었더라도, setter 바인딩을 시도하면서 컨버터를 또 호출한다.
    - (1회)에서 바인딩 된 값은 (2회)에서 바인딩 된 값으로 overwrite 된다.

**결론:** 생성자에 의해 1회, setter에 의해 1회 컨버터가 호출

  
### case 1. setter, 기본 생성자, IpPort 생성자 (컨버터 1회 호출)
```java
@Getter
static class Form {
    private IpPort ipPort;

    public Form() {
        System.out.println("Form.Form 기본 생성자");
    }

    public Form(IpPort ipPort) {
        System.out.println("Form.Form IpPort 생성자");
        this.ipPort = ipPort;
    }

    public void setIpPort(IpPort ipPort) {
        System.out.println("Form.setIpPort");
        this.ipPort = ipPort;
    }
}
```
**로그**  
```console
Form.Form 기본 생성자
(1회)StringToIpPortConverter    : convert source=127.0.0.1:8080
Form.setIpPort

...
```
- (위에서 말했듯이) 기본 생성자를 호출하는 것이 우선이다. `case 0`에서는 기본 생성자가 존재하지 않았기 때문에 차선책으로 IpPort 생성자를 호출했으나, 지금 `case 1`에서는 존재하기 때문에 이를 호출한다.
    - 즉, 객체를 생성하는 과정에서는 IpPort 바인딩이 필요하지 않으므로 컨버터가 호출되지 않는다.
- (위에서 말했듯이) 생성자 호출 이후에는 setter를 호출하여 바인딩을 시도한다. 따라서 이 시점에 setter에 의해 컨버터가 1회 호출된다.

**결론:** setter에 의해 1회 컨버터가 호출

  
### case 2. IpPort 생성자 (컨버터 1회 호출)
```java
@Getter
static class Form {
    private IpPort ipPort;

    public Form(IpPort ipPort) {
        System.out.println("Form.Form IpPort 생성자");
        this.ipPort = ipPort;
    }
}
```
**로그**  
```console
(1회) StringToIpPortConverter    : convert source=127.0.0.1:8080
Form.Form IpPort 생성자

...
```
- (위에서 말했듯이) 생성자 호출 -> setter 바인딩이 원칙이다. 하지만 setter가 존재하지 않으므로 setter 바인딩이 불가능하다. 하지만 운 좋게도 생성자 호출만으로 `IpPort` 바인딩이 가능하므로 문제가 발생하지 않는다.

**결론:** 생성자에 의해 1회 컨버터가 호출
  
### case 3. 기본 생성자, IpPort 생성자 (컨버터 0회 호출)
```java
// @ModelAttribute(binding = false)를 설정하면 setter 바인딩을 하지 않는다.
@PostMapping("/converter/edit")
public String converterEdit(@ModelAttribute(binding = false) Form form, Model model) {
    IpPort ipPort = form.getIpPort();
    model.addAttribute("ipPort", ipPort);
    return "converter-view";
}

...

@Getter
static class Form {
    private IpPort ipPort;

    public Form() {
        System.out.println("Form.Form 기본 생성자");
    }

    public Form(IpPort ipPort) {
        System.out.println("Form.Form IpPort 생성자");
        this.ipPort = ipPort;
        System.out.println("바인딩 확인: this.ipPort = " + this.ipPort);
    }

    public void setIpPort(IpPort ipPort) {
        System.out.println("Form.setIpPort");
        this.ipPort = ipPort;
    }
}
```
- 여기까지 따라오셨다면 위 코드의 동작 방식을 예상할 수 있을 것이다.
    - 기본 생성자가 존재하므로, IpPort 생성자가 아닌 기본 생성자가 호출된다. 따라서 객체 생성시에는 `IpPort`가 필요하지 않으므로 컨버터가 호출되지 않는다.
    - `setIpPort()` 메서드는 다른 메서드와의 호환성을 위해 불가피하게 남겨놨다. 대신 `@ModelAttribute(binding = false)` 옵션으로 setter가 동작하지 않도록 명시했으므로 해당 예제에 한해서는 'setter가 없는 상황'이라고 생각해도 좋다.
- 따라서 컨버터는 0회 호출된다.

**로그**  
```console
Form.Form 기본 생성자
// 기본 생성자 호출이 우선이고, 기본 생성자가 존재하므로 호출됨 (따라서 이 과정에서 바인딩 x)
// binding=false에 의해 setter는 호출되지 않음. (따라서 결과적으로 바인딩 x)
```
**결론:** 0회 컨버터가 호출

이 경우 NotNull 제약은 하지 않아서 예외가 발생하지는 않지만, 컨버터가 동작하지 않아 바인딩이 이루어지지 않았기 때문에, `Form` 객체에 들어있는 데이터를 확인해보면 그 **값이 비어있음**을 확인할 수 있다. 우리의 의도는 사용자가 입력한 "127.0.0.1:8080" 문자열이 `IpPort` 객체로 바인딩되는 것인데, 바인딩이 이루어지지 않은 것이다.  
![바인딩 되지 않았을 때의 결과](assets/img/posts/2025-10-01-@ModelAttribute에-대한-생성자,-setter-바인딩.png)  

아래 사진은 컨버터가 1회 이상 호출되었을 때의 정상적으로 바인딩 된 결과다.  
![바인딩 되었을 때의 결과](assets/img/posts/2025-10-01-@ModelAttribute에-대한-생성자,-setter-바인딩-1.png)

  
### case 4. setter, IpPort 생성자, IpPort&tempInt 생성자  (예외 발생)
생성자가 여러 개 존재할 때의 상황을 가정하기 위해 임시로 `tempInt` 필드를 추가했다.
```java
@Getter
@Setter
static class Form {
    private IpPort ipPort;
    private Integer tempInt;

//        public Form() {
//            System.out.println("Form.Form 기본 생성자");
//        }

    public Form(IpPort ipPort) {
        System.out.println("Form.Form IpPort 생성자");
        this.ipPort = ipPort;
    }

    public Form(IpPort ipPort, Integer tempInt) {
        System.out.println("Form.Form IpPort, tempInt 생성자");
        this.ipPort = ipPort;
        this.tempInt = tempInt;
    }
}
```
**로그**  
```console
2025-09-30T17:44:39.042+09:00 ERROR 25966 --- [typeconverter] [nio-8080-exec-4] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed: java.lang.IllegalStateException: No primary or single unique constructor found for class hello.typeconverter.controller.ConverterController$Form] with root cause


java.lang.IllegalStateException: No primary or single unique constructor found


 for class hello.typeconverter.controller.ConverterController$Form
	at 
...
```
- `No primary or single unique constructor found for class ...` 부분에 집중하자.
    - 자바 빈 프로퍼티 규약에 의해 primary 생성자는 필수이다. 하지만 기본 생성자가 존재하지 않더라도, single unique constructor만 가지는 경우에는 스프링이 이를 허용해준다.
        - (case 5) 생성자가 여러 개인데, 기본 생성자가 있음 -> 어차피 기본 생성자 호출이 원칙이므로 무엇을 호출할지 애매하지 않음
        - (case 2) 생성자가 하나인데, 기본 생성자가 없음 -> 원칙에는 위배되지만, 어차피 생성자가 하나 뿐이라 무조건 얘를 호출하면 되므로 애매하지 않음
        - (case 4) 생성자가 여러 개인데, 기본 생성자가 없음 -> 무엇을 호출할지 애매함 -> 예외 발생

  
### case 5. setter, 기본 생성자, IpPort 생성자, IpPort&tempInt 생성자  (정상)
```java
@Getter
@Setter
static class Form {
    private IpPort ipPort;
    private Integer tempInt;

    public Form() {
        System.out.println("Form.Form 기본 생성자");
    }

    public Form(IpPort ipPort) {
        System.out.println("Form.Form IpPort 생성자");
        this.ipPort = ipPort;
    }

    public Form(IpPort ipPort, Integer tempInt) {
        System.out.println("Form.Form IpPort, tempInt 생성자");
        this.ipPort = ipPort;
        this.tempInt = tempInt;
    }
}
```
**로그**  
```console
Form.Form 기본 생성자
(1회 by setter) StringToIpPortConverter    : convert source=127.0.0.1:8080

...
```
- `case 4`에서 말한 것과 같이 기본 생성자가 존재하는 경우에는 어차피 호출할 생성자가 확실하므로 예외가 발생하지 않는다.
## 3. 결론
- **원칙:** 파라미터가 없는 기본 생성자를 호출하여 바인딩 할 객체 생성(컨버터 호출x) -> setter를 호출하여 바인딩(컨버터 호출o)
- **허용:** 기본 생성자가 없더라도, single unique 생성자라면 얘를 호출(파라미터가 있으므로 컨버터 호출o) -> setter를 호출하여 바인딩(컨버터 호출)
    - 즉, setter 바인딩이 원칙이지만 이 경우에는 우연하게도 파라미터가 존재하는 생성자를 호출해야 되기 때문에 생성자 호출 과정에서도 컨버터가 어쩔 수 없이 동작한 것이다.
    - 원칙적으로는 setter 바인딩을 해야 되기 때문에 이 경우라도 setter는 호출한다.
    - 따라서 동일한 컨버터가 2회 이상 호출될 수 있다. 1회만 호출되도록 하려면 다음과 같은 선택지가 있다.
        1. 기본 생성자 o, setter o
        2. 기본 생성자 x, 파라미터가 있는 생성자 o, setter x(또는 binding=false)
- **바인딩 안 됨:** 기본 생성자가 존재하고, setter는 존재하지 않는 경우 바인딩이 가능한 과정이 없기 때문에 객체에 값이 담기지 않는다.
- **예외:** 기본 생성자가 없고, 여러 개의 생성자가 존재한다면 객체 생성을 위해 호출할 생성자의 선택 기준이 없기 때문에 예외가 발생한다.

  
## References
https://www.inflearn.com/community/questions/490164/convertercontroller-java-%EC%97%90%EC%84%9C-%EC%A0%9C%EC%B6%9C-%EB%B2%84%ED%8A%BC-%EB%88%8C%EB%A0%80%EC%9D%84-%EB%95%8C


https://hyeon9mak.github.io/model-attribute-without-setter/