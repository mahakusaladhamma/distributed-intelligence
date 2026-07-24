import { defineTutorials } from './define-tutorials.js';

const check = (prompt, options, answer, explanation) => ({ prompt, options, answer, explanation });

export const TUTORIALS = defineTutorials([
  {
    topicId: 'overview',
    title: 'Distributed systems from first principles',
    description: 'Build the vocabulary for autonomy, communication, transparency and the unavoidable difficulties of distribution.',
    steps: [
      {
        id: 'definition', title: '1. What makes a system distributed?', source: 'ds2026_intro(1).pdf · Definition and goals',
        paragraphs: [
          'A distributed system consists of autonomous computers that communicate through a network and cooperate on a shared task. There is no shared memory and no perfectly shared clock.',
          'The system should appear coherent to its users even though computation, data and failures are spread across several machines.'
        ],
        example: 'A web shop may use separate services for the catalogue, orders and payment while presenting one application.',
        check: check('Which condition is characteristic of a distributed system?', ['Autonomous computers communicate over a network', 'Every process shares one physical memory', 'All work happens on one CPU'], 0, 'Distribution combines autonomous computers through message-based communication.')
      },
      {
        id: 'motivation', title: '2. Why distribute?', source: 'ds2026_intro(1).pdf · Motivation',
        paragraphs: [
          'Distribution enables resource sharing, collaboration, geographic reach, incremental growth and potentially higher availability.',
          'These advantages introduce costs: communication is slower than local access, components fail independently and concurrent activity becomes harder to coordinate.'
        ],
        check: check('Which is a genuine cost of distribution?', ['Partial failures can leave other components running', 'Network calls become ordinary local instructions', 'Concurrency disappears'], 0, 'One machine or link can fail while the rest of the system continues.')
      },
      {
        id: 'transparency', title: '3. Transparency dimensions', source: 'ds2026_intro(1).pdf · Transparency dimensions',
        paragraphs: [
          'Access transparency hides differences in representation and invocation. Location transparency hides where a resource resides. Migration and relocation transparency hide movement.',
          'Replication transparency hides copies, concurrency transparency hides competing users, failure transparency masks recoverable faults and scaling transparency allows growth without redesigning the interface.'
        ],
        example: 'Calling the same method regardless of whether its object is local or remote aims at access transparency.',
        check: check('Which transparency hides the physical place of a resource?', ['Location transparency', 'Concurrency transparency', 'Failure transparency'], 0, 'Location transparency keeps users independent of a resource address.')
      },
      {
        id: 'challenges', title: '4. The central reasoning problems', source: 'ds2026_intro(1).pdf · Characteristics',
        paragraphs: [
          'Processes execute concurrently and only learn about remote events through messages. Network delay is variable, clocks drift and no process has a complete instantaneous view.',
          'Good distributed designs therefore make assumptions explicit: timing model, failure model, consistency needs and the guarantees offered by communication.'
        ],
        check: check('Why can one process lack an exact current view of another?', ['Information arrives through delayed messages', 'Every process executes sequentially', 'Physical clocks always agree'], 0, 'Remote knowledge is always based on messages that need time to arrive.')
      }
    ]
  },
  {
    topicId: 'organization',
    title: 'How distributed systems divide responsibility',
    description: 'Connect clients, servers, layers, middleware and naming into a single architectural picture.',
    steps: [
      {
        id: 'roles', title: '1. Clients, servers and peers', source: 'ds2026_org.pdf · System organization',
        paragraphs: [
          'A server exposes a service and a client requests it. These are roles for an interaction; one process can be a client in one exchange and a server in another.',
          'Peer-to-peer systems distribute both responsibilities across participating nodes instead of relying on one permanent central service.'
        ],
        check: check('What does “client” describe?', ['A role that requests a service', 'A machine that can never serve data', 'The central network router'], 0, 'Client and server describe interaction roles rather than fixed hardware types.')
      },
      {
        id: 'layers', title: '2. Layers and tiers', source: 'ds2026_org.pdf · Architectural organization',
        paragraphs: [
          'Layering separates concerns such as presentation, application logic and persistence. A tier is the physical or process-level deployment of one or more layers.',
          'Separation improves maintainability and independent scaling, while each remote boundary adds latency and a possible failure point.'
        ],
        check: check('What is a tier primarily about?', ['Where parts are deployed', 'Only the Java package structure', 'The order of XML elements'], 0, 'Layers organize responsibilities; tiers describe their deployment boundaries.')
      },
      {
        id: 'middleware', title: '3. Middleware as a shared substrate', source: 'ds2026_org.pdf · Middleware',
        paragraphs: [
          'Middleware sits between applications and lower-level networking. It supplies reusable communication, naming, serialization, security or transaction mechanisms.',
          'RMI, message brokers and application servers offer different abstractions over the same basic reality: processes exchange data across a network.'
        ],
        check: check('What is middleware meant to provide?', ['Reusable distributed-system services', 'A replacement for every application rule', 'A physical network cable'], 0, 'Middleware standardizes recurring mechanisms without defining the whole application.')
      },
      {
        id: 'naming', title: '4. Naming and locating services', source: 'ds2026_org.pdf · Organization and naming',
        paragraphs: [
          'A name lets clients refer to a service independently of the service object itself. A naming service maps that name to a usable address or remote reference.',
          'This indirection supports relocation and late binding, but the naming service becomes part of startup and failure handling.'
        ],
        check: check('Why use a naming service?', ['To map stable names to usable service references', 'To serialize every argument', 'To replace the server implementation'], 0, 'Naming separates how a service is identified from where its current endpoint lives.')
      }
    ]
  },
  {
    topicId: 'time',
    title: 'Physical time and causal order',
    description: 'Understand clock error, Cristian synchronization, happened-before, Lamport timestamps and vector clocks.',
    steps: [
      {
        id: 'physical', title: '1. Physical clocks are imperfect', source: 'ds2026_time.pdf · Physical clocks and UTC',
        paragraphs: [
          'Hardware clocks count oscillator ticks. Their rates differ slightly, so clocks drift apart even after they were synchronized.',
          'UTC is the external reference. External synchronization bounds each clock against UTC; internal synchronization only bounds clocks against each other.'
        ],
        formula: 'External: |Cᵢ(t) − UTC(t)| ≤ D   ·   Internal: |Cᵢ(t) − Cⱼ(t)| ≤ D',
        check: check('What does internal synchronization guarantee?', ['System clocks remain close to each other', 'Every clock is close to UTC', 'Clock drift is physically removed'], 0, 'Internally synchronized clocks may still all be wrong relative to UTC.')
      },
      {
        id: 'cristian', title: '2. Cristian estimates transmission delay', source: 'ds2026_time.pdf · Algorithm of Cristian',
        paragraphs: [
          'A client records T₀, requests time from a UTC receiver and records T₁ when the answer arrives. If the server spent I processing the request, the network round trip is T₁−T₀−I.',
          'Assuming similar outbound and return delays, one-way transmission is half that value. The client adds this estimate to the server timestamp.'
        ],
        formula: 'delay ≈ (T₁ − T₀ − I) / 2',
        example: 'T₀=100 ms, T₁=180 ms and I=20 ms gives an estimated one-way delay of 30 ms.',
        check: check('Why is the remaining round-trip time divided by two?', ['It estimates one direction under a symmetry assumption', 'Two servers answer', 'UTC ticks twice as fast'], 0, 'The measured interval contains an outward and a return transmission.')
      },
      {
        id: 'happened-before', title: '3. Happened-before is a partial order', source: 'ds2026_time.pdf · Logical time',
        paragraphs: [
          'Within one process, program order establishes event order. Sending a message happened before receiving it. Transitivity connects these relations.',
          'If neither a→b nor b→a can be derived, the events are concurrent. Concurrent does not mean simultaneous; it means no causal order is known.'
        ],
        check: check('When are two events concurrent?', ['Neither happened-before relation can be derived', 'They have identical wall-clock seconds', 'They run on the same process'], 0, 'Concurrency is the absence of a causal path in either direction.')
      },
      {
        id: 'logical', title: '4. Lamport and vector clocks', source: 'ds2026_time.pdf · Lamport clocks and vector clocks',
        paragraphs: [
          'Lamport clocks increment on local events. Messages carry timestamps; a receiver sets its counter above both its local value and the received value. Thus a→b implies L(a)<L(b), while the reverse implication is not guaranteed.',
          'Vector clocks keep one component per process. Component-wise comparison can detect causality: V(a)<V(b) means a→b; incomparable vectors identify concurrent events.'
        ],
        formula: 'Receive: L := max(Llocal, Lmessage) + 1',
        check: check('What can vector clocks detect that Lamport clocks cannot?', ['Whether two events are concurrent', 'The exact UTC time', 'Network bandwidth'], 0, 'Incomparable vectors reveal that neither event causally precedes the other.')
      }
    ]
  },
  {
    topicId: 'sockets',
    title: 'Sockets and transport protocols',
    description: 'Trace addresses, UDP datagrams, TCP connections and Java client/server code.',
    steps: [
      {
        id: 'endpoint', title: '1. Address, port and socket', source: 'sockets.pdf · Internet technology and addresses',
        paragraphs: [
          'An IP address identifies a host interface; a port identifies a receiving application endpoint on that host. Together with the transport protocol they identify communication endpoints.',
          'A socket is the programming abstraction through which a process sends or receives data.'
        ],
        check: check('What does a port number identify?', ['An application endpoint on a host', 'A Java class', 'The global time server'], 0, 'The IP address selects the host and the port selects a process endpoint.')
      },
      {
        id: 'udp', title: '2. UDP exchanges independent datagrams', source: 'sockets.pdf · UDP',
        paragraphs: [
          'UDP is connectionless. Each datagram carries a destination and preserves message boundaries, but delivery, ordering and duplicate suppression are not guaranteed.',
          'Applications choose UDP when low overhead or timeliness matters more than reliable delivery, and must add their own reliability if needed.'
        ],
        check: check('Which guarantee does UDP provide by itself?', ['Datagram boundaries', 'Reliable ordered delivery', 'A persistent connection'], 0, 'UDP preserves individual messages but does not acknowledge or order them.')
      },
      {
        id: 'tcp', title: '3. TCP provides a byte stream', source: 'sockets.pdf · TCP',
        paragraphs: [
          'TCP establishes a connection and provides reliable, ordered bytes with transparent retransmission. It does not preserve application message boundaries.',
          'Both sides must therefore agree on framing, such as line endings, a length prefix or a higher-level protocol.'
        ],
        check: check('Why does a TCP application need framing?', ['TCP is a byte stream without message boundaries', 'TCP loses every second packet', 'Ports are unavailable in TCP'], 0, 'Reads may return any available portion of the ordered byte stream.')
      },
      {
        id: 'lifecycle', title: '4. Client and server lifecycle', source: 'sockets.pdf · TCP server and client',
        paragraphs: [
          'A server creates a server socket, binds and listens, then accepts a connection. The accepted socket represents one client conversation; the listening socket remains available for new clients.',
          'The client connects to the server address and port. Both sides exchange data through input and output streams and close resources when finished.'
        ],
        formula: 'Server: bind → listen → accept → exchange → close',
        check: check('Which socket should remain available for additional clients?', ['The listening server socket', 'Only the first accepted socket', 'The client input stream'], 0, 'Each accept produces a connection socket while the listening socket continues accepting.')
      },
      {
        id: 'concurrency', title: '5. Blocking and concurrency', source: 'sockets.pdf · Server implementation',
        paragraphs: [
          'Operations such as accept and read can block until a connection or data arrives. A sequential server may therefore leave other clients waiting.',
          'Servers commonly dedicate a thread, task or event-driven handler to each active connection while keeping shared state synchronized.'
        ],
        check: check('Why can a sequential blocking server delay a second client?', ['It may wait inside the first client interaction', 'TCP allows only one global client', 'Ports stop existing after accept'], 0, 'Blocking work for one connection prevents the same execution thread from accepting or serving another.')
      }
    ]
  },
  {
    topicId: 'rmi',
    title: 'Remote Method Invocation and CORBA',
    description: 'Follow the shared contract, registry, stub, servant, parameter transfer and remote failure model.',
    steps: [
      {
        id: 'contract', title: '1. The remote interface is the contract', source: 'ds2026_rmi(1).pdf · Remote interfaces',
        paragraphs: [
          'The remote interface is available to client and server. The server implementation implements it; the client programs against it without receiving the implementation object itself.',
          'Remote operations declare RemoteException because networking and remote processes introduce failures that local method calls do not have.'
        ],
        check: check('Why does the client need the remote interface?', ['To compile against the shared operation contract', 'To contain the servant state', 'To start the server JVM'], 0, 'Both sides share the type contract while the implementation stays on the server.')
      },
      {
        id: 'roles', title: '2. Registry, stub and servant', source: 'ds2026_rmi(1).pdf · Constituents of RMI',
        paragraphs: [
          'The server exports a remote object and binds its reference under a name. The registry maps that name to the remote reference.',
          'The client looks up the name and receives a stub-like proxy. Calls on it are marshalled and dispatched to the servant, the actual server-side implementation.'
        ],
        formula: 'client → stub → network → RMI runtime → servant',
        check: check('Where is the servant located?', ['On the server', 'Inside the client interface', 'In the XML document'], 0, 'The servant is the object that executes the remote operation on the server.')
      },
      {
        id: 'parameters', title: '3. Values and remote references', source: 'ds2026_rmi(1).pdf · Parameter passing',
        paragraphs: [
          'Serializable ordinary objects are transferred by value: the receiver obtains a serialized copy. Later changes to one copy do not automatically update the other.',
          'Exported remote objects are transferred as remote references. Invoking such a reference causes another remote call instead of copying the servant.'
        ],
        check: check('What happens to a serializable non-remote argument?', ['It is copied by serialization', 'Its memory address is shared', 'It automatically becomes a servant'], 0, 'Ordinary serializable data crosses the boundary by value.')
      },
      {
        id: 'transparency', title: '4. Useful transparency with limits', source: 'ds2026_rmi(1).pdf · Summary',
        paragraphs: [
          'RMI makes remote calls resemble local method calls and handles marshalling, dispatch and returned values.',
          'The resemblance must not hide semantic differences: calls are slower, can fail independently, may execute partially and should be designed with coarser-grained operations.'
        ],
        check: check('Why should remote calls usually be coarse-grained?', ['Each call has network and middleware overhead', 'Remote methods cannot take arguments', 'Java forbids small methods'], 0, 'Many tiny remote calls amplify latency and failure exposure.')
      },
      {
        id: 'corba', title: '5. CORBA broadens interoperability', source: 'ds2026_rmi(1).pdf · Middleware comparison',
        paragraphs: [
          'CORBA uses an implementation-neutral interface definition and an object request broker to connect clients and servants across languages and platforms.',
          'The conceptual roles resemble RMI: shared interface, client proxy, broker, server adapter and servant. RMI is more tightly integrated with Java.'
        ],
        check: check('What is the main purpose of an interface definition language?', ['Define a language-neutral service contract', 'Store database rows', 'Synchronize physical clocks'], 0, 'An IDL lets different language bindings agree on operations and types.')
      }
    ]
  },
  {
    topicId: 'serialization',
    title: 'Java object serialization',
    description: 'Understand eligible state, object streams, graphs, identity and compatibility.',
    steps: [
      {
        id: 'purpose', title: '1. From object state to bytes', source: 'ds2026_serial(1).pdf · Serialization',
        paragraphs: [
          'Serialization converts object state into a transferable or persistent byte representation. Deserialization reconstructs an object graph from that representation.',
          'A class opts into default Java serialization by implementing Serializable, which is a marker interface.'
        ],
        check: check('What is Serializable used for?', ['Mark classes whose instances may be serialized', 'Open a network port', 'Define a database transaction'], 0, 'The marker tells object streams that instances are eligible for serialization.')
      },
      {
        id: 'fields', title: '2. Which fields belong to the stream?', source: 'ds2026_serial(1).pdf · Excluded attributes',
        paragraphs: [
          'Default serialization records non-static, non-transient instance state. Private fields are included because visibility is unrelated to persistence.',
          'Static fields belong to the class rather than an instance. transient explicitly marks instance data that should not be serialized.'
        ],
        check: check('Which modifier explicitly excludes an instance field?', ['transient', 'private', 'final'], 0, 'transient marks state that default serialization must skip.')
      },
      {
        id: 'streams', title: '3. Object streams preserve structure', source: 'ds2026_serial(1).pdf · ObjectInputStream and ObjectOutputStream',
        paragraphs: [
          'ObjectOutputStream writes objects to an underlying stream; ObjectInputStream reads them back. Both sides must agree on the order and expected types of transferred values.',
          'Streams should be closed reliably, and untrusted serialized data is dangerous because reconstruction can execute class-specific behavior.'
        ],
        check: check('What does ObjectOutputStream wrap?', ['Another output stream', 'Only an SQL connection', 'A servlet context'], 0, 'Object serialization is layered over a byte destination such as a file or socket stream.')
      },
      {
        id: 'graph', title: '4. References create an object graph', source: 'ds2026_serial(1).pdf · Object references',
        paragraphs: [
          'When a serialized object references another serializable object, that referenced state is normally included too. The process follows the reachable object graph.',
          'The stream tracks handles so shared references remain shared and cycles do not cause infinite recursion. Every reachable object must be serializable unless its reference is transient.'
        ],
        check: check('Why must serialization track objects already written?', ['To preserve identity and handle cycles', 'To establish TCP', 'To validate an XML schema'], 0, 'Repeated references should point to one reconstructed object and cycles must terminate.')
      }
    ]
  },
  {
    topicId: 'xml',
    title: 'XML, namespaces, DTD and XML Schema',
    description: 'Move from syntax and document trees to validation and namespace-safe vocabularies.',
    steps: [
      {
        id: 'structure', title: '1. XML describes structured information', source: 'ds2026_xml.pdf · Introduction to XML',
        paragraphs: [
          'XML uses elements, attributes and character data to encode domain-specific structure. Unlike HTML, its element vocabulary is defined by the application.',
          'Exactly one document element contains the logical tree. Start and end tags must nest correctly and attribute values must be quoted.'
        ],
        check: check('What does an XML application define for itself?', ['Its domain-specific element vocabulary', 'A fixed browser-only tag set', 'The TCP retransmission rules'], 0, 'XML supplies syntax for defining structured vocabularies.')
      },
      {
        id: 'correctness', title: '2. Well-formedness and validity', source: 'ds2026_xml.pdf · XML correctness',
        paragraphs: [
          'A well-formed document obeys XML syntax: one root, correctly nested tags, valid names and quoted attributes.',
          'A valid document is additionally well-formed and conforms to a declared DTD or XML Schema. Parsing is possible without validation, so the concepts must remain separate.'
        ],
        check: check('A document obeys XML syntax but violates its schema. What is it?', ['Well-formed but invalid', 'Valid but malformed', 'Automatically valid'], 0, 'Validity adds schema conformance on top of well-formed syntax.')
      },
      {
        id: 'dtd', title: '3. DTD declares a document grammar', source: 'ds2026_xml.pdf · DTD',
        paragraphs: [
          'A DTD declares allowed elements, content models, occurrence operators and attributes. Sequence uses commas, alternatives use vertical bars and ?, * and + express cardinalities.',
          'DTD is compact but has limited data typing, is not itself XML syntax and has weak namespace support.'
        ],
        formula: '? = zero or one   ·   * = zero or more   ·   + = one or more',
        check: check('Which DTD operator means “one or more”?', ['+', '*', '?'], 0, 'The plus operator requires at least one occurrence.')
      },
      {
        id: 'schema', title: '4. XML Schema adds typed validation', source: 'ds2026_xml.pdf · XML Schema',
        paragraphs: [
          'XML Schema documents are XML and support built-in and custom data types, numeric or textual restrictions, complex structures and namespaces.',
          'Simple types contain text values; complex types contain attributes or child elements. Cardinality is expressed with minOccurs and maxOccurs.'
        ],
        check: check('What is a major advantage of XML Schema over DTD?', ['Rich data types and namespace support', 'It removes the need for XML syntax', 'It only validates HTML'], 0, 'XML Schema can precisely constrain values and namespace-aware structures.')
      },
      {
        id: 'namespaces', title: '5. Namespaces prevent name collisions', source: 'xml.pdf · XML namespaces',
        paragraphs: [
          'A namespace URI plus a local name uniquely identifies an element or attribute. Prefixes are replaceable abbreviations; applications compare namespace URIs and local names, not the chosen prefix text.',
          'A default namespace applies to unprefixed elements, but not to unprefixed attributes. Namespace declarations are inherited by descendant elements unless redefined.'
        ],
        check: check('Does a default namespace automatically apply to unprefixed attributes?', ['No', 'Yes, always', 'Only in a DTD'], 0, 'Unprefixed attributes are a special case and do not inherit the default namespace.')
      }
    ]
  },
  {
    topicId: 'web',
    title: 'HTTP web applications and servlets',
    description: 'Trace requests, parameters, servlet lifecycle, response creation and session state.',
    steps: [
      {
        id: 'http', title: '1. HTTP is request and response', source: 'ds2026_web(1).pdf · Web applications',
        paragraphs: [
          'A client sends an HTTP request with method, target, headers and optionally a body. The server answers with a status, headers and representation.',
          'GET parameters commonly appear in the query string; form data can also be sent in a POST body. The request method has semantic meaning and should be chosen accordingly.'
        ],
        check: check('Where are GET form parameters commonly encoded?', ['In the request URI query string', 'In a Java object reference', 'In the server clock'], 0, 'GET uses URI parameters for submitted values.')
      },
      {
        id: 'servlet', title: '2. A servlet handles requests in a container', source: 'ds2026_web(1).pdf · Servlets',
        paragraphs: [
          'A servlet is a Java server component managed by a servlet container. The container maps requests, creates request and response objects and invokes the servlet.',
          'The servlet reads parameters and headers from HttpServletRequest and writes status, headers and content through HttpServletResponse.'
        ],
        check: check('Who invokes a servlet for a matching request?', ['The servlet container', 'The browser JVM directly', 'The database driver'], 0, 'The container owns request dispatch and servlet management.')
      },
      {
        id: 'lifecycle', title: '3. Lifecycle and concurrency', source: 'ds2026_web(1).pdf · Servlet lifecycle',
        paragraphs: [
          'The container initializes a servlet, calls its service logic for requests and eventually destroys it. Usually one servlet instance serves many requests.',
          'Concurrent request threads can enter that instance, so mutable instance fields are unsafe for request-specific data unless synchronization and sharing are intentional.'
        ],
        check: check('Why should request data usually stay out of servlet instance fields?', ['Multiple request threads may share the servlet', 'Servlets cannot hold Java values', 'HTTP has no headers'], 0, 'Shared mutable fields can mix data from concurrent requests.')
      },
      {
        id: 'state', title: '4. Sessions and cookies add continuity', source: 'ds2026_web(1).pdf · Session tracking',
        paragraphs: [
          'HTTP is stateless at the protocol level. Cookies let a server store a small identifier at the client; a session maps that identifier to server-side state.',
          'If cookies are unavailable, URL rewriting can carry the session identifier. Session, request and application scopes have different lifetimes and sharing rules.'
        ],
        check: check('Where is normal session data stored?', ['On the server, associated with a session ID', 'Entirely in the TCP header', 'Inside the servlet class file'], 0, 'The client typically carries an identifier while the server owns the session object.')
      }
    ]
  },
  {
    topicId: 'jsp',
    title: 'JavaServer Pages as the view layer',
    description: 'Understand JSP translation, dynamic tags, implicit objects, scopes and JavaBeans.',
    steps: [
      {
        id: 'purpose', title: '1. JSP starts from the HTML view', source: 'ds2026_jsp(1).pdf · JSP idea',
        paragraphs: [
          'A servlet is convenient for Java control logic but awkward for writing large HTML fragments. JSP starts with the static document and adds dynamic elements where needed.',
          'This makes JSP suitable as a presentation layer while servlets or controllers prepare the data.'
        ],
        check: check('What is JSP primarily convenient for?', ['Building dynamic HTML views', 'Implementing TCP reliability', 'Replacing the database'], 0, 'JSP keeps view markup central and inserts dynamic values into it.')
      },
      {
        id: 'translation', title: '2. JSP becomes a servlet', source: 'ds2026_jsp(1).pdf · Translation and lifecycle',
        paragraphs: [
          'The container translates a JSP page into servlet source and compiles it. The generated servlet then handles requests through the normal servlet lifecycle.',
          'The first request may therefore pay translation and compilation cost; later requests reuse the compiled servlet until the JSP changes.'
        ],
        check: check('What executes a JSP request after translation?', ['A generated servlet', 'The XML parser alone', 'A JMS consumer'], 0, 'JSP is a source-level view technology compiled into a servlet.')
      },
      {
        id: 'elements', title: '3. Directives, actions and expressions', source: 'ds2026_jsp(1).pdf · JSP elements',
        paragraphs: [
          'Directives configure page translation, declarations add members and expressions produce response values. Scriptlets embed Java statements, though modern designs prefer expression language and tag libraries.',
          'Standard actions can include resources or work with JavaBeans, keeping common behavior declarative.'
        ],
        check: check('Which JSP construct directly produces a value in the response?', ['An expression', 'A TCP accept call', 'A DTD entity declaration'], 0, 'A JSP expression evaluates a value and writes it into the generated output.')
      },
      {
        id: 'scope', title: '4. Data lives in explicit scopes', source: 'ds2026_jsp(1).pdf · Implicit objects and beans',
        paragraphs: [
          'JSP exposes request, response, session, application and output objects. Attributes can live in page, request, session or application scope.',
          'Request scope is appropriate for one rendering, session scope for one user conversation and application scope for shared application-wide state.'
        ],
        check: check('Which scope is best for data used only by the current response?', ['Request scope', 'Application scope', 'Global static state'], 0, 'Request attributes end with the current request and avoid unnecessary sharing.')
      }
    ]
  },
  {
    topicId: 'webservices',
    title: 'SOAP web services and contracts',
    description: 'Connect service-oriented architecture, SOAP messages, WSDL and discovery.',
    steps: [
      {
        id: 'soa', title: '1. Services expose interoperable capabilities', source: 'webservices.pdf · Web services and SOA',
        paragraphs: [
          'A web service exposes operations through standardized network formats so heterogeneous systems can cooperate.',
          'Service-oriented designs emphasize explicit contracts and loose coupling between providers and consumers.'
        ],
        check: check('What enables heterogeneous service participants to cooperate?', ['A standardized external contract', 'Shared process memory', 'Identical source code'], 0, 'The contract defines exchange formats independently of internal implementation.')
      },
      {
        id: 'soap', title: '2. SOAP wraps structured messages', source: 'webservices.pdf · SOAP',
        paragraphs: [
          'A SOAP message is an XML envelope. Its optional header carries cross-cutting metadata; its body carries application content or a fault.',
          'SOAP can use different transports, although HTTP is common. The envelope structure is distinct from HTTP status and headers.'
        ],
        check: check('Where is the application payload normally placed in SOAP?', ['The SOAP body', 'The WSDL service name', 'The TCP port number'], 0, 'The body carries operation data while headers carry optional processing metadata.')
      },
      {
        id: 'wsdl', title: '3. WSDL describes the contract', source: 'webservices.pdf · WSDL',
        paragraphs: [
          'WSDL describes types, messages, operations, bindings and service endpoints. Abstract operation descriptions are separated from concrete protocol and location details.',
          'Tools can generate client proxies and server skeletons from this machine-readable description.'
        ],
        check: check('What does a WSDL binding add?', ['Concrete protocol and message-format details', 'The database contents', 'A physical clock correction'], 0, 'Bindings connect abstract operations to a concrete exchange protocol.')
      },
      {
        id: 'discovery', title: '4. Publication and discovery', source: 'webservices.pdf · UDDI and service discovery',
        paragraphs: [
          'A registry can publish provider information and service descriptions so consumers can discover a suitable endpoint.',
          'The conceptual cycle is publish, find and bind. In many modern deployments configuration or platform service discovery performs the registry role.'
        ],
        formula: 'provider publishes → consumer finds → consumer binds',
        check: check('What is the consumer trying to obtain during discovery?', ['A suitable service description and endpoint', 'The server heap memory', 'A local servlet instance'], 0, 'Discovery connects a requested capability to a callable service location.')
      }
    ]
  },
  {
    topicId: 'rest',
    title: 'RESTful resource-oriented services',
    description: 'Reason about resources, representations, HTTP methods, status codes and JAX-RS mappings.',
    steps: [
      {
        id: 'resource', title: '1. Resources have identifiers', source: 'ds2026_REST.pdf · REST resources',
        paragraphs: [
          'REST models application concepts as resources identified by URIs. Clients exchange representations of resource state rather than obtaining server objects.',
          'A representation may be JSON, XML or another media type; content negotiation selects a form both sides understand.'
        ],
        check: check('What does a REST URI identify?', ['A resource', 'A Java thread', 'A physical clock tick'], 0, 'The URI names the conceptual resource addressed by the request.')
      },
      {
        id: 'methods', title: '2. HTTP methods carry semantics', source: 'ds2026_REST.pdf · HTTP operations',
        paragraphs: [
          'GET retrieves, POST commonly creates or processes, PUT replaces or creates at a known URI and DELETE removes. Safe methods should not change resource state.',
          'Idempotent methods have the same intended effect when repeated. GET, PUT and DELETE are idempotent in their defined semantics; POST generally is not.'
        ],
        check: check('Which method is both safe and idempotent?', ['GET', 'POST', 'PATCH'], 0, 'GET is intended solely for retrieval and repeating it has the same intended effect.')
      },
      {
        id: 'responses', title: '3. Status codes communicate outcomes', source: 'ds2026_REST.pdf · Responses',
        paragraphs: [
          '2xx reports success, 3xx redirection, 4xx a client-side problem and 5xx a server-side failure. The precise code should express the outcome rather than returning 200 for every case.',
          'Examples include 201 Created with a Location header, 204 No Content, 400 Bad Request, 404 Not Found and 500 Internal Server Error.'
        ],
        check: check('Which status best fits a newly created resource?', ['201 Created', '404 Not Found', '500 Internal Server Error'], 0, '201 explicitly signals creation and can point to the new resource.')
      },
      {
        id: 'jaxrs', title: '4. JAX-RS maps HTTP to Java', source: 'ds2026_REST.pdf · JAX-RS',
        paragraphs: [
          '@Path identifies resource paths. @GET, @POST, @PUT and @DELETE select methods; @Produces and @Consumes describe media types.',
          'Path, query and other request values are injected with annotations such as @PathParam and @QueryParam. The runtime serializes returned entities into representations.'
        ],
        check: check('Which annotation reads a value from a URI path segment?', ['@PathParam', '@Produces', '@Entity'], 0, '@PathParam binds a named path-template value to a Java parameter.')
      }
    ]
  },
  {
    topicId: 'jdbc',
    title: 'JDBC database access',
    description: 'Trace drivers, connections, prepared statements, result sets and transactions.',
    steps: [
      {
        id: 'architecture', title: '1. JDBC standardizes driver access', source: 'ds2026_jdbc.pdf · JDBC architecture',
        paragraphs: [
          'JDBC is the Java API for relational database access. A database-specific driver implements the standard interfaces and translates calls to the DBMS protocol.',
          'A connection represents a database session and is the parent context for statements and transactions.'
        ],
        check: check('What is the driver responsible for?', ['Implementing JDBC for a particular DBMS', 'Rendering JSP pages', 'Ordering Lamport events'], 0, 'The driver bridges the portable API and the database-specific protocol.')
      },
      {
        id: 'statements', title: '2. Execute SQL through statements', source: 'ds2026_jdbc.pdf · Statement execution',
        paragraphs: [
          'A Statement executes SQL text. executeQuery returns a ResultSet for SELECT; executeUpdate returns an affected-row count for INSERT, UPDATE or DELETE.',
          'A ResultSet cursor starts before the first row. Calling next moves it forward and reports whether a row is available.'
        ],
        check: check('What must happen before reading the first ResultSet row?', ['Call next()', 'Commit the connection', 'Create a servlet'], 0, 'The cursor initially points before the first result row.')
      },
      {
        id: 'prepared', title: '3. PreparedStatement binds values safely', source: 'ds2026_jdbc.pdf · Prepared statements',
        paragraphs: [
          'PreparedStatement separates SQL structure from parameter values using placeholders. Typed setter methods bind the values before execution.',
          'This supports reuse and prevents user input from being interpreted as SQL syntax, which is central to avoiding SQL injection.'
        ],
        check: check('Why are bound parameters safer than string concatenation?', ['Values stay separate from SQL structure', 'They disable database errors', 'They make transactions unnecessary'], 0, 'The DBMS receives values as data rather than executable query fragments.')
      },
      {
        id: 'transactions', title: '4. Transactions belong to a connection', source: 'ds2026_jdbc.pdf · Transactions',
        paragraphs: [
          'JDBC uses auto-commit by default, so each statement is committed individually. To group statements atomically, disable auto-commit and call commit only after all succeed.',
          'If a step fails, rollback restores the transaction boundary. try-with-resources reliably closes result sets, statements and connections.'
        ],
        formula: 'setAutoCommit(false) → statements → commit() / rollback()',
        check: check('What should happen after one statement in a multi-step transaction fails?', ['Rollback the transaction', 'Enable auto-commit and ignore it', 'Read the same ResultSet forever'], 0, 'Rollback prevents a partially applied logical operation.')
      }
    ]
  },
  {
    topicId: 'jpa',
    title: 'Object-relational persistence with JPA',
    description: 'Understand entities, identity, persistence contexts, lifecycle and relationships.',
    steps: [
      {
        id: 'entity', title: '1. Entities map domain objects', source: 'ds2026_jpa.pdf · Entities',
        paragraphs: [
          'An entity is a persistent class with database identity. @Entity marks the class and @Id marks its primary-key property.',
          'Fields or properties map to columns by convention or explicit annotations. JPA hides repetitive row conversion while SQL and schema constraints still matter.'
        ],
        check: check('Which annotation identifies the primary-key attribute?', ['@Id', '@Path', '@TransientServlet'], 0, '@Id defines the persistent identity field or property.')
      },
      {
        id: 'context', title: '2. The persistence context tracks identity', source: 'ds2026_jpa.pdf · EntityManager',
        paragraphs: [
          'EntityManager operates on a persistence context. Within one context, a database identity corresponds to one managed Java entity instance.',
          'Changes to managed entities are detected and flushed to the database at appropriate transaction boundaries.'
        ],
        check: check('What tracks changes to managed entities?', ['The persistence context', 'The HTTP cookie', 'The RMI registry'], 0, 'Managed state and identity are responsibilities of the persistence context.')
      },
      {
        id: 'lifecycle', title: '3. Entity state changes matter', source: 'ds2026_jpa.pdf · Persistence operations',
        paragraphs: [
          'A new entity is transient until persist makes it managed. A managed entity becomes detached when its context ends or it is explicitly detached.',
          'remove schedules a managed entity for deletion. merge copies detached state into a managed instance and returns that managed instance.'
        ],
        check: check('What does merge return?', ['A managed instance containing the merged state', 'Always the same detached object', 'A JDBC ResultSet'], 0, 'The caller should use the managed instance returned by merge.')
      },
      {
        id: 'relationships', title: '4. Relationships need ownership and cardinality', source: 'ds2026_jpa.pdf · Relationships between entities',
        paragraphs: [
          '@OneToOne, @OneToMany, @ManyToOne and @ManyToMany describe association cardinality. The owning side controls the database relationship mapping.',
          'Fetch strategy, cascading and bidirectional consistency must be chosen deliberately because object traversal can trigger database work.'
        ],
        check: check('What does the owning side control?', ['The relationship update in the database mapping', 'The HTTP response status', 'The physical network address'], 0, 'JPA uses the owning side to determine which association state is written.')
      }
    ]
  },
  {
    topicId: 'jms',
    title: 'Asynchronous messaging with JMS',
    description: 'Connect providers, destinations, queues, topics, consumers and loose coupling.',
    steps: [
      {
        id: 'mom', title: '1. Message-oriented middleware decouples', source: 'ds2026_jms(1).pdf · Message-oriented middleware',
        paragraphs: [
          'A sender gives a message to a provider rather than directly invoking the receiver. The broker stores, routes and delivers messages through destinations.',
          'This separates participants in location and, with persistent asynchronous delivery, in time. They still share a message contract.'
        ],
        check: check('What does the producer address in JMS?', ['A destination', 'The consumer object memory address', 'A servlet instance'], 0, 'The provider routes messages sent to queues or topics.')
      },
      {
        id: 'queue', title: '2. Queues implement point-to-point delivery', source: 'ds2026_jms(1).pdf · Point-to-point',
        paragraphs: [
          'A producer sends to a queue and each message is consumed by one receiver. Multiple consumers can compete, allowing work to be distributed.',
          'A queue can retain messages until a consumer is available, depending on provider and delivery settings.'
        ],
        check: check('How many consumers process one queue message?', ['One', 'Every subscriber', 'None by definition'], 0, 'Point-to-point delivery assigns each message to a single consumer.')
      },
      {
        id: 'topic', title: '3. Topics implement publish/subscribe', source: 'ds2026_jms(1).pdf · Publish/subscribe',
        paragraphs: [
          'A producer publishes to a topic and each eligible subscription receives its own delivery. This is useful for events that several independent consumers need.',
          'A non-durable subscriber normally receives messages only while active. A durable subscription lets the provider retain messages during disconnection.'
        ],
        check: check('What does a durable subscription add?', ['Delivery continuity while the subscriber is offline', 'Exactly one consumer for the topic', 'Synchronous method return values'], 0, 'The provider retains eligible publications for the durable subscriber.')
      },
      {
        id: 'api', title: '4. Connection, session and message flow', source: 'ds2026_jms(1).pdf · JMS programming model',
        paragraphs: [
          'A connection represents access to the JMS provider. A session creates messages, producers and consumers and defines transaction or acknowledgment behavior.',
          'A producer sends Message objects to a destination. A consumer receives synchronously or through a listener; message-driven beans integrate asynchronous consumption into Jakarta EE.'
        ],
        check: check('Which object creates producers and consumers?', ['A JMS session', 'A ResultSet', 'A vector clock'], 0, 'The session is the working context for messaging objects and acknowledgment.')
      },
      {
        id: 'delivery', title: '5. Delivery guarantees require choices', source: 'ds2026_jms(1).pdf · Reliability and conclusions',
        paragraphs: [
          'Acknowledgment tells the provider when delivery can be considered handled. Transactions group sends and receives; persistent delivery protects messages against provider restart at additional cost.',
          'Redelivery is possible after failures, so consumers should be idempotent when practical and should treat message processing and database updates as one reliability problem.'
        ],
        check: check('Why should a consumer tolerate duplicate delivery?', ['Failures can cause a message to be redelivered', 'A queue always broadcasts', 'JMS has no destinations'], 0, 'A missing acknowledgment can make the provider deliver the same message again.')
      }
    ]
  }
]);
