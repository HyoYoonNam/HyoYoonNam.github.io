---
slug: python-web-crawling-ssl-certificate-error
title: "Causes of Errors During Python Web Crawling and How to Fix Them"
date: 2024-02-11T04:29:00+00:00
authors: hyoyoonnam
tags: [Python]
---

<!-- translation-source-sha256: 313a8bbc2553e66be6cde7be188ece3448770ac823cf39137879090b6460e95f -->
<!-- translation-glossary-sha256: d478daf8b916b21cba43a1597cb2015b9270fb6305a97c298947c551b22b1a96 -->

> Written: 20240211 Last updated: 20240211

> OS: mac
> language: python
>     ver: 3.12.1

---

<!-- truncate -->

## Prerequisites

### [Python official documentation \- urllib \(see 10\.7 Internet Access\)](https://docs.python.org/3/tutorial/stdlib.html#brief-tour-of-the-standard-library)

---

## Loading a webpage with urllib\.request\.urlopen\(\)

Using urllib, a library that can be used to read and parse URLs, you can save a specific webpage as an \.html file with code like the following\.

```python
import urllib.request   

def get_wikidocs(page):
    resource = "https://wikidocs.net/{}".format(page)
    with urllib.request.urlopen(resource) as s:
        with open("wikidocs_%s.html" % page, 'wb') as f:
            f.write(s.read())

get_wikidocs(12)
```

## urllib.error.URLError:

### error occurred

When you run the code above, you get the following error\.

`urllib.error.URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate (_ssl.c:1000)>`

In short, the SSL certificate is not <u>a CERTIFICATE VERIFIED SSL certificate</u> but rather <u>self-signed SSL</u>, so for security reasons urlopen cannot proceed\.

<figure>

![figure 1. An URLError occurred](./figure-01.webp)

<figcaption>figure 1. An URLError occurred</figcaption>
</figure>

### fix

To fix it, you need to run the Install Certificates\.command file at the following path\.

`/Applications/Python 3.12(버전마다 다름)/Install Certificates.command`

<figure>

![figure 2. Install Certificates.command](./figure-02.webp)

<figcaption>figure 2. Install Certificates.command</figcaption>
</figure>

<details>
<summary>The file above runs code like the following\.</summary>

```python
#!/bin/sh

/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12 << "EOF"

# install_certifi.py
#
# sample script to install or update a set of default Root Certificates
# for the ssl module.  Uses the certificates provided by the certifi package:
#       https://pypi.org/project/certifi/

import os
import os.path
import ssl
import stat
import subprocess
import sys

STAT_0o775 = ( stat.S_IRUSR | stat.S_IWUSR | stat.S_IXUSR
             | stat.S_IRGRP | stat.S_IWGRP | stat.S_IXGRP
             | stat.S_IROTH |                stat.S_IXOTH )

def main():
    openssl_dir, openssl_cafile = os.path.split(
        ssl.get_default_verify_paths().openssl_cafile)

    print(" -- pip install --upgrade certifi")
    subprocess.check_call([sys.executable,
        "-E", "-s", "-m", "pip", "install", "--upgrade", "certifi"])

    import certifi

    # change working directory to the default SSL directory
    os.chdir(openssl_dir)
    relpath_to_certifi_cafile = os.path.relpath(certifi.where())
    print(" -- removing any existing file or link")
    try:
        os.remove(openssl_cafile)
    except FileNotFoundError:
        pass
    print(" -- creating symlink to certifi certificate bundle")
    os.symlink(relpath_to_certifi_cafile, openssl_cafile)
    print(" -- setting permissions")
    os.chmod(openssl_cafile, STAT_0o775)
    print(" -- update complete")

if __name__ == '__main__':
    main()
EOF
```

</details>

<details>
<summary>Learn more about the error</summary>

### 1\. The Python installation folder includes a ReadMe\.rtf file related to this error\.

<details>
<summary>Original text</summary>

