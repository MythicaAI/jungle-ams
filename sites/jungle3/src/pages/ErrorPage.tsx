import {useRouteError, ErrorResponse} from "react-router-dom";

const ErrorPage = () => {
    const error = useRouteError() as ErrorResponse;
    console.error(error);

    const convertToString = (value: any): string => {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'function') {
            return value.toString();
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }

    const extractErrorMessage = (error: ErrorResponse): string => {
        let errorMessage = `${error.statusText ? error.statusText : "Unknown Error"} (${error.status ? error.status : -1})`;
        errorMessage += "\nData: " + convertToString(error.data);
        return errorMessage;
    }

    return (
        <div id="error-page">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{extractErrorMessage(error)}</i>
            </p>
        </div>
    );
}

export default ErrorPage;