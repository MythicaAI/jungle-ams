from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

if TYPE_CHECKING:
    from ..models.file_upload_response import FileUploadResponse


T = TypeVar("T", bound="UploadResponse")


@_attrs_define
class UploadResponse:
    """Response from uploading one or more files

    Attributes:
        message (str):
        files (List['FileUploadResponse']):
    """

    message: str
    files: List["FileUploadResponse"]
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        message = self.message

        files = []
        for files_item_data in self.files:
            files_item = files_item_data.to_dict()
            files.append(files_item)

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "message": message,
                "files": files,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.file_upload_response import FileUploadResponse

        d = src_dict.copy()
        message = d.pop("message")

        files = []
        _files = d.pop("files")
        for files_item_data in _files:
            files_item = FileUploadResponse.from_dict(files_item_data)

            files.append(files_item)

        upload_response = cls(
            message=message,
            files=files,
        )

        upload_response.additional_properties = d
        return upload_response

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
