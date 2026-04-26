const paths = {
  design: {
    root: '/design',
  },
  integration: {
    root: '/integration',
    backend: {
      root: '/integration/server',

      createHandler: {
        root: '/integration/server/create-handler',
      },
      expressIntegration: {
        root: '/integration/server/express',
      },
      advancedUseCases: {
        root: '/integration/server/advanced',
      },
    },
    frontend: {
      root: '/integration/web',

      room: {
        root: '/integration/web/room',
      },
      client: {
        root: '/integration/web/client',
      },
    },
    build: {
      root: '/integration/build',

      customize: {
        root: '/integration/build/customize',
      },
      buildRoom: {
        root: '/integration/build/room',
      },
    },
  },
} as const;

export const flatPaths = {
  backend: paths.integration.root,
  createHandler: paths.integration.backend.createHandler.root,
  expressIntegration: paths.integration.backend.expressIntegration.root,
  advancedUseCases: paths.integration.backend.advancedUseCases.root,

  frontend: paths.integration.frontend.root,
  room: paths.integration.frontend.room.root,
  client: paths.integration.frontend.client.root,

  build: paths.integration.build.root,
  buildCustomize: paths.integration.build.customize.root,
  buildRoom: paths.integration.build.buildRoom.root,

  design: paths.design.root,
} as const;

export type StudioPath = (typeof flatPaths)[keyof typeof flatPaths];

export default paths;
