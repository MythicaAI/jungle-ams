import { create } from 'zustand';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5555';
const CATALOG_PATH = 'api/v1/catalog/all'

export const fetchData = async () => {
    const response = await fetch(`${API_URL}/${CATALOG_PATH}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const useStore = create((set) => ({
    catalog: [],
    fetchCatalog: async () => {
        const response = await fetchData();
        const catalog = await response.json()
        set({ catalog: catalog.data })
    }
}));

export default useStore;