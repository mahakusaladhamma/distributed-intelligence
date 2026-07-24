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
    id: 'exam-mode',
    navTitle: 'Exam Mode',
    category: 'Exam',
    title: 'Exam Mode',
    subtitle: 'Theory, Java code, HTTP and XML/DTD',
    summary: 'Complete a mixed paper-style exam without immediate feedback, then review every answer with a model explanation.',
    kind: 'exam'
  }
].map(mode => Object.freeze({ ...mode })));
