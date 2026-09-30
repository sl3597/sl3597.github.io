---
title: "SHMemora: Protective Key–Value Store on Distributed Shared Memory"
collection: publications
date: 2026-05-01
venue: "Proceedings of the 42nd IEEE International Conference on Data Engineering (ICDE 2026)"
category: conferences
excerpt: "The first protective multi-host in-memory key-value store on CXL-based shared memory, achieving 3.45× the throughput of Redis with 1.68% overhead for security protection."
citation: "Jiajun Luo, Siyu Lin, Yunpeng Xu, <b>Shengwei Liu</b>, Jin Xia, Dong Liu, Zheng Liu, Huanchen Zhang, Teng Ma, Shuwen Deng. &quot;SHMemora: Protective Key–Value Store on Distributed Shared Memory.&quot; In <i>Proceedings of the 42nd IEEE International Conference on Data Engineering (ICDE)</i>, 2026."
---

**Authors:**  
Jiajun Luo, Siyu Lin, Yunpeng Xu, **Shengwei Liu**, Jin Xia, Dong Liu, Zheng Liu, Huanchen Zhang, Teng Ma, Shuwen Deng.

---

## Abstract
Modern in-memory key-value stores (IMKVS) are essential for data-intensive applications but increasingly limited by memory capacity. Traditional scale-out over TCP/IP or RDMA incurs high overhead from network latency and data movement. Emerging Compute Express Link (CXL) enables near-local-latency shared memory across hosts, offering a promising path for scaling IMKVS. However, existing CXL-based systems prioritize performance and overlook security, leaving shared memory exposed to unauthorized access. In this work, we present SHMemora, to the best of our knowledge, the first protective multi-host IMKVS built on CXL-based shared memory in coherent Distributed Shared Memory (DSM) environments. SHMemora addresses three key challenges, including strict protection enforcement, fine-grained memory protection, and scalable metadata management. These are solved by SHMemora through Intel MPK-based memory isolation, a capability-based protection, and metadata batching, respectively. We implement SHMemora on real CXL hardware and evaluate its security through formal proofs and penetration tests, and its performance through microbenchmarks and real workloads, demonstrating both strong protection guarantees and practical scalability. SHMemora achieves an average of 3.45× throughput compared to Redis under multiple hosts, incurring an average of 1.68% throughput overhead for the security protection.
