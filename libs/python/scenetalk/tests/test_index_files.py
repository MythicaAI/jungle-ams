from pathlib import Path

from files import Cache

self_path = Path(__file__).parent


def test_cache():
    cache = Cache(base_path=self_path / '..' / Path('test_dir'))
    assert cache.index_files(ignore=['client_dir/']) == 4, "only index parent file systems"
    assert cache is not None
    rel_path = Path('sub_dir/SM_room_explore_01_a.usd')

    assert cache.find_relative_path(rel_path) is not None, "cache hit by path"
    assert cache.find_relative_path(Path('some/foo.txt')) is None, "cache miss by path"

    file_ref = cache.find_relative_path(rel_path)
    assert file_ref.content_hash is not None, "cache hit by hash"

    by_content_hash = cache.find_content_hash(file_ref.content_hash)
    assert type(by_content_hash) is list, "cache hit type check"
    assert len(by_content_hash) == 1

    assert id(file_ref) == id(cache.find_content_hash(file_ref.content_hash)[0]), "cache hit, same object"
    assert cache.find_content_hash('foo') is None, "cache miss"

    client_cache = Cache(self_path / '..' / Path('test_dir/sub_dir/client_dir'), parent=cache)
    client_cache.index_files()
    assert client_cache is not None
    assert client_cache.parent == cache

    assert id(client_cache.find_relative_path(rel_path)) == id(
        cache.find_relative_path(rel_path)), "2 cache hits, same object"
    assert client_cache.find_relative_path(Path('hello.txt')) is not None, "cache hit"
    assert cache.find_relative_path(Path('hello.txt')) is None, "cache miss from child cache"
