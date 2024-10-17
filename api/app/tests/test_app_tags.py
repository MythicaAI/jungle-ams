# pylint: disable=redefined-outer-name, unused-import

import itertools
from http import HTTPStatus

from munch import munchify

from tests.fixtures.create_profile import create_profile
from tests.shared_test import assert_status_code, get_random_string

# length of event data in test events
test_event_info_len = 10
next_test_event_id = itertools.count(start=1, step=1)


def test_tags_operations(api_base, client, create_profile):
    test_profile = create_profile()
    profile = test_profile.profile
    headers = test_profile.authorization_header()

    # create org to contain assets
    org_name = 'org-' + get_random_string(10, digits=False)
    r = client.post(f"{api_base}/orgs/", json={'name': org_name}, headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    org_id = o.org_id

    def create_asset():
        # create asset in org
        r = client.post(f"{api_base}/assets", json={'org_id': org_id}, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        return o.asset_id

    asset_id = create_asset()

    top_limit = 5
    top_tag_name = None

    def create_tag():
        # create tag
        tag_name = "tag_" + get_random_string(10, digits=False)
        r = client.post(f"{api_base}/tags", json={'name': tag_name}, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        assert o.name == tag_name
        assert o.owner_id == profile.profile_id
        tag_id = o.tag_id
        return tag_id, tag_name

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

    created_tag_ids = []
    top_asset_ids = [create_asset() for _ in range(10)]
    for i in range(top_limit):
        tag_id, tag_name = create_tag()
        created_tag_ids.append(tag_id)
        create_type_tag("asset", asset_id, tag_id)
        if i == top_limit - 1:
            # last tag will be on the top
            top_tag_name = tag_name
            for new_asset_id in top_asset_ids:
                create_type_tag("asset", new_asset_id, tag_id)

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

    delete_all_created_type_tags(top_asset_ids, tag_id)


def test_tag_types_operations(api_base, client, create_profile):
    test_profile = create_profile()
    profile = test_profile.profile
    headers = test_profile.authorization_header()
    new_test_profile = create_profile()
    new_headers = new_test_profile.authorization_header()

    # create org to contain assets
    org_name = 'org-' + get_random_string(10, digits=False)
    r = client.post(f"{api_base}/orgs/", json={'name': org_name}, headers=headers)
    assert_status_code(r, HTTPStatus.CREATED)
    o = munchify(r.json())
    org_id = o.org_id

    def create_asset():
        # create asset in org
        r = client.post(f"{api_base}/assets", json={'org_id': org_id}, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        return o.asset_id

    asset_id = create_asset()

    top_limit = 5

    def create_tag():
        # create tag
        tag_name = "tag_" + get_random_string(10, digits=False)
        r = client.post(f"{api_base}/tags", json={'name': tag_name}, headers=headers)
        assert_status_code(r, HTTPStatus.CREATED)
        o = munchify(r.json())
        assert o.name == tag_name
        assert o.owner_id == profile.profile_id
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


    def not_owner_create_type_tag(type_model_name, type_id, tag_id, headers):
        r = client.post(
            f"{api_base}/tags/types/{type_model_name}",
            json={'tag_id': tag_id, "type_id": type_id},
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.FORBIDDEN)

    def not_owner_delete_type_tag(type_model_name, type_id, tag_id, headers):
        r = client.delete(
            f"{api_base}/tags/types/{type_model_name}/{tag_id}/{type_id}",
            headers=headers,
        )
        assert_status_code(r, HTTPStatus.FORBIDDEN)

    not_owner_create_type_tag("asset", asset_id, tag_id, new_headers)
    not_owner_delete_type_tag("asset", asset_id, tag_id, new_headers)

    assets_count_to_filter = 5
    include_tags_count_to_filter = 3
    exclude_tags_count_to_filter = 3
    filter_assets_ids = [create_asset() for _ in range(assets_count_to_filter)]
    include_tags_id_names = [create_tag() for _ in range(include_tags_count_to_filter)]
    exclude_tags_id_names = [create_tag() for _ in range(exclude_tags_count_to_filter)]
    created_tag__type_ids = []
    for i in range(assets_count_to_filter):
        filter_asset_id = filter_assets_ids[i]
        for filter_tag_id, _ in include_tags_id_names:
            created_tag__type_ids.append((filter_tag_id, filter_asset_id,))
            create_type_tag("asset", filter_asset_id, filter_tag_id)

        # last model_type_tag has exclude_tags
        if i == top_limit - 1:
            for filter_tag_id, _ in exclude_tags_id_names:
                created_tag__type_ids.append((filter_tag_id, filter_asset_id,))
                create_type_tag("asset", filter_asset_id, filter_tag_id)

    # get filtered assets by tags
    r = client.get(
        f"{api_base}/tags/types/asset/filter",
        params={
            "limit": assets_count_to_filter,
            "offset": 0,
            "include": [i[1] for i in include_tags_id_names],
            "exclude": [i[1] for i in exclude_tags_id_names],
        },
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.OK)
    o = munchify(r.json())

    assert len(o) == assets_count_to_filter - 1
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
    o = munchify(r.json())
    
    r = client.get(
        f"{api_base}/tags/types/{get_random_string(23)}",
        params={
            "limit": 100,
            "offset": 0,
        },
        headers=headers,
    )
    assert_status_code(r, HTTPStatus.UNPROCESSABLE_ENTITY)
    
    # delete_all_created_type_tags(top_asset_ids, tag_id)
    for tag__type_ids in created_tag__type_ids:
        new_tag_id, asset_id = tag__type_ids
        delete_type_tag("asset", asset_id, new_tag_id)

    delete_all_created_tags(tag__type_ids[0] for tag__type_ids in created_tag__type_ids)
    
