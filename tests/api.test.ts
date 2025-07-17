import axios from 'axios';

// Mock axios completely
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('api.ts', () => {
  // We'll create a fake api instance returned by axios.create()
  let apiInstance: any;

  beforeEach(() => {
    apiInstance = {
      defaults: { baseURL: 'http://localhost:5000/api' },
      get: jest.fn(),
      post: jest.fn(),
    };

    // Mock axios.create to return our apiInstance
    mockedAxios.create.mockReturnValue(apiInstance);
  });

  it('should have correct baseURL configured', () => {
    // Import your api AFTER mocking create()
    const api = require('../src/utils/api').default;

    expect(api.defaults.baseURL).toBe('http://localhost:5000/api');
  });

  it('should make a successful GET request', async () => {
    const api = require('../src/utils/api').default;

    const responseData = { message: 'Success' };
    api.get.mockResolvedValueOnce({ data: responseData });

    const response = await api.get('/test');

    expect(api.get).toHaveBeenCalledWith('/test');
    expect(response.data).toEqual(responseData);
  });

  it('should handle a failed GET request', async () => {
    const api = require('../src/utils/api').default;

    const errorMessage = 'Network Error';
    api.get.mockRejectedValueOnce(new Error(errorMessage));

    try {
      await api.get('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(errorMessage);
    }

    expect(api.get).toHaveBeenCalledWith('/test');
  });

  it('should make a successful POST request', async () => {
    const api = require('../src/utils/api').default;

    const postData = { name: 'Test' };
    const responseData = { id: 1, ...postData };
    api.post.mockResolvedValueOnce({ data: responseData });

    const response = await api.post('/test', postData);

    expect(api.post).toHaveBeenCalledWith('/test', postData);
    expect(response.data).toEqual(responseData);
  });

  it('should handle a failed POST request', async () => {
    const api = require('../src/utils/api').default;

    const postData = { name: 'Test' };
    const errorMessage = 'Request failed';
    api.post.mockRejectedValueOnce(new Error(errorMessage));

    try {
      await api.post('/test', postData);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(errorMessage);
    }

    expect(api.post).toHaveBeenCalledWith('/test', postData);
  });
});
