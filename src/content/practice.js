export const CONCEPT_QUESTIONS = Object.freeze([
  {
    topic: 'Foundations',
    prompt: 'Which property lets callers use the same operation for local and remote resources?',
    options: ['Access transparency', 'Replication transparency', 'Scaling transparency'],
    answer: 0,
    explanation: 'Access transparency hides differences in data representation and invocation between local and remote resources.'
  },
  {
    topic: 'Foundations',
    prompt: 'Why can internal synchronization still leave every clock wrong?',
    options: ['It only limits differences between system clocks', 'It requires a UTC receiver', 'It moves clocks backwards'],
    answer: 0,
    explanation: 'Internal synchronization aligns the clocks with each other. The whole group may still deviate from UTC.'
  },
  {
    topic: 'Sockets',
    prompt: 'Which server-side TCP order is correct?',
    options: ['bind → listen → accept', 'accept → bind → listen', 'listen → connect → bind'],
    answer: 0,
    explanation: 'A TCP server binds its socket, starts listening and then accepts an incoming connection.'
  },
  {
    topic: 'RMI',
    prompt: 'Why is the remote interface available to both client and server?',
    options: ['It defines their shared contract', 'It contains the servant state', 'It starts the registry'],
    answer: 0,
    explanation: 'The server implements the contract and the client programs against it. The implementation remains on the server.'
  },
  {
    topic: 'Serialization',
    prompt: 'Which Java field is excluded from default object serialization?',
    options: ['transient field', 'private field', 'final field'],
    answer: 0,
    explanation: 'The transient modifier explicitly excludes instance state from default serialization. Static fields belong to the class and are not object state either.'
  },
  {
    topic: 'XML',
    prompt: 'A document follows XML syntax but violates its schema. What is it?',
    options: ['Well-formed but invalid', 'Valid but not well-formed', 'Neither readable nor parseable'],
    answer: 0,
    explanation: 'Well-formedness concerns XML syntax. Validity additionally requires conformance to a DTD or schema.'
  },
  {
    topic: 'Web',
    prompt: 'What normally happens to a JSP before it handles requests?',
    options: ['It is translated into a servlet', 'It becomes a database entity', 'It is published as a JMS topic'],
    answer: 0,
    explanation: 'The container translates and compiles a JSP into a servlet, which then participates in the servlet lifecycle.'
  },
  {
    topic: 'REST',
    prompt: 'Which method is intended to retrieve a representation without changing the resource?',
    options: ['GET', 'POST', 'DELETE'],
    answer: 0,
    explanation: 'GET is safe and intended for retrieval. It should not change server-side resource state.'
  },
  {
    topic: 'Persistence',
    prompt: 'What is the main security benefit of PreparedStatement parameters?',
    options: ['Values are separated from SQL structure', 'Transactions become unnecessary', 'ResultSet closes automatically'],
    answer: 0,
    explanation: 'Bound parameters keep user-provided values out of the SQL structure and therefore help prevent SQL injection.'
  },
  {
    topic: 'JPA',
    prompt: 'Which component tracks managed entities and synchronizes their changes?',
    options: ['Persistence context', 'Servlet context', 'JMS destination'],
    answer: 0,
    explanation: 'The persistence context manages entity identity and tracks changes that can be flushed to the database.'
  },
  {
    topic: 'JMS',
    prompt: 'Which model gives each queue message to one consumer?',
    options: ['Point-to-point', 'Publish/subscribe', 'Request dispatching'],
    answer: 0,
    explanation: 'A queue uses point-to-point messaging. A topic distributes a publication to its subscribers.'
  },
  {
    topic: 'Services',
    prompt: 'What does WSDL describe?',
    options: ['A web-service contract and endpoints', 'A Java object graph', 'A relational transaction'],
    answer: 0,
    explanation: 'WSDL describes service operations, exchanged messages, bindings and endpoints.'
  }
].map(question => Object.freeze({ ...question, options: Object.freeze([...question.options]) })));

