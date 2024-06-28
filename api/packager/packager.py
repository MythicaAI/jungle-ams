import argparse
import datetime
import os
import zipfile


def create_arg_parser():
    parser = argparse.ArgumentParser(description="Directory Packager")

    parser.add_argument(
        "-i", "--input",
        required=True,
        help="Input directory to package"
    )

    parser.add_argument(
        "-n", "--name",
        required=True,
        help="Name of the package"
    )

    parser.add_argument(
        "-v", "--version",
        required=True,
        help="Version of the package"
    )

    parser.add_argument(
        "-a", "--algorithm",
        default="pkzip",
        choices=["pkzip", "gzip", "bzip2", "lzma"],
        help="Compression algorithm (default: pkzip)"
    )

    parser.add_argument(
        "-o", "--output",
        help="Output directory (default: current directory)"
    )

    return parser


def package_directory(input_dir, output_file, algorithm):
    compression = zipfile.ZIP_DEFLATED if algorithm == "pkzip" else zipfile.ZIP_STORED
    with zipfile.ZipFile(output_file, 'w', compression=compression) as zipf:
        for root, _, files in os.walk(input_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, input_dir)
                zipf.write(file_path, arcname)


def main():
    parser = create_arg_parser()
    args = parser.parse_args()

    input_dir = args.input
    name = args.name
    version = args.version
    algorithm = args.algorithm

    if not os.path.isdir(input_dir):
        print(f"Error: {input_dir} is not a valid directory")
        return

    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    output_filename = f"{name}-{version}-{timestamp}.zip"

    if args.output:
        output_dir = args.output
    else:
        output_dir = os.getcwd()

    output_file = os.path.join(output_dir, output_filename)

    print(f"Packaging directory: {input_dir}")
    print(f"Package name: {name}")
    print(f"Package version: {version}")
    print(f"Using compression algorithm: {algorithm}")
    print(f"Output file: {output_file}")

    package_directory(input_dir, output_file, algorithm)
    print(f"Package created successfully: {output_file}")


if __name__ == "__main__":
    main()
