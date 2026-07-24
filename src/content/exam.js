function freezeTask(task) {
  return Object.freeze({
    ...task,
    options: task.options ? Object.freeze([...task.options]) : undefined,
    accepted: task.accepted ? Object.freeze([...task.accepted]) : undefined
  });
}

export const EXAM_DURATION_MINUTES = 90;

export const EXAM_TASKS = Object.freeze([
  {
    id: 'theory-transparency',
    section: 'Theory',
    points: 2,
    type: 'choice',
    prompt: 'A replicated service moves one copy to another server. Clients continue using it without noticing the new location. Which transparency is demonstrated?',
    options: ['Location transparency', 'Failure transparency', 'Concurrency transparency'],
    answer: 0,
    explanation: 'Location transparency hides where a resource is physically located and allows that location to change without changing client use.'
  },
  {
    id: 'theory-logical-time',
    section: 'Theory',
    points: 2,
    type: 'choice',
    prompt: 'Lamport timestamps satisfy C(a) < C(b). What can be concluded from this alone?',
    options: ['Nothing about whether a happened before b', 'a definitely happened before b', 'a and b are concurrent'],
    answer: 0,
    explanation: 'The clock condition is one-way: a → b implies C(a) < C(b). The converse does not hold.'
  },
  {
    id: 'tcp-completion',
    section: 'Java TCP',
    points: 3,
    type: 'input',
    prompt: 'Complete the server-side call that blocks until a client connects.',
    code: 'ServerSocket server = new ServerSocket(6789);\nSocket connection = server.____();',
    placeholder: 'method name',
    accepted: ['accept', 'accept()'],
    answerLabel: 'accept()',
    explanation: 'ServerSocket.accept() waits for a connection and returns a new Socket for communication with that client.'
  },
  {
    id: 'tcp-analysis',
    section: 'Java TCP',
    points: 3,
    type: 'choice',
    prompt: 'What is the key meaning of the two socket variables in this server fragment?',
    code: 'ServerSocket listener = new ServerSocket(6789);\nSocket client = listener.accept();',
    options: [
      'listener accepts new clients; client represents one established connection',
      'Both variables represent the same network connection',
      'listener sends data while client can only receive data'
    ],
    answer: 0,
    explanation: 'The ServerSocket remains the listening endpoint. Each accepted connection is represented by a separate Socket.'
  },
  {
    id: 'udp-completion',
    section: 'Java UDP',
    points: 3,
    type: 'input',
    prompt: 'Complete the DatagramSocket operation used by the server to wait for a datagram.',
    code: 'byte[] buffer = new byte[1000];\nDatagramPacket request = new DatagramPacket(buffer, buffer.length);\naSocket.____(request);',
    placeholder: 'method name',
    accepted: ['receive', 'receive()'],
    answerLabel: 'receive',
    explanation: 'DatagramSocket.receive(packet) blocks until a datagram arrives and fills the supplied packet.'
  },
  {
    id: 'udp-analysis',
    section: 'Java UDP',
    points: 2,
    type: 'choice',
    prompt: 'A UDP client calls send(packet) successfully. Which statement remains correct?',
    options: [
      'The datagram can still be lost because UDP does not acknowledge delivery',
      'The receiver has acknowledged the datagram',
      'A persistent connection now exists between client and server'
    ],
    answer: 0,
    explanation: 'UDP is connectionless and does not acknowledge delivery. Reliability must be added by the application when required.'
  },
  {
    id: 'http-request-analysis',
    section: 'HTTP',
    points: 3,
    type: 'choice',
    prompt: 'What does this request ask the server to do?',
    code: 'GET /books/42 HTTP/1.1\nHost: example.test\nAccept: application/json',
    options: [
      'Return a JSON representation of resource /books/42',
      'Replace /books/42 with the JSON contained in the request',
      'Delete /books/42 and return an HTML page'
    ],
    answer: 0,
    explanation: 'GET retrieves a representation. The target is /books/42 and Accept expresses the desired response media type.'
  },
  {
    id: 'http-status-analysis',
    section: 'HTTP',
    points: 2,
    type: 'choice',
    prompt: 'A REST endpoint successfully creates a new resource. Which response is the most precise?',
    options: ['201 Created with a Location header', '200 OK with an Allow header', '404 Not Found with a Location header'],
    answer: 0,
    explanation: '201 Created communicates resource creation; Location can identify the newly created resource.'
  },
  {
    id: 'xml-sequence',
    section: 'XML + DTD',
    points: 4,
    type: 'choice',
    prompt: 'Is this XML valid against the given DTD?',
    code: '<!ELEMENT Auto (Bezeichnung, Motor, Kofferraum?)>\n<!ELEMENT Bezeichnung (#PCDATA)>\n<!ELEMENT Motor (#PCDATA)>\n<!ELEMENT Kofferraum (#PCDATA)>\n\n<Auto>\n  <Bezeichnung>Golf</Bezeichnung>\n  <Kofferraum>330</Kofferraum>\n  <Motor>75</Motor>\n</Auto>',
    options: ['No, the declared element sequence is violated', 'Yes, every declared element occurs', 'No, Kofferraum is mandatory'],
    answer: 0,
    explanation: 'A comma in a DTD content model defines order. Motor must occur before the optional Kofferraum.'
  },
  {
    id: 'xml-required-attribute',
    section: 'XML + DTD',
    points: 4,
    type: 'choice',
    prompt: 'Is this XML valid against the attribute declaration?',
    code: '<!ELEMENT Motor (#PCDATA)>\n<!ATTLIST Motor Treibstoff (Benzin | Diesel) #REQUIRED>\n\n<Motor>75</Motor>',
    options: ['No, the required Treibstoff attribute is missing', 'Yes, #PCDATA makes every attribute optional', 'No, Motor must be empty'],
    answer: 0,
    explanation: '#REQUIRED means every Motor element must contain Treibstoff, and its value must be Benzin or Diesel.'
  },
  {
    id: 'xml-wellformed-valid',
    section: 'XML + DTD',
    points: 2,
    type: 'choice',
    prompt: 'An XML document has exactly one root and correctly nested tags, but violates its DTD. How is it classified?',
    options: ['Well-formed but invalid', 'Valid but not well-formed', 'Neither well-formed nor readable'],
    answer: 0,
    explanation: 'Well-formedness concerns XML syntax. Validity additionally requires conformity to the specified DTD or schema.'
  },
  {
    id: 'rmi-completion',
    section: 'Code Completion',
    points: 3,
    type: 'input',
    prompt: 'Complete the declaration required for an RMI method that may fail during remote communication.',
    code: 'public interface Calculator extends Remote {\n  int add(int a, int b) ____ RemoteException;\n}',
    placeholder: 'Java keyword',
    accepted: ['throws'],
    answerLabel: 'throws',
    explanation: 'Methods in a Java RMI remote interface declare throws RemoteException because the invocation crosses a network boundary.'
  }
].map(freezeTask));

export function scoreExam(tasks, answers) {
  const results = tasks.map(task => {
    const value = answers[task.id];
    const correct = task.type === 'choice'
      ? Number(value) === task.answer
      : task.accepted.includes(String(value ?? '').trim().toLowerCase());
    return Object.freeze({ id: task.id, correct, earned: correct ? task.points : 0, possible: task.points });
  });
  return Object.freeze({
    earned: results.reduce((sum, result) => sum + result.earned, 0),
    possible: results.reduce((sum, result) => sum + result.possible, 0),
    results: Object.freeze(results)
  });
}