export const CLOCK_CHALLENGES = Object.freeze([
  {
    type: 'Cristian',
    prompt: 'Request sent at T₀ = 120 ms, reply received at T₁ = 200 ms, server processing I = 20 ms. Estimate the one-way transmission time.',
    options: ['30 ms', '40 ms', '50 ms'],
    answer: 0,
    explanation: '(T₁ − T₀ − I) / 2 = (200 − 120 − 20) / 2 = 30 ms.'
  },
  {
    type: 'Lamport',
    prompt: 'Process P₂ has clock 4 and receives a message carrying timestamp 7. Which timestamp is assigned to the receive event?',
    options: ['8', '7', '5'],
    answer: 0,
    explanation: 'P₂ first takes max(4, 7) and then increments for the receive event, producing 8.'
  },
  {
    type: 'Vector clock',
    prompt: 'Compare A = [2, 1, 0] and B = [2, 0, 1]. What is their causal relation?',
    options: ['Concurrent', 'A happened before B', 'B happened before A'],
    answer: 0,
    explanation: 'A is greater in component 2 while B is greater in component 3. Neither vector is component-wise smaller.'
  },
  {
    type: 'Synchronization',
    prompt: 'Every machine differs from UTC by at most D. What maximum difference can two system clocks have?',
    options: ['2D', 'D', 'D/2'],
    answer: 0,
    explanation: 'One clock may be D ahead of UTC and another D behind it, yielding a maximum skew of 2D.'
  }
].map(challenge => Object.freeze({ ...challenge, options: Object.freeze([...challenge.options]) })));

export const MESSAGE_FLOWS = Object.freeze([
  {
    title: 'TCP server lifecycle',
    description: 'Arrange the decisive server operations before data exchange.',
    steps: ['Create socket', 'Bind address and port', 'Listen', 'Accept connection', 'Read or write streams']
  },
  {
    title: 'RMI invocation',
    description: 'Trace a call from the client to the remote implementation.',
    steps: ['Define shared remote interface', 'Export server object', 'Bind reference in registry', 'Client looks up reference', 'Stub forwards invocation to servant']
  },
  {
    title: 'REST request',
    description: 'Follow a resource request through a JAX-RS service.',
    steps: ['Build target URI', 'Choose accepted media type', 'Send HTTP request', 'Match resource method', 'Return status and representation']
  },
  {
    title: 'JMS queue delivery',
    description: 'Trace one point-to-point message.',
    steps: ['Producer creates message', 'Producer sends to queue', 'Broker stores and routes message', 'One consumer receives message', 'Delivery is acknowledged']
  }
].map(flow => Object.freeze({ ...flow, steps: Object.freeze([...flow.steps]) })));

const javaSnippet = snippet => Object.freeze({
  ...snippet,
  blanks: Object.freeze(snippet.blanks.map(blank => Object.freeze({
    ...blank,
    alternatives: Object.freeze([...(blank.alternatives || [])])
  })))
});

