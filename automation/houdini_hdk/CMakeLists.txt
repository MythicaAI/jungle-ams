cmake_minimum_required(VERSION 3.6)
project(Houdini_Worker)

# Locate Houdini
find_package(Houdini REQUIRED)

# Add the executable
set(executable_name houdini_worker)
add_executable(${executable_name}
    houdini_worker.C
)

# Link against Houdini
target_link_libraries(${executable_name} 
    Houdini 
    HoudiniThirdParty
)

# Configure target properties
houdini_configure_target(${executable_name}) 