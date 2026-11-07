---
title: "Projects guided"
description: "Student projects guided by Dr. Asesh Kumar Tripathy, including B.Tech capstone projects in cybersecurity and blockchain."
---

<p class="lead">Student projects I guide. Each B.Tech capstone runs over two semesters (CP1 and CP2) and must end in a complete, independently tested engineering system. Every team below has already had a conference paper accepted.</p>

### B.Tech capstone projects

#### C14 (Cyber-14): DDoS Detection and Mitigation

*Batch:* B67 · *Domain:* Cybersecurity and Blockchain Systems · *Reference:* [CIC-DDoS2019 dataset](https://www.unb.ca/cic/datasets/ddos-2019.html)

Distributed denial-of-service attacks flood a service with traffic until real users cannot reach it. The hard part is telling an attack apart from a legitimate flash crowd, such as a sudden rush of genuine visitors. The team is building a system that detects attacks quickly, separates them from flash crowds, and responds to reduce their impact.

- **CP1 (reference):** distinguishing attack traffic from legitimate flash crowds.
- **CP2 (contribution):** classifying the attack type and adding a mitigation response.
- **Final system:** a streaming detection pipeline with a dashboard.
- **Acceptance:** detection accuracy and latency, measured independently.

*Team:* Yelchuru Venkata Suhitha, Nakka Satwika, Vikas Kumar Sharma, Morusu Jyoshna.

**Paper accepted:** “FlashGuard: Risk-Bounded DDoS Detection and Adaptive Mitigation under Flash Crowds, Unseen Attacks, and Traffic Drift”, 2026 Indian Conference on Advances in Electrical, Computers, and Communications (IConAECC 2026). Registered and presented papers will be considered for IEEE Xplore.

#### C19 (Cyber-19): Automated Web-Application Vulnerability Scanner

*Domain:* Cybersecurity and Blockchain Systems · *Reference:* [OWASP ZAP](https://www.zaproxy.org/) and the OWASP Top 10

Web applications have a huge attack surface, and OWASP Top 10 flaws such as injection, broken access control and cross-site scripting are everywhere. Automated scanning helps developers find them before attackers do. The team is building an educational scanner, used only on authorised targets, that detects OWASP-class flaws and explains how to fix them.

- **CP1 (reference):** checks for XSS, injection and access-control flaws.
- **CP2 (contribution):** severity scoring and remediation guidance for each finding.
- **Final system:** a reporting interface, benchmarked against a baseline scanner.
- **Acceptance:** detection accuracy and false-positive rate, measured independently.

*Team:* Singirikonda Saimahima, Podila Lakshmi Prasanna, Mandru Sirisha.

**Paper accepted, on a separate topic from this project:** “Protocol-Invariant Cross-Chain Attack Detection: Domain-Generalized Monitoring for Previously Unseen Bridges”, International Conference on Intelligent Networks and Data-driven Intelligent Applications (ICon INDIA 2026). Registered and presented papers will be considered for IEEE Xplore.

#### C20 (Cyber-20): Federated Collaborative Threat Detection

*Batch:* B66 · *Domain:* Cybersecurity and Blockchain Systems · *Reference:* [Flower federated learning framework](https://flower.ai/)

Organisations detect threats better together, but privacy and competition stop them from sharing raw security data. Federated learning lets them train a shared threat detector without pooling their data. The team is building a federated detector that shows a measurable benefit over each organisation's local model while keeping model updates private.

- **CP1 (reference):** federated training of a shared threat detector.
- **CP2 (contribution):** handling non-IID data, where each organisation sees a different mix of attacks.
- **Final system:** private model updates and a measured collaboration benefit.
- **Acceptance:** an independent check that the federated model beats local models under non-IID data.

*Team:* Pavuluri Jeshwanth Sai, Yash Verma, Gujjula Jyothi Sai Venkata Vyshnavi, Kancharla Jo Srinivas.

**Paper accepted for oral presentation:** “Sybil-Resilient and Publicly Verifiable Federated Intrusion Detection for Heterogeneous IoT Networks”, 10th Conference on Information and Communication Technology (CICT 2026), with the IEEE Hyderabad Section, IIITDM Kurnool, 18–20 December 2026. Proceedings to be submitted to IEEE Xplore.

#### CHAIN-31: Smart Contract Security Testing Across the Deployment Lifecycle

*Batch:* B65 · *Domain:* Blockchain and Web3 Engineering · *Reference:* [OWASP smart contract security testing guidance](https://owasp.org/)

A smart contract cannot be changed once deployed. A bug found later can only be worked around through an upgrade proxy, and proxies bring risks of their own. The team is building smart contract testing that treats the upgrade mechanism as part of the attack surface rather than as a safety net.

- **CP1 (reference):** checking the economic assumptions a contract depends on.
- **CP2 (contribution):** testing upgrade and proxy mechanisms as an attack surface.
- **Final system:** testing migration paths and storage-layout compatibility between versions.
- **Acceptance:** test coverage measured against contracts with known defects.

*Team:* Chinthagunta Aasritha, Amirneni Neeharika, Shivam Singh, Darapu Prem Reddy.

**Paper accepted:** “Evidence-Guided Vulnerability Repair for Financially Critical Ethereum Decentralized Applications”, 2026 Indian Conference on Advances in Electrical, Computers, and Communications (IConAECC 2026). Registered and presented papers will be considered for IEEE Xplore.