export const JAVA_LAB_SNIPPETS = Object.freeze([
  javaSnippet({
    id: 'tcp-client',
    topic: 'Sockets',
    title: 'Open a TCP client connection',
    instruction: 'Complete the class and the methods used to connect and obtain the byte streams.',
    template: `try ({{socketType}} socket = new {{socketType}}("localhost", 8080);
     InputStream in = socket.{{inputMethod}}();
     OutputStream out = socket.{{outputMethod}}()) {
    out.write("ping\\n".getBytes(StandardCharsets.UTF_8));
}`,
    blanks: [
      { id: 'socketType', answer: 'Socket', hint: 'The connected TCP endpoint from java.net.' },
      { id: 'inputMethod', answer: 'getInputStream', hint: 'Returns the stream used to read incoming bytes.' },
      { id: 'outputMethod', answer: 'getOutputStream', hint: 'Returns the stream used to send bytes.' }
    ],
    explanation: 'A connected Socket exposes an input and output stream. TCP transports an ordered byte stream and does not preserve message boundaries.'
  }),
  javaSnippet({
    id: 'tcp-server',
    topic: 'Sockets',
    title: 'Accept a TCP connection',
    instruction: 'Complete the listening endpoint and the blocking operation that creates a client socket.',
    template: `try ({{serverType}} server = new {{serverType}}(8080);
     Socket client = server.{{acceptMethod}}()) {
    client.getOutputStream().write("ready\\n".getBytes());
}`,
    blanks: [
      { id: 'serverType', answer: 'ServerSocket', hint: 'The java.net class bound to a listening TCP port.' },
      { id: 'acceptMethod', answer: 'accept', hint: 'Blocks until a client establishes a connection.' }
    ],
    explanation: 'ServerSocket owns the listening port. accept() returns a separate connected Socket for one client conversation.'
  }),
  javaSnippet({
    id: 'udp-receive',
    topic: 'Sockets',
    title: 'Receive a UDP datagram',
    instruction: 'Fill in the UDP endpoint, packet class and receive operation.',
    template: `byte[] buffer = new byte[1024];
try ({{socketType}} socket = new {{socketType}}(9000)) {
    {{packetType}} packet = new {{packetType}}(buffer, buffer.length);
    socket.{{receiveMethod}}(packet);
}`,
    blanks: [
      { id: 'socketType', answer: 'DatagramSocket', hint: 'The UDP endpoint class.' },
      { id: 'packetType', answer: 'DatagramPacket', hint: 'Wraps the payload buffer and addressing metadata.' },
      { id: 'receiveMethod', answer: 'receive', hint: 'Waits for one complete datagram.' }
    ],
    explanation: 'DatagramSocket receives independent DatagramPacket messages. UDP preserves each datagram boundary but does not guarantee delivery or ordering.'
  }),
  javaSnippet({
    id: 'rmi-lookup',
    topic: 'RMI',
    title: 'Look up a remote service',
    instruction: 'Complete the registry access, name lookup and remote invocation.',
    template: `Registry registry = LocateRegistry.{{registryMethod}}("localhost", 1099);
Calculator service = (Calculator) registry.{{lookupMethod}}("Calculator");
int result = service.{{remoteMethod}}(2, 3);`,
    blanks: [
      { id: 'registryMethod', answer: 'getRegistry', hint: 'Obtains a reference to an existing RMI registry.' },
      { id: 'lookupMethod', answer: 'lookup', hint: 'Resolves a bound service name.' },
      { id: 'remoteMethod', answer: 'add', alternatives: ['sum'], hint: 'The example remote operation combines the two numbers.' }
    ],
    explanation: 'The registry maps a logical name to a remote reference. The client invokes the shared remote interface through the returned stub.'
  }),
  javaSnippet({
    id: 'serialization-write',
    topic: 'Serialization',
    title: 'Serialize an object',
    instruction: 'Complete the object stream and the operation that writes the object graph.',
    template: `try ({{streamType}} out = new {{streamType}}(
        new FileOutputStream("user.bin"))) {
    out.{{writeMethod}}(user);
}`,
    blanks: [
      { id: 'streamType', answer: 'ObjectOutputStream', hint: 'Adds Java object serialization to an output stream.' },
      { id: 'writeMethod', answer: 'writeObject', hint: 'Serializes the supplied object graph.' }
    ],
    explanation: 'ObjectOutputStream writes a serializable object graph. transient instance fields and static class state are excluded from default object serialization.'
  }),
  javaSnippet({
    id: 'servlet-get',
    topic: 'Web',
    title: 'Handle an HTTP GET request',
    instruction: 'Complete the servlet method and response writer access.',
    template: `@Override
protected void {{handler}}(HttpServletRequest request,
        HttpServletResponse response) throws IOException {
    response.setContentType("text/plain");
    response.{{writerMethod}}().println("Hello");
}`,
    blanks: [
      { id: 'handler', answer: 'doGet', hint: 'HttpServlet dispatches GET requests to this method.' },
      { id: 'writerMethod', answer: 'getWriter', hint: 'Returns the character writer for the response body.' }
    ],
    explanation: 'The servlet container dispatches a GET request to doGet(). getWriter() is used for a character response after the content type has been selected.'
  }),
  javaSnippet({
    id: 'jdbc-query',
    topic: 'JDBC',
    title: 'Run a parameterized JDBC query',
    instruction: 'Complete statement creation, parameter binding and query execution.',
    template: `String sql = "SELECT name FROM users WHERE id = ?";
try (PreparedStatement statement = connection.{{prepareMethod}}(sql)) {
    statement.{{bindMethod}}(1, userId);
    try (ResultSet rows = statement.{{queryMethod}}()) {
        while (rows.next()) System.out.println(rows.getString("name"));
    }
}`,
    blanks: [
      { id: 'prepareMethod', answer: 'prepareStatement', hint: 'Creates a PreparedStatement from SQL containing placeholders.' },
      { id: 'bindMethod', answer: 'setInt', alternatives: ['setLong'], hint: 'Binds the numeric ID to placeholder index 1.' },
      { id: 'queryMethod', answer: 'executeQuery', hint: 'Executes SELECT and returns a ResultSet.' }
    ],
    explanation: 'PreparedStatement keeps parameter values separate from SQL structure. JDBC parameter indexes begin at 1, and executeQuery() returns the rows.'
  }),
  javaSnippet({
    id: 'jpa-find',
    topic: 'JPA',
    title: 'Load and update a managed entity',
    instruction: 'Complete the EntityManager lookup and transaction boundary.',
    template: `EntityTransaction transaction = entityManager.{{transactionMethod}}();
transaction.{{beginMethod}}();
User user = entityManager.{{findMethod}}(User.class, userId);
user.setActive(true);
transaction.{{commitMethod}}();`,
    blanks: [
      { id: 'transactionMethod', answer: 'getTransaction', hint: 'Returns the resource-local transaction object.' },
      { id: 'beginMethod', answer: 'begin', hint: 'Starts the transaction.' },
      { id: 'findMethod', answer: 'find', hint: 'Loads an entity by class and primary key.' },
      { id: 'commitMethod', answer: 'commit', hint: 'Completes the unit of work and makes changes durable.' }
    ],
    explanation: 'find() returns an entity managed by the persistence context. Dirty checking detects the state change and commit completes the transaction.'
  }),
  javaSnippet({
    id: 'rest-resource',
    topic: 'REST',
    title: 'Define a JAX-RS resource method',
    instruction: 'Complete the HTTP method annotation, path parameter and response builder.',
    template: `@{{httpAnnotation}}
@Path("/{id}")
@Produces(MediaType.APPLICATION_JSON)
public Response find(@PathParam("id") long id) {
    Order order = repository.find(id);
    return Response.{{responseMethod}}(order).build();
}`,
    blanks: [
      { id: 'httpAnnotation', answer: 'GET', hint: 'The annotation for safe retrieval.' },
      { id: 'responseMethod', answer: 'ok', hint: 'Starts a successful HTTP 200 response builder.' }
    ],
    explanation: '@GET maps retrieval requests to the method. @PathParam binds the URI segment, and Response.ok() creates a 200 response containing the representation.'
  }),
  javaSnippet({
    id: 'jms-send',
    topic: 'JMS',
    title: 'Send a JMS text message',
    instruction: 'Complete context creation, producer creation and message sending.',
    template: `try (JMSContext context = connectionFactory.{{contextMethod}}()) {
    JMSProducer producer = context.{{producerMethod}}();
    TextMessage message = context.createTextMessage("ready");
    producer.{{sendMethod}}(queue, message);
}`,
    blanks: [
      { id: 'contextMethod', answer: 'createContext', hint: 'Creates the simplified JMS 2 client context.' },
      { id: 'producerMethod', answer: 'createProducer', hint: 'Creates the object responsible for sending messages.' },
      { id: 'sendMethod', answer: 'send', hint: 'Transfers the message to the supplied destination.' }
    ],
    explanation: 'JMSContext groups connection and session responsibilities. JMSProducer sends the message to a destination while the provider handles routing and delivery.'
  })
]);

