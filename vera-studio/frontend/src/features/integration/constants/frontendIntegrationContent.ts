const frontendIntegrationContent = {
  title: '2 - Client Integration',
  description: 'Connect your frontend and launch your first video room.',

  middlePanel: {
    title: 'Client setup',

    room: {
      title: 'Embedded Room',
      description: 'Launch a video room instantly.',

      content: {
        title: 'Vera Room Component',
        description: 'Use the <vera-room> element to embed a complete video experience.',
      },
    },

    client: {
      title: 'Video Client',
      description: 'Use only if you need full control.',

      content: {
        title: 'Video Client SDK',
        description: 'Build a custom experience using the video client SDK.',

        title2: 'Getting started',
        description2: 'The SDK handles all API calls for you with a fully typed interface.',
      },
    },
  },
} as const;

export default frontendIntegrationContent;
