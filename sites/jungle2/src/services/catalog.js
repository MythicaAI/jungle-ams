
export const CatalogService = {
    getAll: async () => {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5555';
        const CATALOG_PATH = 'api/v1/catalog/all'
        return fetch(`${API_URL}/${CATALOG_PATH}`).then(response => response.json())
    }
};