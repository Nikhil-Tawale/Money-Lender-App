import { IDataService } from './IDataService';
import { LocalStorageService } from './LocalStorageService';
import { ApiService } from './ApiService';

// Get storage type from environment variable
const STORAGE_TYPE = import.meta.env.VITE_STORAGE_TYPE || 'localstorage';
console.log('Configured storage type:', STORAGE_TYPE);
class DataServiceFactory {
  private static instance: IDataService;

  static getService(): IDataService {
    if (!this.instance) {
      if (STORAGE_TYPE === 'api') {
        this.instance = new ApiService();
        console.log('Using API Service');
      } else {
        this.instance = new LocalStorageService();
        console.log('Using LocalStorage Service');
      }
    }
    return this.instance;
  }
}

// Export a single instance to be used throughout the app
export const dataService = DataServiceFactory.getService();
export { STORAGE_TYPE };