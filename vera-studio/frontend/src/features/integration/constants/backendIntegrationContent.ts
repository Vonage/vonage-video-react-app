const backendIntegrationContent = {
  title: 'Server Integration',
  description: 'Set up the Vonage Video handler in your backend.',

  middlePanel: {
    title: 'Examples',

    createHandler: {
      title: 'Create Handler',
      description: 'Set up a basic handler.',

      content: {
        title: 'Authentication Method',
        description: 'Select the authentication method you want to use to see an example.',
      },
    },

    expressIntegration: {
      title: 'Express',
      description: 'Use the handler in your Express app.',

      content: {
        title: 'Getting Started',
        description:
          'You can add the Vonage Video handler to your Express app just like any other router.',
      },
    },

    advancedUsage: {
      title: 'Advanced',
      description: 'Customize the video experience.',

      content: {
        title: `Let's see some real-world patterns`,
        description: `You can use the video handler with any Node.js framework and customize it to fit your needs. Here are some examples of advanced patterns you can implement.`,

        examples1: {
          title: 'Middleware Decoration',
        },

        examples2: {
          title: 'Context and in-built tools',
        },
      },
    },
  },
} as const;

export default backendIntegrationContent;