export const FLASHCARDS = Object.freeze([
  ['distributed-definition', 'Foundations', 'What makes a system distributed?', 'Autonomous computers coordinate through message exchange while components, data and failures are spread across a network.'],
  ['transparency', 'Foundations', 'What is transparency in a distributed system?', 'It hides a selected aspect of distribution, such as access method, location, replication, concurrency, failure or scaling.'],
  ['client-server', 'Organization', 'What do client and server describe?', 'Interaction roles: a client requests a service and a server provides it. One process can perform both roles in different exchanges.'],
  ['middleware-role', 'Organization', 'Why is middleware used?', 'It provides reusable distributed mechanisms such as communication, naming, serialization, security and transactions above the network layer.'],
  ['clock-drift', 'Time', 'What is clock drift?', 'The gradual divergence of physical clocks because their oscillators run at slightly different rates.'],
  ['lamport-rule', 'Time', 'What guarantee does a Lamport clock provide?', 'If event a happened before event b, then L(a) is smaller than L(b). The reverse implication is not guaranteed.'],
  ['vector-concurrency', 'Time', 'How do vector clocks identify concurrent events?', 'Two events are concurrent when neither vector timestamp is component-wise less than or equal to the other.'],
  ['tcp-boundaries', 'Sockets', 'Does TCP preserve application message boundaries?', 'No. TCP provides a reliable ordered byte stream, so applications must define their own framing.'],
  ['socket-endpoint', 'Sockets', 'Which values identify a transport endpoint?', 'The transport protocol, IP address and port. The IP routes to an interface; the port selects an application endpoint.'],
  ['udp-guarantees', 'Sockets', 'Which guarantees does UDP omit?', 'UDP does not guarantee delivery, ordering or duplicate suppression, but it preserves individual datagram boundaries.'],
  ['rmi-roles', 'RMI', 'What are stub and servant in RMI?', 'The stub is the client-side proxy; the servant is the server-side object that executes the remote operation.'],
  ['rmi-registry', 'RMI', 'What does the RMI registry provide?', 'A naming service that maps a logical service name to a remote object reference.'],
  ['serialization-state', 'Serialization', 'Which fields are excluded from default Java object serialization?', 'Static fields are class state, not object state; transient instance fields are explicitly excluded.'],
  ['object-graph', 'Serialization', 'What is serialized when an object references other objects?', 'The reachable graph of serializable objects, while preserving shared references within that graph.'],
  ['xml-wellformed-valid', 'XML', 'How do well-formed and valid XML differ?', 'Well-formed XML follows syntax rules. Valid XML is also well-formed and conforms to its DTD or XML Schema.'],
  ['dtd-xsd', 'XML', 'What is a key difference between DTD and XML Schema?', 'XML Schema is XML-based and provides namespaces and rich data types; DTD has a more limited type system.'],
  ['http-message', 'Web', 'What are the essential parts of an HTTP exchange?', 'A request contains a method, target, headers and optional body; a response contains a status, headers and optional body.'],
  ['servlet-lifecycle', 'Web', 'Who controls a servlet lifecycle?', 'The web container creates and initializes the servlet, dispatches requests to service methods and eventually destroys it.'],
  ['jsp-translation', 'JSP', 'What happens to a JSP before it serves requests?', 'The container translates it into a servlet and compiles that generated servlet class.'],
  ['jsp-scope', 'JSP', 'Name the common JSP data scopes from narrowest to widest.', 'Page, request, session and application scope.'],
  ['soap-envelope', 'Web Services', 'What is the structure of a SOAP message?', 'An XML Envelope contains an optional Header and a mandatory Body carrying the message payload or fault.'],
  ['wsdl-contract', 'Web Services', 'What does WSDL describe?', 'A web-service contract: operations, messages, data types, bindings and service endpoints.'],
  ['rest-resource', 'REST', 'What is a resource in REST?', 'A conceptual entity identified by a URI whose state is exchanged through representations.'],
  ['http-idempotence', 'REST', 'What does idempotent mean for an HTTP method?', 'Repeating the same request has the same intended effect as performing it once. GET, PUT and DELETE are defined as idempotent.'],
  ['prepared-statement', 'JDBC', 'Why use PreparedStatement parameters?', 'They separate values from SQL structure, improve type handling and help prevent SQL injection.'],
  ['jdbc-transaction', 'JDBC', 'Where is transaction control located in JDBC?', 'On the Connection, using auto-commit configuration plus commit() and rollback().'],
  ['persistence-context', 'JPA', 'What does a JPA persistence context guarantee?', 'It tracks managed entities and maintains one managed Java instance per persistent identity within that context.'],
  ['entity-states', 'JPA', 'What are the main JPA entity states?', 'New/transient, managed/persistent, detached and removed.'],
  ['queue-topic', 'JMS', 'How do a JMS queue and topic differ?', 'A queue delivers each message to one competing consumer; a topic can deliver a publication to every eligible subscriber.'],
  ['message-broker', 'JMS', 'Why does a message broker decouple participants?', 'Producers send to destinations rather than consumers directly, allowing separation in time, location and implementation.']
].map(([id, topic, front, back]) => Object.freeze({ id, topic, front, back })));

