import json
import os
import sys

from export_mesh import export_mesh
from interface import interface

def process_job(job):
    type = job["type"]
    args = job["args"]
    if type == "export_mesh":
        export_mesh(args["hda-path"], args["output-path"], args["output-file-name"], args["format"], args["parms"])
    elif type == "interface":
        interface(args["hda-path"], args["output-path"], args["output-file-name"])
    else:
        print(f"Unknown job type: {type}")

def main():
    parent_to_child_read = int(sys.argv[1])
    child_to_parent_write = int(sys.argv[2])

    print("Job runner listening for jobs")
    with os.fdopen(parent_to_child_read) as pipe:
        while True:
            job = json.loads(pipe.readline().strip())
            if job is None:
                break

            print(f"Executing job: {job}")
            process_job(job)
            os.write(child_to_parent_write, "Job completed".encode())

    print("Job runner shutting down")
    os.close(parent_to_child_read)
    os.close(child_to_parent_write)

if __name__ == "__main__":
    main()