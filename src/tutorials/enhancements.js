export const TUTORIAL_ENHANCEMENTS = Object.freeze({
  overview: {
    definition: {
      check: {
        type: 'boolean',
        prompt: 'True or false: processes in a distributed system require shared physical memory.',
        options: ['True', 'False'],
        answer: 1,
        explanation: 'False. Autonomous computers coordinate through messages; shared physical memory is not assumed.'
      },
      sections: [
        { title: 'Why does this matter?', content: 'Local assumptions break at a network boundary. Delay, partial failure and independent execution must become explicit parts of the design.' },
        { title: 'Typical exam mistake', content: 'A multi-process program on one machine is not automatically the intended distributed-system model. State the autonomous computers and message-based communication.' }
      ],
      callouts: [{ type: 'remember', text: 'Distribution means independent components and partial knowledge.' }]
    }
  },
  time: {
    cristian: {
      diagram: {
        title: 'Cristian request and reply',
        nodes: [
          { id: 'client-send', label: 'Client T₀', explanation: 'The client records its local send time.' },
          { id: 'server', label: 'UTC server', explanation: 'The server reads UTC and accounts for processing interval I.' },
          { id: 'client-receive', label: 'Client T₁', explanation: 'The client records arrival and estimates half the network round trip.' }
        ],
        edges: [['client-send', 'server'], ['server', 'client-receive']],
        flowLabel: 'Animate request'
      },
      sections: [
        { title: 'Why half?', content: 'After subtracting server processing time I, the measured duration contains both network directions. Dividing by two assumes that both directions take roughly the same time.' }
      ],
      callouts: [{ type: 'mistake', text: 'Do not divide the complete interval by two before subtracting server processing time I.' }]
    }
  },
  sockets: {
    endpoint: {
      diagram: {
        title: 'Addressing a socket endpoint',
        nodes: [
          { id: 'client', label: 'Client socket', explanation: 'Uses a local endpoint and targets the server endpoint.' },
          { id: 'network', label: 'IP network', explanation: 'Routes packets to the destination IP address.' },
          { id: 'server', label: 'Server port 8080', explanation: 'The transport layer delivers data to the listening application endpoint.' }
        ],
        edges: [['client', 'network'], ['network', 'server']],
        flowLabel: 'Animate packet'
      },
      callouts: [{ type: 'remember', text: 'IP selects the host; the port selects the application endpoint.' }]
    },
    lifecycle: {
      code: {
        language: 'java',
        source: 'try (ServerSocket server = new ServerSocket(port);\n     Socket client = server.accept()) {\n    InputStream input = client.getInputStream();\n}',
        annotations: {
          ServerSocket: { definition: 'A listening TCP endpoint on the server.', purpose: 'Binds a local port and accepts incoming connections.', related: 'java.net.ServerSocket' },
          port: { definition: 'The local application port.', purpose: 'Selects which endpoint clients connect to.', related: 'TCP port' },
          accept: { definition: 'Waits for an incoming connection.', purpose: 'Returns a new Socket dedicated to one client.', related: 'blocking I/O' },
          Socket: { definition: 'One established TCP connection.', purpose: 'Provides the streams used for the client conversation.', related: 'java.net.Socket' },
          getInputStream: { definition: 'Obtains the connection byte input.', purpose: 'Reads ordered bytes received through TCP.', related: 'java.io.InputStream' }
        }
      },
      check: {
        type: 'order',
        prompt: 'Put the TCP server steps in the correct order.',
        items: ['Exchange bytes', 'Accept a client', 'Create the listening socket', 'Close the connection'],
        answer: ['Create the listening socket', 'Accept a client', 'Exchange bytes', 'Close the connection'],
        explanation: 'The listening endpoint must exist before accept; the returned connection socket is then used for the byte exchange.'
      },
      sections: [
        { title: 'How does it work?', content: 'The ServerSocket stays responsible for accepting. Every successful accept creates a separate Socket for one conversation.' },
        { title: 'Practical example', content: 'A threaded server hands each accepted Socket to a worker while the main loop immediately returns to accept.' }
      ],
      callouts: [{ type: 'exam', text: 'Be able to distinguish the listening ServerSocket from the connected Socket returned by accept().' }]
    }
  },
  rmi: {
    roles: {
      diagram: {
        title: 'Remote invocation path',
        nodes: [
          { id: 'client', label: 'Client', explanation: 'Calls the shared remote interface through a proxy.' },
          { id: 'stub', label: 'Stub', explanation: 'Marshals the operation and arguments.' },
          { id: 'runtime', label: 'RMI runtime', explanation: 'Transports and dispatches the invocation.' },
          { id: 'servant', label: 'Servant', explanation: 'Executes the implementation on the server.' }
        ],
        edges: [['client', 'stub'], ['stub', 'runtime'], ['runtime', 'servant']],
        flowLabel: 'Animate call'
      },
      callouts: [{ type: 'mistake', text: 'The remote interface exists on both sides; the servant implementation remains on the server.' }]
    }
  },
  rest: {
    methods: {
      code: {
        language: 'http',
        source: 'PUT /orders/42 HTTP/1.1\nHost: api.example.test\nContent-Type: application/json\n\n{"status":"paid"}',
        annotations: {
          PUT: { definition: 'An HTTP method with idempotent semantics.', purpose: 'Creates or replaces the state at the target resource URI.', related: 'HTTP method' },
          '/orders/42': { definition: 'The request target.', purpose: 'Identifies the order resource.', related: 'resource URI' },
          'Content-Type': { definition: 'A representation metadata header.', purpose: 'Declares the media type of the request body.', related: 'application/json' }
        }
      },
      callouts: [{ type: 'exam', text: 'Explain method semantics separately from the implementation that handles the request.' }]
    }
  },
  jms: {
    queue: {
      diagram: {
        title: 'Point-to-point delivery',
        nodes: [
          { id: 'producer', label: 'Producer', explanation: 'Creates and sends a message without calling a consumer directly.' },
          { id: 'queue', label: 'Queue', explanation: 'The provider stores the message until it can be delivered.' },
          { id: 'consumer', label: 'One consumer', explanation: 'One competing consumer receives the message.' }
        ],
        edges: [['producer', 'queue'], ['queue', 'consumer']],
        flowLabel: 'Animate message'
      },
      callouts: [{ type: 'remember', text: 'One queue message goes to one consumer; one topic publication may reach multiple subscribers.' }]
    }
  }
});

export function enhanceTutorials(tutorials) {
  return tutorials.map(tutorial => ({
    ...tutorial,
    steps: tutorial.steps.map(step => {
      const enhancement = TUTORIAL_ENHANCEMENTS[tutorial.topicId]?.[step.id] || {};
      return {
        ...step,
        ...enhancement,
        check: enhancement.check || step.check
      };
    })
  }));
}
