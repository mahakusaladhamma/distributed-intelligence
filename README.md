# Distributed Intelligence

Current learning release: **v0.8 · Integrated Tutorials**

The interactive learning framework turns the guided theory paths into reusable course modules with contextual definitions, progressive disclosure, clickable diagrams, annotated code, embedded checks, concept links and section-level progress.

Guided theory is embedded directly into every topic page as the primary learning content. Topic selection opens the saved tutorial step immediately; no modal or separate tutorial launcher is required.

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
- **Java Lab** for completing essential API snippets across sockets, RMI, serialization, servlets, REST, JDBC, JPA and JMS
- **Theory Flashcards** with persistent Again, Learning and Mastered stages that prioritize weak and due cards

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

## Interactive learning framework

Tutorial content stays declarative while the shared renderer supplies:

- automatic glossary highlighting with compact definitions and related concepts
- expandable deep dives, exam tips, common mistakes and memory callouts
- clickable diagrams with relationship and message-flow highlighting
- token-level explanations for Java and protocol examples
- multiple-choice and ordering checks with immediate explanatory feedback
- per-step `Not Started`, `Reading` and `Completed` state plus review markers

The initial enhanced examples cover Cristian synchronization, socket addressing
and server code, RMI invocation flow, REST requests and JMS queue delivery. Every
tutorial receives automatic glossary support and concept linking.