export const PRACTICE_MODES = Object.freeze([
  {
    id: 'concept-blitz',
    navTitle: 'Concept Blitz',
    category: 'Practice',
    title: 'Concept Blitz',
    subtitle: 'Fast comparisons across the complete lecture',
    summary: 'Answer mixed conceptual questions and use immediate explanations to correct weak distinctions.',
    kind: 'quiz'
  },
  {
    id: 'clock-lab',
    navTitle: 'Clock Lab',
    category: 'Practice',
    title: 'Clock Lab',
    subtitle: 'Physical and logical time',
    summary: 'Calculate delays and timestamps and decide causal relationships step by step.',
    kind: 'clock'
  },
  {
    id: 'message-flow',
    navTitle: 'Message Flow',
    category: 'Practice',
    title: 'Message Flow',
    subtitle: 'Sockets, RMI, REST and JMS',
    summary: 'Reconstruct the control and data flow of the communication technologies from the lecture.',
    kind: 'sequence'
  },
  {
    id: 'java-lab',
    navTitle: 'Java Lab',
    category: 'Practice',
    title: 'Java Lab',
    subtitle: 'Complete the essential Java API patterns',
    summary: 'Fill the gaps in compact Java snippets for sockets, RMI, serialization, web APIs, persistence and messaging.',
    kind: 'code-completion'
  },
  {
    id: 'flashcards',
    navTitle: 'Flashcards',
    category: 'Practice',
    title: 'Theory Flashcards',
    subtitle: 'Prioritized recall across the complete course',
    summary: 'Recall core theory, reveal the answer and rate each card as Again, Learning or Mastered to control its review priority.',
    kind: 'flashcards'
  },
  {
    id: 'exam-mode',
    navTitle: 'Exam Mode',
    category: 'Exam',
    title: 'Exam Mode',
    subtitle: 'Theory, Java code, HTTP and XML/DTD',
    summary: 'Complete a mixed paper-style exam without immediate feedback, then review every answer with a model explanation.',
    kind: 'exam'
  }
].map(mode => Object.freeze({ ...mode })));
