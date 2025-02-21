from pathlib import Path

from files import index_files


def test_cache():
    cache = index_files(Path('test_dir'))
    assert cache is not None
    assert cache.by_relative_path is not None
    assert cache.by_content_hash is not None
    rel_path = Path('sub_dir/SM_room_explore_01_a.usd')
    assert rel_path in cache.by_relative_path
    assert 'some/foo.txt' not in cache.by_relative_path
    file_ref = cache.by_relative_path[rel_path]
    assert file_ref.content_hash is not None
    assert file_ref.content_hash in cache.by_content_hash
    assert type(cache.by_content_hash[file_ref.content_hash]) is list
    assert len(cache.by_content_hash[file_ref.content_hash]) == 1
    assert id(file_ref) == id(cache.by_content_hash[file_ref.content_hash][0])
