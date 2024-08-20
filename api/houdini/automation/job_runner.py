import json
import os
import sys
from actions import export_mesh

def process_job(job):
    print(f"Child: Processing job: {job}")
    if job["type"] == "export_mesh":
        export_mesh(job["args"])
    else:
        print(f"Child: Unknown job type")
    print(f"Child: Process job completed")

def main():
    parent_to_child_read = int(sys.argv[1])
    child_to_parent_write = int(sys.argv[2])

    print(f"Child: Listening for jobs")
    with os.fdopen(parent_to_child_read) as pipe:
        while True:
            job_data = pipe.readline().strip()
            print(f"Child: Recieved data {job_data}")
            job = json.loads(job_data)
            if job:
                process_job(job)
            else:
                break

            os.write(child_to_parent_write, "Job completed".encode())

    os.close(parent_to_child_read)
    os.close(child_to_parent_write)
    print(f"Child: Closing process")

if __name__ == "__main__":
    main()