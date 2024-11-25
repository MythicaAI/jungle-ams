#!/usr/bin/env python3

#
# Test the helm domains for existing lets-encrypt
# challenge support
#


import asyncio
import aiohttp
from typing import List, Dict
import yaml
from urllib.parse import urljoin
import sys


async def check_domain(
        session: aiohttp.ClientSession,
        domain: str) -> Dict[str, any]:
    """
    Check a single domain for the ACME challenge file.

    Args:
        session: aiohttp client session
        domain: domain to check

    Returns:
        Dict containing domain, status, and response info
    """
    url = urljoin(f"http://{domain}", "/.well-known/acme-challenge/ping.txt")
    result = {
        "domain": domain,
        "url": url,
        "status": None,
        "error": None,
        "response": None
    }

    try:
        async with session.get(url, timeout=10) as response:
            result["status"] = response.status
            result["response"] = await response.text()
    except asyncio.TimeoutError:
        result["error"] = "Timeout"
    except aiohttp.ClientError as e:
        result["error"] = f"Connection error: {str(e)}"
    except Exception as e:
        result["error"] = f"Unexpected error: {str(e)}"

    return result


async def check_all_domains(domains: List[str]) -> List[Dict[str, any]]:
    """
    Check all domains concurrently.

    Args:
        domains: List of domains to check

    Returns:
        List of results for each domain
    """
    async with aiohttp.ClientSession() as session:
        tasks = [check_domain(session, domain) for domain in domains]
        return await asyncio.gather(*tasks)


def load_domains_from_yaml(file_path: str) -> List[str]:
    """
    Load domains from a YAML file.

    Args:
        file_path: Path to YAML file

    Returns:
        List of domains
    """
    try:
        with open(file_path, 'r') as file:
            data = yaml.safe_load(file)
            return data.get('domains', [])
    except Exception as e:
        print(f"Error loading YAML file: {e}")
        sys.exit(1)


def print_results(results: List[Dict[str, any]]):
    """
    Print the results in a formatted way.

    Args:
        results: List of domain check results
    """
    print("\nDomain Check Results:")
    print("-" * 80)

    for result in results:
        print(f"\nDomain: {result['domain']}")
        print(f"URL: {result['url']}")
        if result['error']:
            print(f"Error: {result['error']}")
        else:
            print(f"Status: {result['status']}")
            # Truncate long responses
            print(f"Response: {result['response'][:100]}...")
        print("-" * 80)


async def main():
    # Load domains from the YAML file
    values_file_name = sys.argv[1]
    domains = load_domains_from_yaml(values_file_name)

    if not domains:
        print("No domains found in the YAML file")
        return

    print(f"Checking {len(domains)} domains...")
    results = await check_all_domains(domains)
    print_results(results)

if __name__ == "__main__":
    asyncio.run(main())
