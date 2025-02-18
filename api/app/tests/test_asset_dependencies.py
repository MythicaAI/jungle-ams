# pylint: disable=redefined-outer-name, unused-import, unsubscriptable-object

"""Test dependencies on asset versions"""
from http import HTTPStatus

import pytest

from assets.repo import AssetDependency, AssetDependencyResult
from tests.fixtures.create_asset_versions import create_asset_versions
from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import uploader
from tests.shared_test import assert_status_code, make_random_content


def version_id_as_str(version):
    """Convert version tuple/list to string"""
    return '.'.join(map(str, version))


def dependencies_uri(api_base, asset):
    """Get the dependencies URI for an asset version"""
    return (f"{api_base}/assets/{asset.asset_id}/versions/"
            f"{version_id_as_str(asset.version)}/dependencies")


@pytest.mark.asyncio
async def test_asset_dependencies(client, api_base, create_profile, create_asset_versions, uploader):
    test_profile = await create_profile()

    versions = create_asset_versions(test_profile, uploader)
    assert len(versions) == 1
    base_asset = versions[0]
    assert base_asset is not None
    assert base_asset.author_id == test_profile.profile.profile_id
    assert base_asset.contents
    assert 'files' in base_asset.contents
    assert len(base_asset.contents['files']) > 0
    assert 'links' in base_asset.contents
    assert len(base_asset.contents['files']) > 0
    assert 'thumbnails' in base_asset.contents
    assert len(base_asset.contents['files']) > 0

    # create an asset that depends on base_asset
    dependent_asset = create_asset_versions(
        test_profile,
        uploader,
        dependencies=[(base_asset.asset_id, base_asset.version)])[0]
    assert dependent_asset is not None

    # create a control asset that is not dependent
    control_asset = create_asset_versions(
        test_profile,
        uploader
    )[0]

    # query control
    r = client.get(
        dependencies_uri(api_base, control_asset),
        headers=test_profile.authorization_header())
    result = AssetDependencyResult(**r.json())
    assert len(result.missing) == 0
    assert len(result.dependencies) == 1
    assert result.dependencies[0].asset_id == control_asset.asset_id
    assert result.packages[0].file_id == control_asset.package_id

    # query valid dependencies, should return base and dependent assets
    r = client.get(
        dependencies_uri(api_base, dependent_asset),
        headers=test_profile.authorization_header(),
    )
    assert_status_code(r, HTTPStatus.OK)
    result = AssetDependencyResult(**r.json())
    assert len(result.missing) == 0
    assert len(result.dependencies) == 2
    assert len(result.packages) == 2
    # the results are from the dependent asset to it's base
    assert result.packages[0].file_id == dependent_asset.package_id
    assert result.packages[1].file_id == base_asset.package_id
    assert result.dependencies[0].asset_id == dependent_asset.asset_id
    assert result.dependencies[1].asset_id == base_asset.asset_id
    assert result.dependencies[1].version == base_asset.version
    assert result.dependencies[1].author_name == test_profile.profile.name

    # create a new asset with a different profile
    other_profile = await create_profile()

    # initially this asset has no dependencies
    versioned_asset = create_asset_versions(other_profile, uploader, attach_package=False)[0]

    # query dependencies
    r = client.get(
        dependencies_uri(api_base, versioned_asset),
        headers=test_profile.authorization_header(),
    )
    assert_status_code(r, HTTPStatus.OK)
    result = AssetDependencyResult(**r.json())
    assert len(result.missing) == 1
    assert len(result.dependencies) == 0
    assert len(result.packages) == 0
    assert result.missing[0].missing_package_link == True
    assert result.missing[0].missing_version == (versioned_asset.asset_id, (1, 0, 0))

    # attach package to version 1.0.0
    package = make_random_content("zip")
    package_response_files = uploader(
        other_profile.profile.profile_id,
        other_profile.authorization_header(),
        [package],
        storage_uri=f"/upload/package/{versioned_asset.asset_id}/1.0.0")
    assert len(package_response_files) == 1

    # query dependencies with attached package
    r = client.get(
        dependencies_uri(api_base, versioned_asset),
        headers=test_profile.authorization_header(),
    )
    assert_status_code(r, HTTPStatus.OK)
    result = AssetDependencyResult(**r.json())
    assert len(result.missing) == 0
    assert len(result.dependencies) == 1
    assert len(result.packages) == 1
    assert result.dependencies[0].asset_id == versioned_asset.asset_id
    assert result.dependencies[0].version == [1, 0, 0]

    # create a new version with the dependency added
    #
    # after this update the chain will be
    # versioned_asset-1.0.1 -> dependant-1.0.0 -> base-1.0.0
    #
    contents = dict(versioned_asset.contents)

    # translate back to core JSON, add the dependency
    contents['files'] = [x.model_dump() for x in contents['files']]
    contents['thumbnails'] = [x.model_dump() for x in contents['thumbnails']]
    contents['dependencies'] = [
        AssetDependency(
            asset_id=dependent_asset.asset_id + "foo",
            version=dependent_asset.version).model_dump()]
    body = {
        'contents': contents,
        'name': versioned_asset.name + '-updated',
        'description': versioned_asset.description + '-updated',
        'published': True,
        'commit_ref': versioned_asset.commit_ref + '-updated'
    }

    # post a bad update first to verify the failure case
    new_version = list(versioned_asset.version)
    new_version[2] += 1
    new_version_str = '.'.join(map(str, new_version))
    r = client.post(
        f"{api_base}/assets/{versioned_asset.asset_id}/versions/{new_version_str}",
        json=body,
        headers=other_profile.authorization_header(),
    )
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # post another variant of a bad request
    body['contents']['dependencies'][0]['version'] = [1, 0, 0, 0]
    r = client.post(
        f"{api_base}/assets/{versioned_asset.asset_id}/versions/{new_version_str}",
        json=body,
        headers=other_profile.authorization_header(),
    )
    assert_status_code(r, HTTPStatus.BAD_REQUEST)

    # fix the bad dependency
    body['contents']['dependencies'][0]['asset_id'] = dependent_asset.asset_id
    body['contents']['dependencies'][0]['version'] = [1, 0, 0]
    r = client.post(
        f"{api_base}/assets/{versioned_asset.asset_id}/versions/{new_version_str}",
        json=body,
        headers=other_profile.authorization_header(),
    )
    assert_status_code(r, HTTPStatus.CREATED)

    # query dependencies to verify the missing package link on the updated version
    versioned_asset.version = new_version
    r = client.get(
        dependencies_uri(api_base, versioned_asset),
    )
    result = AssetDependencyResult(**r.json())
    assert len(result.missing) == 1
    assert result.missing[0].missing_package_link == True
    assert result.missing[0].missing_version == (versioned_asset.asset_id, (1, 0, 1))

    # attach package
    package = make_random_content("zip")
    package_response_files = uploader(
        other_profile.profile.profile_id,
        other_profile.authorization_header(),
        [package],
        storage_uri=f"/upload/package/{versioned_asset.asset_id}/{new_version_str}")
    assert len(package_response_files) == 1

    # query dependencies now with attached package
    r = client.get(
        f"{api_base}/assets/{versioned_asset.asset_id}/versions/{new_version_str}/dependencies",
        headers=test_profile.authorization_header(),
    )
    assert_status_code(r, HTTPStatus.OK)
    result = AssetDependencyResult(**r.json())
    assert len(result.missing) == 0
    assert len(result.dependencies) == 3
    assert len(result.packages) == 3

    # query dependencies for previous version, only dependent on self
    r = client.get(
        f"{api_base}/assets/{versioned_asset.asset_id}/versions/1.0.0/dependencies",
        headers=test_profile.authorization_header(),
    )
    assert_status_code(r, HTTPStatus.OK)
    result = AssetDependencyResult(**r.json())
    assert len(result.missing) == 0
    assert len(result.dependencies) == 1
    assert len(result.packages) == 1

    # unpublish the dependency, validate that it is missing
    r = client.post(
        f"{api_base}/assets/{dependent_asset.asset_id}/versions/{version_id_as_str(dependent_asset.version)}",
        json={"published": False},
        headers=test_profile.authorization_header(),
    )
    assert_status_code(r, HTTPStatus.OK)

    # query dependencies again, should be missing the version
    versioned_asset.version = [1, 0, 1]
    r = client.get(
        dependencies_uri(api_base, versioned_asset),
    )
    result = AssetDependencyResult(**r.json())
    assert len(result.missing) == 1
    assert result.missing[0].missing_version == (dependent_asset.asset_id, (1, 0, 0))
