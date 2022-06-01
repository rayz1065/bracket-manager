import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders title', () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches: false
    })),
  });

  render(<App />);
  const linkElement = screen.getByText(/Bracket management/i);
  expect(linkElement).toBeInTheDocument();
});
