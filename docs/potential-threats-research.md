# Potential Threats and Mitigation Strategies for File Uploads

This document outlines potential threats and vulnerabilities in the context of uploading files, handling requests, and processing files (e.g., Houdini `.hda` files). The threats are categorized based on the stages of the workflow, along with mitigation strategies.

---

## Summary of Investigation

### Mitigation Strategies

#### File Upload Security
- **Validate file types and extensions. (we do not validate archives)**  
- **Scan uploaded files for malware.**  
- **Set size limits for uploads.**  
- **Use sandbox environments for processing files. (we use **Docker**) ✅**

#### Request Validation
- **Sanitize all user inputs. (Like filename we do it, contenthash SQL-injection)**  
- **Use parameterized queries to prevent SQL injection. (we do, but need reassurance)**  
- **Implement rate limiting to prevent DoS attacks.**

#### File Processing Security
- **Validate and sanitize Houdini `.hda` files and job parameters.**  
- **Use resource limits to prevent resource exhaustion.**  
- **Run file processing in isolated environments (we use **containers**) ✅**

#### Storage and Access Controls
- **Encrypt sensitive files and metadata. ✅**  
- **Implement strict access controls for stored files. [GitHub PR #475](https://github.com/MythicaAI/infra/pull/475/files) ⚠️ PR is on hold**  
- **Use secure URLs with expiration for file downloads.**

#### Network Security
- **Use **HTTPS** for all communication. ✅**  
- **Implement firewalls and intrusion detection systems.**

#### Regular Updates and Monitoring
- **Keep all software and dependencies up to date.**  
- **Monitor logs for suspicious activity. ⚠️**

---

## The Extensive Investigation and Approaches to Resolve

### 1. File Upload Threats
- **Malicious File Uploads:**
  - Virus-infected files.
  - Executable files disguised as other formats.
  - Oversized files causing DoS attacks.
  - **Zip bombs** that expand to massive sizes.
  - Malicious `.hda` files exploiting **Houdini** or its **Python API**.

#### Approaches to Resolve:
- **Archive Validation:**
  - Unpack and validate archives (`.zip`, `.rar`, `.7z`, etc.).
  - Check file sizes and extensions using iterators.
  - Raise our **Discord** alert if the number of files exceeds `MAX_COUNT_OF_FILES`.

- **Timeout for File Processing:**
  - Prevent long-running decompression.
  - Use **async tasks** or background jobs for large files.

- **Virus Scanning:**
  - Use **ClamAV** or other scanners to detect malware.

- **Streaming Instead of Full File Read:**
  - Process files in chunks to reduce memory usage.

- **Rate-Limiting Upload Requests:**
  - Example: `@app.post("/upload", dependencies=[Depends(RateLimiter(times=5, seconds=60))])`.

- **User Quotas and Monitoring:**
  - Set per-user file size quotas.
  - Log and alert abnormal upload behavior.

---

### 2. Preventing Embedded Python Code Execution in `.hda` Files
- **Restrict External Access:**
  - Limit **Houdini's** network access to prevent unauthorized downloads/uploads.

- **Analyze `.hda` Files:**
  - Use **Houdini tools** like `hda.editAsset()` to inspect scripts and parameters.
  - Look for suspicious functions like `os.system()`, `subprocess.Popen()`, `exec()`, etc.

- **Safe Mode and Environment Restrictions:**
  - Launch **Houdini** with scripting disabled: `HOUDINI_DISABLE_SCRIPTING=1 houdini`.
  - Restrict file access using **AppArmor** or similar tools.

- **Monitor File Access:**
  - Use tools like **strace** to detect unauthorized file reads/writes.

#### Example: Python Script to Analyze `.hda` Files
```python
import hou
import re

HDA_PATH = "/path/to/suspicious.hda"

def analyze_hda(hda_path):
    """Analyze a Houdini .hda file for suspicious activity."""
    try:
        asset_defs = hou.hda.definitionsInFile(hda_path)
        for asset in asset_defs:
            print(f"Analyzing HDA: {asset.nodeTypeName()}")
            sections = asset.sections()
            for section_name, section_data in sections.items():
                content = section_data.contents()
                if re.search(r'\b(os\.system|subprocess\.Popen|exec|eval|requests\.get)\b', content):
                    print(f"⚠️ Suspicious code found in section: {section_name}")
    except Exception as e:
        print(f"Error analyzing HDA: {e}")

if __name__ == "__main__":
    analyze_hda(HDA_PATH)
```

---

## 3. Preventing Flooding Requests (DDoS/DoS)

### **Rate-Limiting**
Use libraries like **slowapi** to limit requests per user.

```python
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.add_middleware(SlowAPIMiddleware)

@app.post("/upload")
@limiter.limit("5/minute")
```

### **Block Invalid HTTP Methods**
Add rules in **NGINX** to reject unsafe HTTP methods:

```nginx
if ($request_method !~ ^(GET|POST|DELETE|PUT|PATCH|OPTIONS)$) {
    return 405;
}
```

### **Reject Unsafe File Names**
- Reject file names containing `..`, `/`, `\`, or special characters.
- Use `os.path.join()` to prevent directory traversal.

---

## 4. Secure File Processing Against Untrusted Dependencies

### **Dependency Audits**
Use tools like **pip-audit** to check for vulnerabilities:

```bash
pip install pip-audit
pip-audit
```

### **Validate External Requests**
Use **pydantic** to validate URLs:

```python
from pydantic import BaseModel, HttpUrl

class FileUploadRequest(BaseModel):
    filename: str
    file_url: HttpUrl
```

---

## 5. Additional Security Measures

### **Restrict Houdini's Network Access**
Block network access using **iptables**:

```bash
sudo iptables -A OUTPUT -p tcp --dport 80 -m owner --uid-owner houdini -j DROP
sudo iptables -A OUTPUT -p tcp --dport 443 -m owner --uid-owner houdini -j DROP
```

### **Override Dangerous Python Functions**
Disable dangerous Python functions to prevent misuse:

```python
import builtins

# Disable dangerous functions
builtins.open = lambda *args, **kwargs: None
builtins.exec = lambda *args, **kwargs: None
builtins.eval = lambda *args, **kwargs: None

print("⚠️ Security Mode: File Access and Execution Disabled")
```

---

## 6. Finish Pending Tasks
- Complete **PR #475** to restrict access for unauthorized users.
- Investigate malformed HTTP requests and block them.



























