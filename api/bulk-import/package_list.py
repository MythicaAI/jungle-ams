from pydantic import BaseModel


class PackageModel(BaseModel):
    """Model to validate the input dictionary"""
    repo: str
    directory: str
    name: str
    description: str


class ProcessedPackageModel(PackageModel):
    """Instance info filled out by resolving repo and assets"""
    asset_id: str = ''
    profile_id: str = ''
    org_id: str = ''
    latest_version: list[int] = list()
    commit_ref: str = ''
    root_disk_path: str = ''
    license_disk_path: str = ''
    license_package_path: str = ''


packages = [
    {
        'asset_id': "",
        'repo': "git@github.com:kdbra/kdbra-houdini-tools.git",
        'directory': "otls",
        'name': "KDBRA Tools",
        'description': "Kdbra tools are intended to speed up and facilitate VFX artist's routines."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:TrevisanGMW/gt-houdini-assets.git",
        'directory': "assets",
        'name': "GT Houdini Assets",
        'description': "These assets were created with the aim of automating, simplifying or to be used as a learning tool."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:CorvaeOboro/zenv.git",
        'directory': "hda",
        'name': "ZENV",
        'description': "Houdini hda tools focused on procedural modeling environments."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:mifth/mifthtools.git",
        'directory': "houdini/otls",
        'name': "MiraTools",
        'description': "Modern modeling and retopology tools."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:NiklasRosenstein/houdini-library.git",
        'directory': "otls",
        'name': "Niklas' Houdini Library",
        'description': "A collection of digital assets, shelf tools and code snippets."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:LaidlawFX/LaidlawFX.git",
        'directory': "otls",
        'name': "LaidlawFX",
        'description': "A repository of tools developed in production."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:eglaubauf/egLib.git",
        'directory': "otls",
        'name': "egLib",
        'description': "A collection of scripts for SideFx Houdini."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:igor-elovikov/hipie.git",
        'directory': "otls",
        'name': "Houdini Tools by Igor Elovikov",
        'description': ""
    },
    {
        'asset_id': "",
        'repo': "git@github.com:thi-ng/houdini.git",
        'directory': "hda",
        'name': "thi.ng Houdini Tools",
        'description': "Houdini HDAs & sketches (VEX, OpenCL, Python)"
    },
    {
        'asset_id': "",
        'repo': "git@github.com:ivantitov-zd/Hammer.git",
        'directory': "otls",
        'name': "Hammer Tools",
        'description': "Hammer Tools"
    },
    {
        'asset_id': "",
        'repo': "git@github.com:sashaouellet/SDMTools.git",
        'directory': "houdini/otls",
        'name': "SDMTools",
        'description': "A collection of shelf tools, HDAs, and menu scripts in its Houdini form."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:captainhammy/Houdini-Toolbox.git",
        'directory': "houdini/otls",
        'name': "Houdini Toolbox",
        'description': "Collection of Houdini tools."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:qLab/qLib.git",
        'directory': "otls",
        'name': "qLib",
        'description': "A procedural asset library for SideFX Houdini."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:joshuazt/JZTREES.git",
        'directory': "otls",
        'name': "JZTREES",
        'description': "Set of tools designed to ease the workflow for generating and applying FX to trees and vegetation."
    },
    {
        'asset_id': "",
        'repo': "git@github.com:demiaster/treegen.git",
        'directory': "assets",
        'name': "Treegen",
        'description': "Vegetation Generation Tool for Houdini."
    }
]
