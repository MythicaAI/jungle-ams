from pydantic_core._pydantic_core import ValidationError


# class CustomError(pydantic.ErrorWrapperModel):
#     message: str
#     errors: list[pydantic.ErrorWrapper]


def validate_as_json(error: ValidationError):
    errors = [
        pydantic.ErrorWrapper(exc=error_dict, loc=loc)
        for loc, error_dict in error.errors()
    ]
    custom_error = CustomError(detail=error.json(), errors=errors)
    return custom_error.json()
