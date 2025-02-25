cmake_minimum_required(VERSION 3.10)
project(houdini_worker)

# Set Houdini toolkit path from environment variable
set(CMAKE_PREFIX_PATH $ENV{HFS}/toolkit/cmake)

# Locate Houdini
find_package(Houdini REQUIRED)

# Gather source files
file(GLOB SOURCES "src/*.C")

# Add the executable
set(executable_name houdini_worker)
add_executable(${executable_name} ${SOURCES})

# Link against Houdini
target_link_libraries(${executable_name} 
    Houdini 
    HoudiniThirdParty
)

# Configure target properties
houdini_configure_target(${executable_name}) 