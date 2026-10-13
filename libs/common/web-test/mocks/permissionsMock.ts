const permissionsMock: Permissions = {
  query: function (): Promise<PermissionStatus> {
    throw new Error(
      'query() must be mocked explicitly in your test. ' +
        'Use vi.spyOn(globalThis.navigator.permissions, "query").mockResolvedValue(...) ' +
        'to provide the mock you need for your specific test.'
    );
  },
};

export default permissionsMock;
