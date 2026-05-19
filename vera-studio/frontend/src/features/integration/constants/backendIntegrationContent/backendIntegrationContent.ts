const backendIntegrationContent = {
  title: '1 - Server Integration',
  description: 'Set up your backend to power video sessions.',

  middlePanel: {
    title: 'Server setup',

    createHandler: {
      title: 'Create Handler',
      description: 'Initialize the video handler.',

      content: {
        title: 'Authentication',
        description: 'Choose the authentication method to connect with the Vonage Video API.',
      },
    },

    expressIntegration: {
      title: 'Express',
      description: 'Mount the handler in your app.',

      content: {
        title: 'Getting Started',
        description: 'Add the video handler as a route in your Express app.',
      },
    },

    advancedUsage: {
      title: 'Advanced',
      description: 'Only if you need more control.',

      content: {
        title: 'Extend the handler',
        description: 'Use middleware or custom logic to extend the handler.',
        examples1: {
          title: 'Middleware',
        },
        examples2: {
          title: 'Context',
        },
      },
    },
  },
} as const;

export default backendIntegrationContent;
