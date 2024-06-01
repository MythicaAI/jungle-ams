import axios from "axios";

const HOST_URL = process.env.REACT_APP_API_URL || 'http://localhost:5555';


export const getData  = async <T>(subpath: string): Promise<T> => {
    const endpoint_path = `api/v1/${subpath}`;
    const url = `${HOST_URL}/${endpoint_path}`;

    try {
        const response = await axios.get<T>(url);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle Axios-specific errors here
            console.error('Axios error:', error.message);
            throw new Error('An error occurred while fetching the user data');
        } else {
            // Handle non-Axios errors here
            console.error('Unknown error:', error);
            throw new Error('An unknown error occurred');
        }
    }
}