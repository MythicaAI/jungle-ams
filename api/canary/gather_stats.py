import argparse
import logging
from typing import Optional

import requests
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)


def parse_args():
    parser = argparse.ArgumentParser(description="Canary test for jobs")

    parser.add_argument(
        "-e", "--endpoint",
        help="API endpoint",
        required=True
    )

    parser.add_argument(
        "-k", "--api_key",
        help="API access key",
        required=True
    )

    return parser.parse_args()


def start_session(endpoint: str, api_key: str, headers={}) -> str:
    url = f"{endpoint}/sessions/key/{api_key}"
    response = requests.get(url, timeout=10, headers=headers)
    response.raise_for_status()

    result = response.json()
    return result['token']


def get_top_assets(endpoint: str, headers={}) -> list:
    url = f"{endpoint}/assets/top"
    response = requests.get(url, timeout=60, headers=headers)
    response.raise_for_status()
    return response.json()


def remove_duplicate_assets(assets: list) -> list:
    versions_by_name = {}
    for asset in assets:
        name = asset['name']
        if name not in versions_by_name:
            versions_by_name[name] = asset
        else:
            current = versions_by_name[name]['version']
            new = asset['version']
            if new > current:
                log.info(f"Replacing duplicate asset {name} version {current} with version {new}")
                versions_by_name[name] = asset
            else:
                log.info(f"Skipping duplicate asset {name} version {new} (keeping version {current})")

    return list(versions_by_name.values())


def get_hda_files(assets: list) -> list[str]:
    hda_files = []
    for asset in assets:
        files = asset['contents'].get('files', [])
        for file in files:
            if file['file_name'].endswith('.hda'):
                hda_files.append(file['file_id'])
    return hda_files


def get_job_defs_by_asset(endpoint: str, asset_id: str, version: list[int], headers={}) -> list:
    major, minor, patch = version
    url = f"{endpoint}/jobs/definitions/by_asset/{asset_id}/versions/{major}/{minor}/{patch}"
    response = requests.get(url, timeout=60, headers=headers)
    response.raise_for_status()
    return response.json()


def get_job_defs(endpoint: str, assets: list, headers={}) -> tuple[list, int]:
    error_count = 0
    job_defs = []
    for asset in assets:
        asset_id = asset['asset_id']
        version = asset['version']
        name = asset['name']
        try:
            asset_job_defs = get_job_defs_by_asset(endpoint, asset_id, version, headers)
            job_defs.extend(asset_job_defs)
            log.info(f"Found {len(asset_job_defs)} job definitions for {name}")
        except Exception as e:
            error_count += 1
            log.error(f"Failed to get job defs for {asset_id}: {e}")
            continue
    return job_defs, error_count


def get_jobs_by_asset_version(endpoint: str, asset_id: str, version: list[int], headers={}) -> list:
    major, minor, patch = version
    url = f"{endpoint}/jobs/by_asset/{asset_id}/versions/{major}/{minor}/{patch}"
    response = requests.get(url, timeout=60, headers=headers)
    response.raise_for_status()
    return response.json()


def get_jobs(endpoint: str, assets: list, headers={}) -> tuple[list, int]:
    error_count = 0
    jobs = []
    for asset in assets:
        asset_id = asset['asset_id']
        version = asset['version']
        name = asset['name']
        try:
            asset_jobs = get_jobs_by_asset_version(endpoint, asset_id, version, headers)
            jobs.extend(asset_jobs)
            log.info(f"Found {len(asset_jobs)} jobs for {name}")
        except Exception as e:
            error_count += 1
            log.error(f"Failed to get jobs for {name}: {e}")
            continue
    return jobs, error_count


def run_test(endpoint: str, api_key: str):
    log.info("Starting gather stats")

    token = start_session(endpoint, api_key)
    headers = {"Authorization": f"Bearer {token}"}

    top_assets = get_top_assets(endpoint, headers)
    log.info(f"Found assets: {len(top_assets)}")

    filtered_assets = remove_duplicate_assets(top_assets)
    log.info(f"Found assets: {len(filtered_assets)}")

    hda_files = get_hda_files(filtered_assets)
    log.info(f"Found HDA files: {len(hda_files)}")

    job_defs, job_defs_error_count = get_job_defs(endpoint, filtered_assets, headers)
    log.info(f"Found job definitions: {len(job_defs)}")

    jobs, jobs_error_count = get_jobs(endpoint, filtered_assets, headers)
    log.info(f"Found jobs: {len(jobs)}")

    api_error_count = job_defs_error_count + jobs_error_count

    log.info("--------------------------------")
    log.info("Results")
    log.info(f"HDA files: {len(hda_files)}")
    log.info(f"Job definitions: {len(job_defs)}")
    log.info(f"Jobs: {len(jobs)}")
    log.info("--------------------------------")
    log.info(f"API errors: {api_error_count}")
    log.info(f"Duplicate assets: {len(top_assets) - len(filtered_assets)}")
    log.info("--------------------------------")


def main():
    args = parse_args()
    run_test(args.endpoint, args.api_key)


if __name__ == '__main__':
    main()
