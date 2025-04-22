# pylint: disable=redefined-outer-name, unused-import

import hashlib
import itertools
from http import HTTPStatus

from fastapi.testclient import TestClient
import pytest
from munch import munchify

from cryptid.cryptid import file_seq_to_id
from ripple.auth import roles
from api.default_values import LATEST_GREATEST_VERSIONS_ASSET_NUM
from repos.assets import AssetTopVersionsResult
from tests.fixtures.create_profile import create_profile
from tests.fixtures.uploader import request_to_upload_files
from tests.shared_test import (
    FileContentTestObj,
    assert_status_code,
    make_random_content,
    random_str,
)

# length of event data in test events
test_event_info_len = 10
next_test_event_id = itertools.count(start=1, step=1)

test_file_name = "test-file.hda"
test_file_contents = b"test contents"
test_file_content_hash = hashlib.sha1(test_file_contents).hexdigest()
test_file_content_type = "application/octet-stream"
test_asset_name = 'test-asset'
test_commit_ref = "git@github.com:test-project/test-project.git/f00df00d"


def unauthorized_create_type_tag(
    client, api_base, type_model_name, type_id, tag_id, headers
):
    r = client.post(
        f"{api_base}/tags/types/{type_model_name}",
        json={'tag_id': tag_id, "type_id": type_id},
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.UNAUTHORIZED)


def unauthorized_delete_type_tag(
    client, api_base, type_model_name, type_id, tag_id, headers
):
    r = client.delete(
        f"{api_base}/tags/types/{type_model_name}/{tag_id}/{type_id}",
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.UNAUTHORIZED)


