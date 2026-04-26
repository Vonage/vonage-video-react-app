const buildContent = {
  title: '3 - Design and Build',
  description: 'Customize the look of your room and bundle it for deployment.',

  middlePanel: {
    title: 'Build setup',

    customizeRoom: {
      title: 'Customize your room',
      description: 'Preview and configure the look and feel of your video room.',

      content: {
        title: 'Customize your room',
        description:
          'Use the design editor to style your room and preview how it will look for your users. Once you are happy with the result, continue to bundle it.',
      },
    },

    buildRoom: {
      title: 'Build room',
      description: 'Bundle your customized room into a deployable artifact.',

      content: {
        title: 'Build room',
        description: 'Build and download your customized room as a ready-to-deploy zip artifact.',
      },
    },
  },
} as const;

export default buildContent;
