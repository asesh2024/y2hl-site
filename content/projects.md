---
title: "Projects guided"
description: "Student projects guided by Dr. Asesh Kumar Tripathy, including B.Tech capstone projects in cybersecurity."
---

<p class="lead">Student projects I guide. Each B.Tech capstone runs over two semesters (CP1 and CP2) and must end in a complete, independently tested engineering system.</p>

### B.Tech capstone projects

#### C19 (Cyber-19): Automated Web-Application Vulnerability Scanner

*Domain:* Cybersecurity and Blockchain Systems · *Reference:* [OWASP ZAP](https://www.zaproxy.org/) and the OWASP Top 10

Web applications have a huge attack surface, and OWASP Top 10 flaws such as injection, broken access control and cross-site scripting are everywhere. Automated scanning helps developers find them before attackers do. The team is building an educational scanner, used only on authorised targets, that detects OWASP-class flaws and explains how to fix them.

- **CP1 (reference):** checks for XSS, injection and access-control flaws.
- **CP2 (contribution):** severity scoring and remediation guidance for each finding.
- **Final system:** a reporting interface, benchmarked against a baseline scanner.
- **Acceptance:** detection accuracy and false-positive rate, measured independently.

*Team:* Singirikonda Saimahima, Podila Lakshmi Prasanna, Mandru Sirisha.

#### C20 (Cyber-20): Federated Collaborative Threat Detection

*Batch:* B66 · *Domain:* Cybersecurity and Blockchain Systems · *Reference:* [Flower federated learning framework](https://flower.ai/)

Organisations detect threats better together, but privacy and competition stop them from sharing raw security data. Federated learning lets them train a shared threat detector without pooling their data. The team is building a federated detector that shows a measurable benefit over each organisation's local model while keeping model updates private.

- **CP1 (reference):** federated training of a shared threat detector.
- **CP2 (contribution):** handling non-IID data, where each organisation sees a different mix of attacks.
- **Final system:** private model updates and a measured collaboration benefit.
- **Acceptance:** an independent check that the federated model beats local models under non-IID data.

*Team:* Pavuluri Jeshwanth Sai, Yash Verma, Gujjula Jyothi Sai Venkata Vyshnavi, Kancharla Jo Srinivas.
