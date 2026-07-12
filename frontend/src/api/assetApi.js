import apiClient from './authApi';
import { mockApi } from '../mocks/mockHandlers';

const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

// Helper to wrap mock results in an Axios-like object: { data: result }
const wrap = async (promise) => {
  try {
    const res = await promise;
    return { data: res };
  } catch (err) {
    if (err.response) {
      throw err;
    }
    throw {
      response: {
        data: err
      }
    };
  }
};

export const getAssets = (params) => {
  return useMock ? wrap(mockApi.getAssets(params)) : apiClient.get('/assets', { params });
};

export const createAsset = (body) => {
  return useMock ? wrap(mockApi.createAsset(body)) : apiClient.post('/assets', body);
};

export const getAssetById = (id) => {
  return useMock ? wrap(mockApi.getAssetById(id)) : apiClient.get(`/assets/${id}`);
};

export const getAllocations = (params) => {
  return useMock ? wrap(mockApi.getAllocations(params)) : apiClient.get('/allocations', { params });
};

export const createAllocation = (body) => {
  return useMock ? wrap(mockApi.createAllocation(body)) : apiClient.post('/allocations', body);
};

export const returnAllocation = (id, body) => {
  return useMock ? wrap(mockApi.returnAllocation(id, body)) : apiClient.patch(`/allocations/${id}/return`, body);
};

export const getTransfers = (params) => {
  return useMock ? wrap(mockApi.getTransfers(params)) : apiClient.get('/transfers', { params });
};

export const createTransfer = (body) => {
  return useMock ? wrap(mockApi.createTransfer(body)) : apiClient.post('/transfers', body);
};

export const approveTransfer = (id) => {
  return useMock ? wrap(mockApi.approveTransfer(id)) : apiClient.patch(`/transfers/${id}/approve`);
};

export const rejectTransfer = (id, body) => {
  return useMock ? wrap(mockApi.rejectTransfer(id, body)) : apiClient.patch(`/transfers/${id}/reject`, body);
};

export const getCategories = () => {
  return useMock ? wrap(mockApi.getCategories()) : apiClient.get('/categories');
};

export const getDepartments = (params) => {
  const query = params && params.status ? `?status=${params.status}` : '';
  return useMock ? wrap(mockApi.getDepartments()) : apiClient.get(`/departments${query}`);
};

export const getUsers = (params) => {
  return useMock ? wrap(mockApi.getUsers()) : apiClient.get('/users', { params });
};
