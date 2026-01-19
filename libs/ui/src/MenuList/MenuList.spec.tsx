import { render } from '@testing-library/react';
import MenuList from './';

describe('MenuList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MenuList />);
    expect(baseElement).toBeTruthy();
  });
});
