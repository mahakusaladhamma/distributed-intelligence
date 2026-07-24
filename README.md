# Distributed Intelligence

Current learning release: **v0.4 · Exam Mode**

The exam mode combines theory questions, Java code completion, TCP/UDP and HTTP request analysis, and XML validation against a supplied DTD in a timed 90-minute attempt. Answers remain revisable until submission; afterwards, the app provides a point-based review with model explanations.

Interactive exam preparation for the Distributed Systems module.

The project uses the proven foundation of Algo Arena: native JavaScript modules,
custom responsive CSS, a manifest-driven topic registry, local progress and
Node-based smoke tests. The current release combines the complete lecture-topic
map with interactive practice and a guided theory system.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Development

```bash
npm install
npm test
npm run check
```

No build step or backend is required.
## Interactive practice

The initial practice lineup contains:

- **Concept Blitz** for mixed lecture-wide comparisons with immediate explanations
- **Clock Lab** for Cristian delay estimates, synchronization bounds, Lamport timestamps and vector-clock causality
- **Message Flow** for reconstructing TCP, RMI, REST and JMS control/data paths

These modes intentionally focus on explaining concepts, tracing execution and recognizing small decisive steps in example programs.

## Guided theory

Every one of the 14 lecture areas has a complete tutorial path based on the
provided course material. Each step contains:

- a focused explanation of one concept or workflow
- formulas or concrete examples where they improve understanding
- a source reference to the corresponding lecture PDF
- an understanding check with immediate explanatory feedback
- locally stored progress and a transition into related practice

The content covers foundations and organization, time, sockets, RMI/CORBA,
serialization, XML/DTD/XML Schema, web applications and servlets, JSP, SOAP
web services, REST, JDBC, JPA and JMS.
