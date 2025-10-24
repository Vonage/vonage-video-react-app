import { render } from '@testing-library/react';

import YourScopeUi from './ui';

describe('YourScopeUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<YourScopeUi />);
    expect(baseElement).toBeTruthy();
  });
});
