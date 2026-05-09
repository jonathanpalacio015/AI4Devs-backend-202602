import '@testing-library/jest-dom';

const originalConsoleError = console.error;

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const message = args.join(' ');

    if (
      message.includes('ReactDOMTestUtils.act is deprecated') ||
      message.includes('An update to MemoryRouter inside a test was not wrapped in act') ||
      message.includes('An update to CandidateKanban inside a test was not wrapped in act')
    ) {
      return;
    }

    originalConsoleError(...args);
  });
});

afterAll(() => {
  if (console.error.mockRestore) {
    console.error.mockRestore();
  }
});
