import re
import subprocess
from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class P4CommandResult:
    success: bool
    stdout: str
    stderr: str
    return_code: int
    command: str

    @property
    def error_details(self) -> Dict[str, str]:
        return {
            'Command': self.command,
            'Return Code': self.return_code,
            'Output': self.stdout or 'No output',
            'Stderr': self.stderr or 'No stderr',
        }

    @property
    def error_code_meaning(self) -> Optional[str]:
        p4_error_codes = {
            1: "Command syntax or usage error",
            2: "Connection error",
            3: "SSL connection error",
            4: "Access/authentication error",
            5: "Command failed (check stderr for details)",
            6: "Empty/invalid client workspace",
            8: "Connection timeout",
            10: "Client/server version mismatch"
        }
        return p4_error_codes.get(self.return_code, f"Unknown error {self.return_code}")

    @property
    def error_type(self) -> Optional[str]:
        if not self.stderr:
            return None

        stderr_lower = self.stderr.lower()
        if "password invalid" in stderr_lower:
            return "Authentication Error: Invalid password or ticket expired"
        elif "client unknown" in stderr_lower:
            return "Workspace Error: Client/workspace not found or invalid"
        elif "ssl handshake" in stderr_lower:
            return "SSL Error: SSL handshake failed - check SSL configuration"
        elif "connection refused" in stderr_lower:
            return "Connection Error: Server connection refused - check P4PORT"
        return None

    def long_error_description(self) -> str:
        if self.success:
            return ""

        return '\n'.join([
            "P4 Command Error Details:",
            "-" * 50,
            "\n".join([f"{key}: {value}" for key, value in self.error_details.items()]),
            f"\nError Code Meaning: {self.error_code_meaning}" if self.error_code_meaning else "",
            f"\nError Type: {self.error_type}" if self.error_type else ""])

    def short_error_description(self) -> str:
        if self.success:
            return ""
        return f"{self.stderr}, meaning: {self.error_code_meaning}, error type: {self.error_type}"


def run_p4_command(command: list, p4_env: Dict[str, str]) -> P4CommandResult:
    try:
        result = subprocess.run(
            command,
            env=p4_env,
            capture_output=True,
            text=True,
            check=True
        )
        return P4CommandResult(
            success=True,
            stdout=result.stdout.strip(),
            stderr=result.stderr.strip(),
            return_code=result.returncode,
            command=' '.join(command)
        )
    except subprocess.CalledProcessError as e:
        return P4CommandResult(
            success=False,
            stdout=e.stdout.strip() if hasattr(e, 'stdout') else '',
            stderr=e.stderr.strip() if hasattr(e, 'stderr') else '',
            return_code=e.returncode,
            command=' '.join(e.cmd)
        )
    except Exception as e:
        return P4CommandResult(
            success=False,
            stdout='',
            stderr=str(e).strip(),
            return_code=-1,
            command=' '.join(command)
        )


def parse_perforce_change(change_desc) -> Dict[str, str]:
    """Parse a Perforce change description into its components."""
    pattern = r"Change (\d+) on (\d{4}/\d{2}/\d{2}) by ([^@]+)@([^\s']+) '([^']+)'"
    match = re.match(pattern, change_desc)
    if match:
        change_number, date, username, workspace, description = match.groups()
        # Convert change number to int
        change_number = int(change_number)
        return {'change_number': change_number,
                'date': date,
                'username': username,
                'workspace': workspace,
                'description': description}
    else:
        raise ValueError("Invalid change description format")
