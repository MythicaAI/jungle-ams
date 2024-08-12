from enum import Enum

##
# Helper Class for Unreal Exports
class UnrealExporter():
    class UnrealExportType(Enum):
        HDA = 'HDA'
        MATERIAL = 'Material'
        ACTOR = 'Actor'

    _UNREAL= 'unreal'
    _CONTENT='Content'
    _GAME='/Game'
    _MYTHICA='Mythica'
    
    def __init__(self, base_path):
        self.base_path = base_path

    def get_path_relative(self, unreal_export_type: UnrealExportType):
        return os.path.join( self._UNREAL,self._CONTENT, self._MYTHICA, unreal_export_type.value)

    def get_path_absolute(self, unreal_export_type: UnrealExportType):
        return os.path.join(self.base_path, self.get_path_relative(unreal_export_type))
    
    def get_package(self, unreal_export_type: UnrealExportType):
        return f'{self._GAME}/{self._MYTHICA}/{unreal_export_type.value}'

