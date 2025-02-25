ARG HOUDINI_VERSION=20.5.370

FROM aaronsmithtv/hbuild:${HOUDINI_VERSION}-base

# Install build dependencies
RUN apt-get update && apt-get install -y \
    tcsh \
    g++ \
    cmake \
    mesa-common-dev \
    libglu1-mesa-dev \
    libxi-dev \
    && rm -rf /var/lib/apt/lists/*

# Set HDK environment variables
ENV HFS=/opt/houdini/build
ENV PATH=${HFS}/bin:${PATH}

# Create HDK example directory
RUN mkdir -p /src/HDK
WORKDIR /src/HDK

# Copy the source and CMake files
COPY src/ src/
COPY CMakeLists.txt .

# Create build directory and build
RUN mkdir build && cd build && \
    cmake -DCMAKE_PREFIX_PATH=${HFS}/toolkit/cmake .. && \
    cmake --build .

# Create mythica directory and copy artifacts
RUN mkdir -p /mythica
COPY run.sh /mythica/
COPY test_cube.hda /mythica
RUN chmod +x /mythica/run.sh
RUN cp build/houdini_worker /mythica/

WORKDIR /mythica
