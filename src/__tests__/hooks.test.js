// src/__tests__/hooks.test.js (updated)
import { renderHook, act } from '@testing-library/react';
import { useSessionStorage } from '../hooks/useSessionStorage';

describe('Custom Hooks', () => {
  beforeEach(() => {
    // mock sessionStorage
    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    global.sessionStorage = sessionStorageMock;
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(sessionStorageMock.getItem);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(sessionStorageMock.setItem);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('useSessionStorage returns initial value when no stored value exists', () => {
    sessionStorage.getItem.mockReturnValueOnce(null);
    
    const { result } = renderHook(() => useSessionStorage('testKey', 'initialValue'));
    
    expect(result.current[0]).toBe('initialValue');
  });

  test('useSessionStorage updates and stores value correctly', () => {
    sessionStorage.getItem.mockReturnValueOnce(null);
    
    const { result } = renderHook(() => useSessionStorage('testKey', 'initialValue'));
    
    act(() => {
      result.current[1]('newValue');
    });
    
    expect(result.current[0]).toBe('newValue');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('testKey', '"newValue"');
  });
});