> ❗ —Original text— This package will install Python 3\.12\.1 for macOS 10\.9 or later for the following architecture\(s\): arm64, x86\_64\.
>
> <strong>Certificate verification and OpenSSL</strong>
>
>
>
> This package includes its own private copy of OpenSSL 3.0.   The trust certificates in system and user keychains managed by the <em>Keychain Access </em>application and the <em>security</em> command line utility are not used as defaults by the Python ssl module.  A sample command script is included in /Applications/Python 3.12 to install a curated bundle of default root certificates from the third-party certifi package ([https://pypi.org/project/certifi/](https://pypi.org/project/certifi/)).  Double-click on Install Certificates to run it.
>
>
>
> The bundled pip has its own default certificate store for verifying download connections.
>
>
>
> <strong>Install Options</strong>
>
>
>
> You can control some aspects of what is installed by this package. To see the options, click on the Customize button in the Installation Type step of the macOS installer app.  Click on a package name in the list shown to see more information about that option,
>
>
>
> <strong>Using IDLE or other Tk applications</strong>
>
>
>
> This package includes its own private version of Tcl/Tk 8.6. It does not use any system-supplied or third-party supplied versions of Tcl/Tk.
>
>
>
> Due to new security checks on macOS 10.15 Catalina, when launching IDLE macOS may open a window with a message <strong>"Python" would like to access files in your Documents folder</strong>.  This is normal as IDLE uses your <strong>Documents</strong> folder as its default when opening and saving files; you can still choose other locations in the <strong>Open</strong> and <strong>Save</strong> file dialog windows.  Click on the <strong>OK</strong> button to proceed.
>
>
>
> <strong>Apple Silicon Mac support</strong>
>
>
>
> On Apple Silicon Macs, it is possible to run Python either with native ARM64 code or under Intel 64 emulation using Rosetta2. This option might be useful for testing or if binary wheels are not yet available with native ARM64 binaries.  To  easily force Python to run in emulation mode, invoke it from a command line shell with the python3-intel64 command instead of just python3.
>
>
>
> <strong>Other changes</strong>
>
>
>
> For other changes in this release, see the <em>What's new</em> section in the [Documentation Set](https://www.python.org/doc/) for this release and its <em>Release Notes</em> link at [https://www.python.org/downloads/](https://www.python.org/downloads/).

</details>

<details>
<summary>Korean translation</summary>

> ❗ This package installs Python 3\.12\.1 for macOS 10\.9 or later for the following architectures: arm64, x86\_64\.
>
> Certificate verification and OpenSSL
>
>
>
> This package includes its own private copy of OpenSSL 3\.0\. The trusted certificates in the system and user keychains managed by the Keychain Access application and the security command\-line utility are not used as defaults by Python's ssl module\. A sample command script for installing a curated bundle of default root certificates from the third\-party certificate package \([https://pypi.org/project/certifi/](https://pypi.org/project/certifi/)\) is included in /Applications/Python 3\.12\. Double\-click Install Certificates to run it\.
>
>
>
> The bundled pip has its own default certificate store for verifying download connections\.
>
>
>
> Install Options
>
>
>
> You can control some aspects of what this package installs\. To see the options, click the Customize button in the Installation Type step of the macOS installer app\. Click a package name in the displayed list to see more information about that option,
>
>
>
> Using IDLE or other Tk applications
>
>
>
> This package includes its own private version of Tcl/Tk 8\.6\. It does not use any system\-provided or third\-party versions of Tcl/Tk\.
>
>
>
> Because of new security checks in macOS 10\.15 Catalina, when launching IDLE, macOS may open a window saying that "Python" would like to access files in your Documents folder\. This is normal because IDLE uses your Documents folder as the default when opening and saving files, and you can still choose other locations in the Open and Save file dialog windows\. Click the OK button to continue\.
>
>
>
> Apple Silicon Mac support
>
>
>
> On Apple Silicon Macs, Python can be run either with native ARM64 code or under Intel 64 emulation using Rosetta2\. This option may be useful for testing or when native ARM64 binaries are not yet available\. To easily force Python to run in emulation mode, invoke it from a command\-line shell with the python3\-intel64 command instead of python3\.
>
>
>
> Other changes
>
>
>
> For other changes in this release, see the What's New section of the documentation set for this release and its Release Notes link \([https://www.python.org/downloads/](https://www.python.org/downloads/)\)\.
>
>
>
> Translated with [DeepL.com](http://deepl.com/) (free version)

</details>

### 2\. Why this error occurs

- urllib\.request used in Python performs web crawling through a library called 'Pyppeteer'\.

- Pyppeteer can control a Chromium\-based web browser\. \(Pyppeteer is the unofficial Python port of Puppeteer for Node\.js, which is maintained by Google\. In other words, it is the third\-party certifi package mentioned in ReadMe\.rtf\.\)

- Because the Python installation does not have SSL certificates, 'Pyppeteer' encounters an error while scraping through Chrome\.

</details>

## Result of urllib\.request\.urlopen\(\) after fixing the error

<figure>

![figure 3\. wikidocs\_12\.html generated as the result of running the code](./figure-03.webp)

<figcaption>figure 3\. wikidocs\_12\.html generated as the result of running the code</figcaption>
</figure>

<figure>

![figure 4\. Contents of the generated html file](./figure-04.webp)

<figcaption>figure 4\. Contents of the generated html file</figcaption>
</figure>

---

## reference.

[Jump to Python 05\-6 Standard Library](https://wikidocs.net/33#urllib)

---

[Original post on Inblog](https://codesharpener.inblog.io/%ED%8C%8C%EC%9D%B4%EC%8D%AC-%EC%9B%B9-%ED%81%AC%EB%A1%A4%EB%A7%81-%EC%A4%91-%EC%98%A4%EB%A5%98-%EB%B0%9C%EC%83%9D-%EC%9B%90%EC%9D%B8%EA%B3%BC-%ED%95%B4%EA%B2%B0-15952)
