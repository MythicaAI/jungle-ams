import axios from "axios";

export const getData  = async <T>(subpath: string): Promise<T> => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const endpointPath = `${subpath}`;
    const url = `${apiBaseUrl}/${endpointPath}`;

    try {
        const response = await axios.get<T>(url);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle Axios-specific errors here
            console.error('url:', url, 'error:', error.message, "response:", error.response ? error.response.data.detail : "");
            throw new Error('An error occurred while fetching the user data');
        } else {
            // Handle non-Axios errors here
            console.error('Unknown error:', error);
            throw new Error('An unknown error occurred');
        }
    }
}

export const postData  = async <T>(subpath: string, data: object): Promise<T> => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const endpointPath = `${subpath}`;
    const url = `${apiBaseUrl}/${endpointPath}`;

    try {
        const response = await axios.post<T>(url, data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle Axios-specific errors here
            console.error('Axios error:', error.message, "response:", error.response ? error.response.data.detail : "");
            throw new Error('An error occurred while fetching the user data');
        } else {
            // Handle non-Axios errors here
            console.error('Unknown error:', error);
            throw new Error('An unknown error occurred');
        }
    }
}
