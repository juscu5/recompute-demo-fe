import { SERVER_URL } from './config';
import { axiosInstance } from './instance';

class Services {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  async get(resource: string, params: { [index: string]: any }) {
    const response = await axiosInstance.get(this.url + resource, params);
    return response;
  }

  async getAll(resource: string, data: any) {
    const response = await axiosInstance.get(this.url + resource, data);
    return response;
  }

  async post(resource: string, data: any, config?: { [index: string]: any }) {
    const response = await axiosInstance.post(
      this.url + resource,
      data,
      config
    );
    return response;
  }

  async customEndpointPost(
    url: string,
    data: any,
    config?: { [index: string]: any }
  ) {
    const response = await axiosInstance.post(url, data, config);
    return response;
  }

  async put(resource: string, data: any, config?: { [index: string]: any }) {
    const response = await axiosInstance.put(this.url + resource, data, config);
    return response;
  }

  async delete(resource: string, headers?: any) {
    const response = await axiosInstance.delete(this.url + resource, headers);
    return response;
  }

  errorHandler() {
    console.log('Not implemented');
  }
}

export const ApiService = new Services(SERVER_URL);
