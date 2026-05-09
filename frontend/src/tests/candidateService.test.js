import {
  getCandidatesByPosition,
  updateCandidateStage,
  updateInterviewScore,
  sendCandidateData,
} from '../services/candidateService';

describe('candidateService endpoint contract', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls GET /positions/:id/candidates with expected URL and method', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => [],
    });

    await getCandidatesByPosition(54);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3010/positions/54/candidates',
      { method: 'GET' }
    );
  });

  it('calls PUT /candidates/:id/stage with expected payload', async () => {
    const payload = { positionId: 1, currentInterviewStep: 3 };
    global.fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ message: 'ok' }),
    });

    await updateCandidateStage(10, payload);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3010/candidates/10/stage',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  });

  it('throws API error message when GET returns non-2xx', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ error: 'Invalid position ID format' }),
    });

    await expect(getCandidatesByPosition('abc')).rejects.toThrow('Invalid position ID format');
  });

  it('calls POST /candidates with JSON body', async () => {
    const candidate = {
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana.test@example.com',
    };

    global.fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ id: 1 }),
    });

    await sendCandidateData(candidate);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3010/candidates',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate),
      }
    );
  });

  it('calls PUT /candidates/:id/score with expected payload', async () => {
    const payload = { positionId: 1, score: 87 };
    global.fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ message: 'ok' }),
    });

    await updateInterviewScore(10, payload);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3010/candidates/10/score',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  });
});