@pytest.mark.asyncio
async def test_tags_operations(api_base, client, create_profile, request_to_upload_files):
    simple_profile = await create_profile(email="test@test.ai", validate_email=True)
    simple_headers = simple_profile.authorization_header()
    simple_profile = simple_profile.profile

    test_profile = await create_profile(email="test@mythica.ai", validate_email=True)
    headers = test_profile.authorization_header()

    # create org to contain assets
    org_name = 'org-' + random_str(10, digits=False)
    r = client.post(f"{api_base}/orgs/", json={'name': org_name}, headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    org_id = o.org_id

    def create_asset(headers):
        # create asset in org
        r = client.post(f"{api_base}/assets", json={'org_id': org_id}, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        return o.asset_id

    asset_id = create_asset(headers)

    top_limit = 5
    top_tag_name = None

    def create_tag(page_priority=1):
        # create tag
        tag_name = "tag_" + random_str(10, digits=False)
        thumbnail_obj = make_random_content("png")
        thumbnail_id = list(request_to_upload_files(headers, [thumbnail_obj]))[0]
        blurb = "text"
        data = {
            'name': tag_name,
            "page_priority": page_priority,
            "contents": {
                "thumbnails": [{"file_id": thumbnail_id}],
                "blurb": blurb,
            },
        }
        r = client.post(f"{api_base}/tags", json=data, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        tag_obj = munchify(r.json())
        assert tag_obj.name == tag_name
        assert tag_obj.page_priority == page_priority
        assert tag_obj.contents is not None
        assert len(tag_obj.contents.thumbnails)
        assert tag_obj.contents.thumbnails[0].file_id == thumbnail_id
        assert tag_obj.contents.blurb == blurb
        return tag_obj

    def create_type_tag(type_model_name, type_id, tag_id):
        # create tag for type_model
        r = client.post(
            f"{api_base}/tags/types/{type_model_name}",
            json={'tag_id': tag_id, "type_id": type_id},
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        assert o.tag_id == tag_id
        assert o.type_id == type_id
        return tag_id, tag_name

    def delete_type_tag(type_model_name, type_id, tag_id):
        # create tag for type_model
        r = client.delete(
            f"{api_base}/tags/types/{type_model_name}/{tag_id}/{type_id}",
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.OK)

    def delete_all_created_type_tags(created_asset_ids, tag_id):
        # delete all model-type tags
        for asset_id in created_asset_ids:
            delete_type_tag("asset", asset_id, tag_id)

    # Test profile does not have required_role to create tag
    unrequired_role_tag_name = "tag_" + random_str(10, digits=False)
    r = client.post(
        f"{api_base}/tags",
        json={'name': unrequired_role_tag_name},
        headers=simple_headers,
    )
    assert_status_code(r, HTTPStatus.UNAUTHORIZED)

    created_tag_ids = []
    top_asset_ids = [create_asset(headers) for _ in range(10)]
    for i in range(top_limit):
        tag_obj = create_tag()
        tag_name = tag_obj.name
        created_tag_ids.append(tag_obj.tag_id)
        create_type_tag("asset", asset_id, tag_obj.tag_id)
        if i == top_limit - 1:
            # last tag will be on the top
            top_tag_name = tag_obj.name
            for new_asset_id in top_asset_ids:
                create_type_tag("asset", new_asset_id, tag_obj.tag_id)

    r = client.get(
        f"{api_base}/tags/",
        params={"limit": top_limit},
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())

    # Test update tag
    thumbnail_obj = make_random_content("png")
    thumbnail_id = list(request_to_upload_files(headers, [thumbnail_obj]))[0]
    second_thumbnail_obj = make_random_content("png")
    second_thumbnail_id = list(request_to_upload_files(headers, [second_thumbnail_obj]))[0]

    tag_id = o[0].tag_id
    tag_name = o[0].name
    r = client.post(
        f"{api_base}/tags/{tag_id}",
        json={
            "page_priority": 1,
            "contents": {
                "thumbnails": [{"file_id": thumbnail_id}, {"file_id": second_thumbnail_id}],
                "blurb": "blurb",
            },
        },
        headers=headers,
    )
    o = munchify(r.json())
    assert_status_code(r, HTTPStatus.OK)
    assert o.name == tag_name
    assert o.tag_id == tag_id
    assert o.page_priority == 1
    assert o.contents
    assert len(o.contents.thumbnails)
    assert o.contents.thumbnails[0].file_id == thumbnail_id
    assert o.contents.thumbnails[1].file_id == second_thumbnail_id
    assert o.contents.blurb == "blurb"

    # Test profanity
    tag_name = "shit"
    r = client.post(f"{api_base}/tags", json={'name': tag_name}, headers=headers)
    assert_status_code(r, HTTPStatus.UNPROCESSABLE_ENTITY)

    # Test deletion of a tag from a non-existent type_model
    r = client.delete(
        f"{api_base}/tags/types/asset{tag_obj.tag_id}/{random_str(10, digits=False)}",
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.NOT_FOUND)

    # get top tags for asset
    r = client.get(
        f"{api_base}/tags/types/asset/top",
        params={"limit": top_limit},
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert len(o) == top_limit
    assert o[0].name == top_tag_name

    delete_all_created_type_tags(top_asset_ids, tag_obj.tag_id)


@pytest.mark.asyncio
async def test_tag_asset_operations(
    api_base, client, create_profile, request_to_upload_files
):
    test_profile = await create_profile(email="test@mythica.ai", validate_email=True)
    headers = test_profile.authorization_header()
    not_allowed_test_profile = await create_profile(
        email="test@somewhere.com", validate_email=True
    )
    not_allowed_headers = not_allowed_test_profile.authorization_header()

    # create org to contain assets
    org_name = 'org-' + random_str(10, digits=False)
    r = client.post(f"{api_base}/orgs/", json={'name': org_name}, headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    org_id = o.org_id

    # initial role check
    r = client.get(f"{api_base}/profiles/roles/", headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert roles.alias_tag_author in o.auth_roles

    def create_asset(headers):
        # create asset in org
        r = client.post(f"{api_base}/assets", json={'org_id': org_id}, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        test_asset_ver_json = {
            'commit_ref': 'test_commit_ref-updated-2',
            'name': 'test_asset_name-updated-2',
            'contents': {'files': []},
            'published': True,
        }
        r = client.post(
            f"{api_base}/assets/{o.asset_id}/versions/0.1.0",
            json=test_asset_ver_json,
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.CREATED)
        return o.asset_id

    asset_id = create_asset(headers)

    top_limit = 5

    def create_tag(page_priority=1):
        # create tag
        tag_name = "tag_" + random_str(10, digits=False)
        thumbnail_obj = make_random_content("png")
        thumbnail_id = list(request_to_upload_files(headers, [thumbnail_obj]))[0]
        blurb = "text"
        data = {
            'name': tag_name,
            "page_priority": page_priority,
            "contents": {
                "thumbnails": [{"file_id": thumbnail_id}],
                "blurb": blurb,
            },
        }
        r = client.post(f"{api_base}/tags", json=data, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        tag_obj = munchify(r.json())
        assert tag_obj.name == tag_name
        assert tag_obj.page_priority == page_priority
        assert tag_obj.contents is not None
        assert len(tag_obj.contents.thumbnails)
        assert tag_obj.contents.thumbnails[0].file_id == thumbnail_id
        assert tag_obj.contents.blurb == blurb
        return tag_obj

    tag_obj = create_tag()
    tag_name = tag_obj.name

    def create_type_tag(type_model_name, type_id, tag_id):
        # create tag for type_model
        r = client.post(
            f"{api_base}/tags/types/{type_model_name}",
            json={'tag_id': tag_id, "type_id": type_id},
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        assert o.tag_id == tag_id
        assert o.type_id == type_id
        return tag_id, tag_name

    def delete_tag(tag_id):
        # create tag for type_model
        r = client.delete(f"{api_base}/tags/{tag_id}", headers=headers)
        assert_status_code(r, HTTPStatus.OK)

    def delete_type_tag(type_model_name, type_id, tag_id):
        # create tag for type_model
        r = client.delete(
            f"{api_base}/tags/types/{type_model_name}/{tag_id}/{type_id}",
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.OK)

    def delete_all_created_tags(created_tag_ids):
        # delete all tags
        for tag_id in created_tag_ids:
            delete_tag(tag_id)

    unauthorized_create_type_tag(
        client, api_base, "asset", asset_id, tag_obj.tag_id, not_allowed_headers
    )
    unauthorized_delete_type_tag(
        client, api_base, "asset", asset_id, tag_obj.tag_id, not_allowed_headers
    )

    model_type_count_to_filter = 5
    include_tags_count_to_filter = 3
    exclude_tags_count_to_filter = 3
    filter_assets_ids = [
        create_asset(headers) for _ in range(model_type_count_to_filter)
    ]
    include_tags_id_names = [create_tag() for _ in range(include_tags_count_to_filter)]
    exclude_tags_id_names = [create_tag() for _ in range(exclude_tags_count_to_filter)]
    created_tag__type_ids: list[tuple[str, str, str]] = []
    for i in range(model_type_count_to_filter):
        filter_model_type_id = filter_assets_ids[i]
        for filter_tag_obj in include_tags_id_names:
            created_tag__type_ids.append(
                (
                    filter_tag_obj.tag_id,
                    filter_tag_obj.name,
                    filter_model_type_id,
                )
            )
            create_type_tag("asset", filter_model_type_id, filter_tag_obj.tag_id)

        # last model_type_tag has exclude_tags
        if i == top_limit - 1:
            for filter_tag_obj in exclude_tags_id_names:
                created_tag__type_ids.append(
                    (
                        filter_tag_obj.tag_id,
                        filter_tag_obj.name,
                        filter_model_type_id,
                    )
                )
                create_type_tag("asset", filter_model_type_id, filter_tag_obj.tag_id)

    # get filtered assets by tags
    r = client.get(
        f"{api_base}/tags/types/asset/filter",
        params={
            "limit": model_type_count_to_filter,
            "offset": 0,
            "include": [i.name for i in include_tags_id_names],
            "exclude": [i.name for i in exclude_tags_id_names],
        },
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())

    assert len(o) == model_type_count_to_filter - 1
    for asset in o:
        assert asset.asset_id != filter_assets_ids[-1]

    r = client.get(
        f"{api_base}/tags/types/asset",
        params={
            "limit": 100,
            "offset": 0,
        },
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)

    # Test create the already created tag_type, ensure it returns the original tag
    # but the status is OK and not CREATED (idempotent)
    new_tag_id, filter_tag_name, asset_id = created_tag__type_ids[0]
    r = client.post(
        f"{api_base}/tags/types/asset",
        json={'tag_id': new_tag_id, "type_id": asset_id},
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    assert o.tag_id == new_tag_id
    assert o.type_id == asset_id

    # Test create the already created tag, ensure it comes back with OK and original tag data
    new_tag_id, filter_tag_name, asset_id = created_tag__type_ids[0]
    r = client.post(f"{api_base}/tags", json={'name': filter_tag_name}, headers=headers)
    assert_status_code(r, HTTPStatus.OK)
    assert r.json()["name"] == filter_tag_name

    for tag__type_ids in created_tag__type_ids:
        new_tag_id, _, asset_id = tag__type_ids
        delete_type_tag("asset", asset_id, new_tag_id)

    # Test assign thumbnail that does not exist
    tag_name = "tag_" + random_str(10, digits=False)
    thumbnail_file_id = file_seq_to_id(1000000)
    blurb = "text"
    data = {
        'name': tag_name,
        "page_priority": 1,
        "contents": {
            "thumbnails": [{"file_id": thumbnail_file_id}],
            "blurb": blurb,
        },
    }
    r = client.post(f"{api_base}/tags", json=data, headers=headers)
    assert_status_code(r, HTTPStatus.NOT_FOUND)

    # check was asset_tag deleted
    new_tag_id, filter_tag_name, asset_id = created_tag__type_ids[0]
    r = client.get(
        f"{api_base}/tags/types/asset/filter",
        params={
            "limit": model_type_count_to_filter,
            "offset": 0,
            "include": [filter_tag_name],
        },
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())
    for filter_asset in o:
        assert asset_id != filter_asset.asset_id

    delete_all_created_tags(tag__type_ids[0] for tag__type_ids in created_tag__type_ids)


@pytest.mark.asyncio
async def test_wrong_type_model(api_base, client, create_profile):
    test_profile = await create_profile(email="test@mythica.ai")
    headers = test_profile.authorization_header()
    r = client.get(
        f"{api_base}/tags/types/{random_str(23)}",
        params={
            "limit": 100,
            "offset": 0,
        },
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.UNPROCESSABLE_ENTITY)


@pytest.mark.asyncio
async def test_tag_files_operations(
    api_base, client, create_profile, request_to_upload_files
):
    test_profile = await create_profile(email="test@mythica.ai", validate_email=True)
    headers = test_profile.authorization_header()
    not_allowed_profile = await create_profile(email="user@somewhere.com")
    not_allowed_headers = not_allowed_profile.authorization_header()

    top_limit = 5
    files = [
        FileContentTestObj(
            file_name=test_file_name,
            file_id=str(file_id),
            contents=test_file_contents,
            content_hash=hashlib.sha1(test_file_contents).hexdigest(),
            content_type=test_file_content_type,
            size=len(test_file_contents),
        )
        for file_id in range(top_limit)
    ]
    filter_files_ids = [file_id for file_id in request_to_upload_files(headers, files)]
    first_file_id = filter_files_ids[0]

    def create_tag():
        # create tag
        tag_name = "tag_" + random_str(10, digits=False)
        r = client.post(f"{api_base}/tags", json={'name': tag_name}, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        assert o.name == tag_name
        tag_id = o.tag_id
        return tag_id, tag_name

    tag_id, tag_name = create_tag()

    def create_type_tag(type_model_name, type_id, tag_id):
        # create tag for type_model
        r = client.post(
            f"{api_base}/tags/types/{type_model_name}",
            json={'tag_id': tag_id, "type_id": type_id},
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        assert o.tag_id == tag_id
        assert o.type_id == type_id
        return tag_id, tag_name

    def delete_tag(tag_id):
        # create tag for type_model
        r = client.delete(f"{api_base}/tags/{tag_id}", headers=headers)
        assert_status_code(r, HTTPStatus.OK)

    def delete_type_tag(type_model_name, type_id, tag_id):
        # create tag for type_model
        r = client.delete(
            f"{api_base}/tags/types/{type_model_name}/{tag_id}/{type_id}",
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.OK)

    def delete_all_created_tags(created_tag_ids):
        # delete all tags
        for tag_id in created_tag_ids:
            delete_tag(tag_id)

    unauthorized_create_type_tag(
        client, api_base, "file", first_file_id, tag_id, not_allowed_headers
    )
    unauthorized_delete_type_tag(
        client, api_base, "file", first_file_id, tag_id, not_allowed_headers
    )

    model_type_count_to_filter = top_limit
    include_tags_count_to_filter = 3
    exclude_tags_count_to_filter = 3
    include_tags_id_names = [create_tag() for _ in range(include_tags_count_to_filter)]
    exclude_tags_id_names = [create_tag() for _ in range(exclude_tags_count_to_filter)]
    created_tag__type_ids = []
    for i in range(model_type_count_to_filter):
        filter_model_type_id = filter_files_ids[i]
        for filter_tag_id, _ in include_tags_id_names:
            created_tag__type_ids.append(
                (
                    filter_tag_id,
                    filter_model_type_id,
                )
            )
            create_type_tag("file", filter_model_type_id, filter_tag_id)

        # last model_type_tag has exclude_tags
        if i == top_limit - 1:
            for filter_tag_id, _ in exclude_tags_id_names:
                created_tag__type_ids.append(
                    (
                        filter_tag_id,
                        filter_model_type_id,
                    )
                )
                create_type_tag("file", filter_model_type_id, filter_tag_id)

    # get filtered files by tags
    r = client.get(
        f"{api_base}/tags/types/file/filter",
        params={
            "limit": model_type_count_to_filter,
            "offset": 0,
            "include": [i[1] for i in include_tags_id_names],
            "exclude": [i[1] for i in exclude_tags_id_names],
        },
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())

    # test get filtered files when profile does not have access
    r = client.get(
        f"{api_base}/tags/types/file/filter",
        params={},
    )
    assert_status_code(r, HTTPStatus.FORBIDDEN)

    assert len(o) == model_type_count_to_filter - 1
    for file in o:
        assert file.file_id != filter_files_ids[-1]

    r = client.get(
        f"{api_base}/tags/types/file",
        params={
            "limit": 100,
            "offset": 0,
        },
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())

    # test get files when profile does not have access
    r = client.get(
        f"{api_base}/tags/types/file",
        params={},
    )
    assert_status_code(r, HTTPStatus.FORBIDDEN)

    # test get top files when profile does not have access
    r = client.get(
        f"{api_base}/tags/types/file/top",
        params={},
    )
    assert_status_code(r, HTTPStatus.FORBIDDEN)

    for tag__type_ids in created_tag__type_ids:
        new_tag_id, file_id = tag__type_ids
        delete_type_tag("file", file_id, new_tag_id)

    delete_all_created_tags(tag__type_ids[0] for tag__type_ids in created_tag__type_ids)


@pytest.mark.asyncio
async def test_tags_filtered_and_ordered_by_latest_versions(api_base, client: TestClient, create_profile, request_to_upload_files):

    test_profile = await create_profile(email="test@mythica.ai", validate_email=True)
    headers = test_profile.authorization_header()

    # create org to contain assets
    org_name = 'org-' + random_str(10, digits=False)
    r = client.post(f"{api_base}/orgs/", json={'name': org_name}, headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    org_id = o.org_id

    def create_asset(headers):
        # create asset in org
        r = client.post(f"{api_base}/assets", json={'org_id': org_id}, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        return o.asset_id

    asset_id_1 = create_asset(headers)
    asset_id_2 = create_asset(headers)
    created_asset_ids = [asset_id_1, asset_id_2]

    def create_tag(page_priority=1):
        # create tag
        tag_name = "tag_" + random_str(10, digits=False)
        thumbnail_obj = make_random_content("png")
        thumbnail_id = list(request_to_upload_files(headers, [thumbnail_obj]))[0]
        blurb = "text"
        data = {
            'name': tag_name,
            "page_priority": page_priority,
            "contents": {
                "thumbnails": [{"file_id": thumbnail_id}],
                "blurb": blurb,
            },
        }
        r = client.post(f"{api_base}/tags", json=data, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        tag_obj = munchify(r.json())
        assert tag_obj.name == tag_name
        assert tag_obj.page_priority == page_priority
        assert tag_obj.contents is not None
        assert len(tag_obj.contents.thumbnails)
        assert tag_obj.contents.thumbnails[0].file_id == thumbnail_id
        assert tag_obj.contents.blurb == blurb
        return tag_obj

    def create_type_tag(type_model_name, type_id, tag_id):
        # create tag for type_model
        r = client.post(
            f"{api_base}/tags/types/{type_model_name}",
            json={'tag_id': tag_id, "type_id": type_id},
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        assert o.tag_id == tag_id
        assert o.type_id == type_id
        return tag_id

    def delete_type_tag(type_model_name, type_id, tag_id):
        # create tag for type_model
        r = client.delete(
            f"{api_base}/tags/types/{type_model_name}/{tag_id}/{type_id}",
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.OK)

    def delete_all_created_type_tags(created_asset_ids, tag_id):
        # delete all model-type tags
        for asset_id in created_asset_ids:
            delete_type_tag("asset", asset_id, tag_id)

    tag_obj1 = create_tag()
    tag_name1 = tag_obj1.name
    create_type_tag("asset", asset_id_1, tag_obj1.tag_id)
    create_type_tag("asset", asset_id_2, tag_obj1.tag_id)

    tag_obj2 = create_tag()
    tag_name2 = tag_obj2.name
    create_type_tag("asset", asset_id_1, tag_obj2.tag_id)

    test_link_update1 = "https://test.test/foo"
    test_link_update2 = "https://test.test/bar"
    test_asset_ver_json = {
        'commit_ref': test_commit_ref + '-updated-2',
        'name': test_asset_name + '-updated-2',
        'contents': {'files': [],
                     'links': [test_link_update1, test_link_update2]},
        'author_id': test_profile.profile.profile_id,
    }
    versions1 = sorted(["2.1.0", "1.8.0", "1.1.0", "1.0.7", "1.0.0"], reverse=True)
    for version in sorted(versions1):
        r = client.post(
            f"{api_base}/assets/{asset_id_1}/versions/{version}",
            json=test_asset_ver_json,
            headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)

    versions2 = sorted(["0.1.0", "0.0.13"], reverse=True)
    for version in sorted(versions2):
        r = client.post(
            f"{api_base}/assets/{asset_id_2}/versions/{version}",
            json=test_asset_ver_json,
            headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)

    # Get all assets with common tag
    r = client.get(
        f"{api_base}/tags/types/asset/filter",
        params={"include": [tag_name1, tag_name2], "limit": 10},
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o: list[AssetTopVersionsResult] = munchify(r.json())
    assert len(o) == 2
    assert o[0].asset_id == asset_id_1
    for asset in o:
        if asset.asset_id == asset_id_1:
            assert asset.version == list(map(int, versions1[0].split(".")))
            assert asset.versions == list(
                [int(x) for x in i]
                for i in list(map(lambda x: x.split("."), versions1))
            )[:LATEST_GREATEST_VERSIONS_ASSET_NUM]
        elif asset.asset_id == asset_id_2:
            assert asset.version == list(map(int, versions2[0].split(".")))
            assert asset.versions == list(
                [int(x) for x in i]
                for i in list(map(lambda x: x.split("."), versions2))
            )[:LATEST_GREATEST_VERSIONS_ASSET_NUM]

    # Get second asset that has been assigned with one tag
    r = client.get(
        f"{api_base}/tags/types/asset/filter",
        params={"include": [tag_name1], "exclude": [tag_name2], "limit": 10},
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o: list[AssetTopVersionsResult] = munchify(r.json())
    assert len(o) == 1
    assert o[0].asset_id == asset_id_2
    
    # Get first asset that has unique tag
    r = client.get(
        f"{api_base}/tags/types/asset/filter",
        params={"include": [tag_name2], "limit": 10},
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o: list[AssetTopVersionsResult] = munchify(r.json())
    assert len(o) == 1
    assert o[0].asset_id == asset_id_1
    
    
    delete_all_created_type_tags(created_asset_ids, tag_obj1.tag_id)
    delete_all_created_type_tags([asset_id_1], tag_obj2.tag_id)
