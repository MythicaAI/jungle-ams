#include "automation.h"
#include "streaming.h"
#include "types.h"

#include <OP/OP_Director.h>
#include <OP/OP_OTLLibrary.h>
#include <GU/GU_Detail.h>
#include <SOP/SOP_Node.h>
#include <MOT/MOT_Director.h>
#include <iostream>

namespace util
{

bool cook(MOT_Director* boss, Request& request, StreamWriter& writer)
{
    const char* output_file = "output.bgeo";

    // Load the library
    OP_OTLManager& manager = boss->getOTLManager();
    manager.installLibrary(request.hda_file.c_str());

    int library_index = manager.findLibrary(request.hda_file.c_str());
    if (library_index < 0)
    {
        writer.error("Failed to find library: " + request.hda_file);
        return false;
    }

    // Get the actual library from the index
    OP_OTLLibrary* library = manager.getLibrary(library_index);
    if (!library)
    {
        writer.error("Failed to get library at index " + std::to_string(library_index));
        return false;
    }

    int num_definitions = library->getNumDefinitions();
    if (request.definition_index >= num_definitions)
    {
        writer.error("Definition index out of range: " + std::to_string(request.definition_index));
        return false;
    }

    const OP_OTLDefinition& definition = library->getDefinition(request.definition_index);
    std::string node_type = definition.getName().toStdString();
    size_t first = node_type.find("::");
    if (first != std::string::npos)
    {
        size_t last = node_type.find("::", first + 2);
        
        if (last != std::string::npos)
        {
            node_type = node_type.substr(first + 2, last - (first + 2));
        }
        else
        {
            node_type = node_type.substr(first + 2);
        }
    }

    // Find the root /obj network
    OP_Network* obj = (OP_Network*)boss->findNode("/obj");
    if (!obj)
    {
        writer.error("Failed to find obj network");
        return false;
    }

    // Create geo node
    OP_Network* geo_node = (OP_Network*)obj->createNode("geo", "processor_parent");
    if (!geo_node || !geo_node->runCreateScript())
    {
        writer.error("Failed to create geo node");
        return false;
    }

    // Create the SOP node
    OP_Node* node = geo_node->createNode(node_type.c_str(), "processor");
    if (!node || !node->runCreateScript())
    {
        writer.error("Failed to create node of type: " + node_type);
        return false;
    }

    // Cook the node
    OP_Context context(0.0);
    if (!node->cook(context))
    {
        writer.error("Failed to cook node");
        return false;
    }

    // Get geometry from the node
    SOP_Node* sop = node->castToSOPNode();
    if (!sop)
    {
        writer.error("Node is not a SOP node");
        return false;
    }

    const GU_Detail* gdp = sop->getCookedGeo(context);
    if (!gdp)
    {
        writer.error("Failed to get cooked geometry");
        return false;
    }

    // Save to bgeo
    if (!gdp->save(output_file, nullptr))
    {
        writer.error("Failed to save bgeo file");
        return false;
    }

    writer.file(output_file);
}

}
