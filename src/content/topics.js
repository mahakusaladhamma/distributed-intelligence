export const TOPICS = Object.freeze([
  {
    id: 'overview',
    navTitle: 'Course Overview',
    category: 'Foundations',
    title: 'Distributed Systems',
    subtitle: 'Ideas, properties and the shape of the course',
    summary: 'Build the vocabulary needed to reason about autonomous computers that communicate and coordinate through a network.',
    objectives: ['Definition and motivation', 'Transparency and scalability', 'Faults, concurrency and partial knowledge'],
    sources: ['ds2026_intro(1).pdf']
  },
  {
    id: 'organization',
    navTitle: 'Organization',
    category: 'Foundations',
    title: 'System Organization',
    subtitle: 'Architectures, roles and communication models',
    summary: 'Compare architectural styles and understand how clients, servers, middleware and distributed objects divide responsibility.',
    objectives: ['Client/server and layered architectures', 'Middleware and interfaces', 'Naming and locating services'],
    sources: ['ds2026_org.pdf']
  },
  {
    id: 'time',
    navTitle: 'Time & Clocks',
    category: 'Coordination',
    title: 'Time and Logical Order',
    subtitle: 'Clock synchronization and event ordering',
    summary: 'Reason about physical clock drift, synchronization and causal ordering without assuming a perfect global clock.',
    objectives: ['Cristian and Berkeley algorithms', 'Lamport clocks', 'Vector clocks and causality'],
    sources: ['ds2026_time.pdf']
  },
  {
    id: 'sockets',
    navTitle: 'Sockets',
    category: 'Communication',
    title: 'Socket Communication',
    subtitle: 'Direct process-to-process communication',
    summary: 'Follow the lifecycle of TCP and UDP communication and read the corresponding client and server code.',
    objectives: ['Addresses, ports and endpoints', 'TCP server/client lifecycle', 'Streams, datagrams and blocking'],
    sources: ['sockets.pdf']
  },
  {
    id: 'rmi',
    navTitle: 'RMI & CORBA',
    category: 'Communication',
    title: 'Remote Method Invocation',
    subtitle: 'Calling remote objects through shared contracts',
    summary: 'Trace a remote invocation from interface and registry lookup through stub, servant and returned result.',
    objectives: ['Remote interfaces and exceptions', 'Registry, stub and servant', 'Pass-by-value and remote references'],
    sources: ['ds2026_rmi(1).pdf']
  },
  {
    id: 'serialization',
    navTitle: 'Serialization',
    category: 'Data Exchange',
    title: 'Java Serialization',
    subtitle: 'Turning object state into a transferable representation',
    summary: 'Understand what Java serializes, which fields are excluded and how object graphs are reconstructed.',
    objectives: ['Serializable object graphs', 'transient and static fields', 'Object streams and compatibility'],
    sources: ['ds2026_serial(1).pdf']
  },
  {
    id: 'xml',
    navTitle: 'XML & Schema',
    category: 'Data Exchange',
    title: 'XML, DTD and XML Schema',
    subtitle: 'Structured documents and validation',
    summary: 'Read XML documents, distinguish well-formedness from validity and compare DTD with XML Schema.',
    objectives: ['Elements, attributes and namespaces', 'DTD declarations', 'XML Schema types and validation'],
    sources: ['ds2026_xml.pdf', 'xml.pdf']
  },
  {
    id: 'web',
    navTitle: 'Web & Servlets',
    category: 'Web',
    title: 'Web Applications',
    subtitle: 'HTTP, servlets and server-side request handling',
    summary: 'Track an HTTP request through a Java web application and understand the servlet lifecycle and state mechanisms.',
    objectives: ['HTTP requests and responses', 'Servlet lifecycle', 'Sessions, cookies and application state'],
    sources: ['ds2026_web(1).pdf']
  },
  {
    id: 'jsp',
    navTitle: 'JSP',
    category: 'Web',
    title: 'JavaServer Pages',
    subtitle: 'Dynamic views in Java web applications',
    summary: 'Understand how JSP pages become servlets and how view templates access request and application data.',
    objectives: ['JSP translation lifecycle', 'Directives, actions and expressions', 'Scopes and JavaBeans'],
    sources: ['ds2026_jsp(1).pdf']
  },
  {
    id: 'webservices',
    navTitle: 'Web Services',
    category: 'Services',
    title: 'SOAP Web Services',
    subtitle: 'Contract-based communication across systems',
    summary: 'Connect SOAP messages, WSDL contracts and service endpoints into one interoperable service model.',
    objectives: ['SOAP envelope and messages', 'WSDL service descriptions', 'Service publication and discovery'],
    sources: ['webservices.pdf']
  },
  {
    id: 'rest',
    navTitle: 'REST',
    category: 'Services',
    title: 'RESTful Services',
    subtitle: 'Resources, representations and HTTP semantics',
    summary: 'Design and read resource-oriented APIs using HTTP methods, status codes, paths, parameters and representations.',
    objectives: ['Resources and URIs', 'HTTP method semantics', 'JAX-RS annotations and content negotiation'],
    sources: ['ds2026_REST.pdf']
  },
  {
    id: 'jdbc',
    navTitle: 'JDBC',
    category: 'Persistence',
    title: 'JDBC',
    subtitle: 'Relational database access from Java',
    summary: 'Trace database access from connection setup to prepared statements, result sets and transaction boundaries.',
    objectives: ['Connections and statements', 'PreparedStatement and ResultSet', 'Transactions and resource handling'],
    sources: ['ds2026_jdbc.pdf']
  },
  {
    id: 'jpa',
    navTitle: 'JPA',
    category: 'Persistence',
    title: 'Java Persistence API',
    subtitle: 'Mapping objects to relational data',
    summary: 'Understand entities, persistence contexts, relationships and the lifecycle of managed objects.',
    objectives: ['Entities and identifiers', 'Persistence context and entity states', 'Relationships, queries and transactions'],
    sources: ['ds2026_jpa.pdf']
  },
  {
    id: 'jms',
    navTitle: 'JMS',
    category: 'Messaging',
    title: 'Java Message Service',
    subtitle: 'Asynchronous communication through messages',
    summary: 'Compare queues and topics and follow a message through producer, broker, destination and consumer.',
    objectives: ['Point-to-point queues', 'Publish/subscribe topics', 'Delivery, acknowledgment and message-driven beans'],
    sources: ['ds2026_jms(1).pdf']
  }
].map(topic => Object.freeze({
  ...topic,
  objectives: Object.freeze([...topic.objectives]),
  sources: Object.freeze([...topic.sources])
})));
