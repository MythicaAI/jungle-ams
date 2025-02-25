#include "interrupt.h"
#include "streaming.h"
#include "types.h"

#include <OP/OP_Director.h>
#include <OP/OP_OTLLibrary.h>
#include <GU/GU_Detail.h>
#include <SOP/SOP_Node.h>
#include <MOT/MOT_Director.h>
#include <PI/PI_ResourceManager.h>
#include <UT/UT_Main.h>
#include <iostream>

static const int COOK_TIMEOUT_SECONDS = 1;

static void
usage(const char *program)
{
    std::cerr << "Usage: " << program << " <read_fd> <write_fd>\n";
    std::cerr << "Reads JSON messages from read_fd, processes them, writes results to write_fd\n";
    UT_Exit::fail();
}

bool process_message(const std::string& message, MOT_Director* boss, StreamWriter& writer)
{
    Request request;
    if (!util::parse_request(message, request))
    {
        std::cerr << "Failed to parse request" << std::endl;
        return false;
    }

    if (request.op != "cook")
    {
        std::cerr << "Unsupported operation: " << request.op << std::endl;
        return false;
    }

    const char* output_bgeo = "output.bgeo";

    // Load the library
    OP_OTLManager& manager = boss->getOTLManager();
    manager.installLibrary(request.hda_file.c_str());

    int library_index = manager.findLibrary(request.hda_file.c_str());
    if (library_index < 0)
    {
        std::cerr << "Failed to find library: " << request.hda_file << std::endl;
        return false;
    }

    // Get the actual library from the index
    OP_OTLLibrary* library = manager.getLibrary(library_index);
    if (!library)
    {
        std::cerr << "Failed to get library at index " << library_index << std::endl;
        return false;
    }

    int num_definitions = library->getNumDefinitions();
    if (request.definition_index >= num_definitions)
    {
        std::cerr << "Definition index out of range" << std::endl;
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

    std::cout << "Worker: Cooking node type " << node_type << std::endl;

    // Find the root /obj network
    OP_Network* obj = (OP_Network*)boss->findNode("/obj");
    if (!obj)
    {
        std::cerr << "Failed to find obj network" << std::endl;
        return false;
    }

    // Create geo node
    OP_Network* geo_node = (OP_Network*)obj->createNode("geo", "processor_parent");
    if (!geo_node || !geo_node->runCreateScript())
    {
        std::cerr << "Failed to create geo node" << std::endl;
        return false;
    }

    // Create the SOP node
    OP_Node* node = geo_node->createNode(node_type.c_str(), "processor");
    if (!node || !node->runCreateScript())
    {
        std::cerr << "Failed to create node of type: " << node_type << std::endl;
        return false;
    }

    // Cook the node
    OP_Context context(0.0);
    if (!node->cook(context))
    {
        std::cerr << "Failed to cook node" << std::endl;
        return false;
    }

    // Get geometry from the node
    SOP_Node* sop = node->castToSOPNode();
    if (!sop)
    {
        std::cerr << "Node is not a SOP node" << std::endl;
        return false;
    }

    const GU_Detail* gdp = sop->getCookedGeo(context);
    if (!gdp)
    {
        std::cerr << "Failed to get cooked geometry" << std::endl;
        return false;
    }

    // Save to bgeo
    if (!gdp->save(output_bgeo, nullptr))
    {
        std::cerr << "Failed to save bgeo file" << std::endl;
        return false;
    }

    writer.file(output_bgeo);

    std::cout << "Worker: Successfully saved bgeo file" << std::endl;
    return true;
}

int
theMain(int argc, char *argv[])
{
    if (argc != 3)
        usage(argv[0]);

    StreamReader reader(std::stoi(argv[1]));
    StreamWriter writer(std::stoi(argv[2]));

    // Initialize Houdini
    MOT_Director* boss = new MOT_Director("standalone");
    OPsetDirector(boss);
    PIcreateResourceManager();

    InterruptHandler interruptHandler(writer);
    UT_Interrupt* interrupt = UTgetInterrupt();
    interrupt->setInterruptHandler(&interruptHandler);
    interrupt->setEnabled(true);

    // Process messages from pipe
    while (true)
    {
        std::cout << "Worker: Waiting for message" << std::endl;

        std::string message;
        if (!reader.readMessage(message))
        {
            std::cerr << "Failed to read message" << std::endl;
            return 1;
        }

        std::cout << "Worker: Received message: " << message << std::endl;

        writer.state(AutomationState::Start);

        interruptHandler.start_timeout(COOK_TIMEOUT_SECONDS);
        bool result = process_message(message, boss, writer);

        writer.state(AutomationState::End);
    }

    return 0;
}

UT_MAIN(theMain);