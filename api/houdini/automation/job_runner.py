import argparse
import json
import os
import sys

from export_mesh import export_mesh
from interface import interface

def parse_args():
    parser = argparse.ArgumentParser(description="Job runner for processing Houdini jobs")
    parser.add_argument(
        "--pipe-read",
        type=int,
        required=True,
        help="File descriptor for reading from the parent process",
    )
    parser.add_argument(
        "--pipe-write",
        type=int,
        required=True,
        help="File descriptor for writing to the parent process",
    )
    return parser.parse_args()

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
    args = parse_args()

    print("Job runner listening for jobs")
    with os.fdopen(args.pipe_read) as pipe:
        while True:
            job = json.loads(pipe.readline().strip())
            if job is None:
                break

            print(f"Executing job: {job}")
            process_job(job)
            os.write(args.pipe_write, "Job completed".encode())

    print("Job runner shutting down")

if __name__ == "__main__":
    main()