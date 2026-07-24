const entry = (id, term, definition, details, related, topicId, aliases = []) => Object.freeze({
  id,
  term,
  definition,
  details: Object.freeze(details),
  related: Object.freeze(related),
  topicId,
  aliases: Object.freeze(aliases)
});

export const GLOSSARY = Object.freeze([
  entry('distributed-system', 'Distributed system', 'Autonomous computers that coordinate by exchanging messages.', ['No shared memory is assumed.', 'Components can fail independently.'], ['Middleware', 'TCP', 'Logical clock'], 'overview', ['distributed systems']),
  entry('middleware', 'Middleware', 'Reusable software between applications and the network or operating system.', ['Provides communication abstractions.', 'Often handles naming, serialization or transactions.'], ['RMI', 'JMS', 'Serialization'], 'organization'),
  entry('logical-clock', 'Logical clock', 'A counter or vector that represents causal order instead of physical time.', ['Lamport clocks preserve happened-before order.', 'Vector clocks can identify concurrency.'], ['Lamport clock', 'Vector clock', 'UTC'], 'time', ['logical clocks']),
  entry('lamport-clock', 'Lamport clock', 'A scalar logical timestamp advanced for local and message events.', ['If a happened before b, then L(a) < L(b).', 'The reverse implication does not hold.'], ['Logical clock', 'Vector clock'], 'time', ['Lamport clocks']),
  entry('vector-clock', 'Vector clock', 'A logical timestamp with one counter per participating process.', ['Component-wise comparison reveals causality.', 'Incomparable vectors indicate concurrent events.'], ['Logical clock', 'Lamport clock'], 'time', ['vector clocks']),
  entry('utc', 'UTC', 'The external civil-time reference used when clocks need real-world synchronization.', ['External synchronization compares a clock with UTC.'], ['Logical clock'], 'time'),
  entry('socket', 'Socket', 'A communication endpoint exposed through a programming API.', ['Identified through protocol, IP address and port.', 'Used with TCP or UDP.'], ['TCP', 'UDP', 'Port', 'IP address'], 'sockets', ['sockets']),
  entry('tcp', 'TCP', 'A connection-oriented transport protocol providing reliable, ordered bytes.', ['Retransmits lost data.', 'Does not preserve application message boundaries.'], ['Socket', 'UDP', 'Port', 'HTTP'], 'sockets'),
  entry('udp', 'UDP', 'A connectionless transport protocol for independent datagrams.', ['Preserves datagram boundaries.', 'Does not guarantee delivery or ordering.'], ['Socket', 'TCP', 'Port'], 'sockets'),
  entry('port', 'Port', 'A numeric identifier for an application endpoint on a host.', ['Works together with an IP address and transport protocol.'], ['Socket', 'TCP', 'UDP'], 'sockets', ['port number', 'ports']),
  entry('ip-address', 'IP address', 'A network-layer address identifying a host interface.', ['A port selects an application endpoint on that host.'], ['Port', 'Socket'], 'sockets', ['IP addresses']),
  entry('rmi', 'RMI', 'Java middleware for invoking methods on remote objects.', ['Uses a shared remote interface.', 'Arguments and results must cross a process boundary.'], ['Stub', 'Servant', 'Serialization', 'Registry'], 'rmi'),
  entry('stub', 'Stub', 'A client-side proxy that represents a remote object.', ['Marshals a call for transport to the remote runtime.'], ['RMI', 'Servant', 'Registry'], 'rmi'),
  entry('servant', 'Servant', 'The server-side object that executes a remote operation.', ['Implements the shared remote contract.'], ['RMI', 'Stub', 'Registry'], 'rmi'),
  entry('registry', 'Registry', 'A naming service that maps names to remote references.', ['Allows clients to look up a service during startup.'], ['RMI', 'Stub', 'Servant'], 'rmi'),
  entry('serialization', 'Serialization', 'Conversion of object state into a transferable or persistent representation.', ['Referenced serializable objects form an object graph.'], ['RMI', 'XML'], 'serialization'),
  entry('xml', 'XML', 'A text format for hierarchically structured documents.', ['A document must be well-formed before it can be validated.'], ['DTD', 'XML Schema', 'Namespace'], 'xml'),
  entry('dtd', 'DTD', 'A grammar that declares permitted XML elements, attributes and ordering.', ['Can validate document structure.', 'Has a limited type system.'], ['XML', 'XML Schema'], 'xml'),
  entry('xml-schema', 'XML Schema', 'An XML-based schema language with namespaces and rich data types.', ['Often abbreviated as XSD.'], ['XML', 'DTD', 'Namespace'], 'xml'),
  entry('namespace', 'Namespace', 'A URI-qualified naming mechanism that prevents XML name collisions.', ['Prefixes are aliases for namespace URIs.'], ['XML', 'XML Schema'], 'xml', ['namespaces']),
  entry('http', 'HTTP', 'A request-response application protocol used by the web.', ['Requests contain a method and target.', 'Responses contain a status code.'], ['REST', 'Servlet', 'TCP'], 'web'),
  entry('servlet', 'Servlet', 'A Java server component managed by a web container.', ['Handles requests through lifecycle and service methods.'], ['HTTP', 'JSP', 'Session'], 'web', ['servlets']),
  entry('session', 'Session', 'Server-associated state that links multiple requests from one client.', ['Usually referenced through a session identifier.'], ['HTTP', 'Servlet'], 'web', ['sessions']),
  entry('jsp', 'JSP', 'A server-side Java view template translated into a servlet.', ['Designed to generate dynamic response content.'], ['Servlet', 'HTTP'], 'jsp'),
  entry('soap', 'SOAP', 'An XML-based protocol for structured web-service messages.', ['Messages use an envelope and optional headers.'], ['WSDL', 'XML', 'HTTP'], 'webservices'),
  entry('wsdl', 'WSDL', 'A machine-readable description of a web-service contract.', ['Describes operations, messages and endpoints.'], ['SOAP', 'XML'], 'webservices'),
  entry('rest', 'REST', 'An architectural style centered on resources and uniform HTTP semantics.', ['Resources are identified by URIs.', 'Representations transfer resource state.'], ['HTTP', 'JAX-RS', 'TCP'], 'rest'),
  entry('jax-rs', 'JAX-RS', 'The Java API for mapping HTTP requests to resource classes and methods.', ['Uses annotations for paths, methods and media types.'], ['REST', 'HTTP'], 'rest'),
  entry('jdbc', 'JDBC', 'The standard Java API for relational database access.', ['Defines connections, statements and result sets.'], ['PreparedStatement', 'Transaction', 'JPA'], 'jdbc'),
  entry('prepared-statement', 'PreparedStatement', 'A precompiled SQL statement whose values are bound as parameters.', ['Separates SQL structure from input data.'], ['JDBC', 'Transaction'], 'jdbc', ['prepared statements']),
  entry('transaction', 'Transaction', 'A unit of work committed completely or rolled back.', ['In JDBC, transaction control belongs to a connection.'], ['JDBC', 'JPA'], 'jdbc', ['transactions']),
  entry('jpa', 'JPA', 'The Java persistence specification for mapping objects and relational data.', ['An EntityManager manages a persistence context.'], ['Entity', 'Persistence context', 'JDBC'], 'jpa'),
  entry('entity', 'Entity', 'A persistent domain object with an identity.', ['Its state can be managed by a persistence context.'], ['JPA', 'Persistence context'], 'jpa', ['entities']),
  entry('persistence-context', 'Persistence context', 'The set of entity instances currently tracked by an EntityManager.', ['Maintains one managed instance per persistent identity.'], ['JPA', 'Entity'], 'jpa'),
  entry('jms', 'JMS', 'The Java messaging API for communication through message providers.', ['Supports queues and publish/subscribe topics.'], ['Queue', 'Topic', 'Message broker'], 'jms'),
  entry('queue', 'Queue', 'A point-to-point destination where each message is consumed once.', ['Multiple consumers may compete for messages.'], ['JMS', 'Topic', 'Message broker'], 'jms', ['queues']),
  entry('topic', 'Topic', 'A publish/subscribe destination that distributes messages to subscribers.', ['Each eligible subscriber can receive a copy.'], ['JMS', 'Queue', 'Message broker'], 'jms', ['topics']),
  entry('message-broker', 'Message broker', 'Middleware that receives, stores and forwards messages.', ['Decouples producers from consumers in time and location.'], ['JMS', 'Queue', 'Topic'], 'jms', ['broker'])
]);

export const GLOSSARY_BY_ID = new Map(GLOSSARY.map(item => [item.id, item]));

export const GLOSSARY_MATCHES = Object.freeze(
  GLOSSARY.flatMap(item => [item.term, ...item.aliases].map(label => ({ label, entry: item })))
    .sort((a, b) => b.label.length - a.label.length)
);
