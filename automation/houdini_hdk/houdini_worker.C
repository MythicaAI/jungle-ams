#include <OP/OP_Director.h>
#include <GU/GU_Detail.h>
#include <SOP/SOP_Node.h>
#include <MOT/MOT_Director.h>
#include <PI/PI_ResourceManager.h>
#include <UT/UT_Exit.h>
#include <UT/UT_Interrupt.h>
#include <UT/UT_Main.h>
#include <iostream>

static void
usage(const char *program)
{
    std::cerr << "Usage: " << program << " [-h] <hda_path> <node_type> <output_bgeo>\n";
    std::cerr << "Loads HDA, creates node, cooks it and saves to bgeo\n";
    UT_Exit::fail();
}

class StatusHandler : public UT_InterruptHandler
{
public:
    virtual void start(UT_Interrupt *intr,
                      const UT_InterruptMessage &msg,
                      const UT_StringRef &main_optext,
                      int priority) override 
    {
        std::cout << "Operation started: " << priority << " " << intr->getOpDepth() << " " << msg.buildMessage() << " " << main_optext << std::endl;
    }
    
    virtual void push(UT_Interrupt *intr,
                     const UT_InterruptMessage &msg,
                     const UT_StringRef &main_optext,
                     int priority) override 
    {
        std::cout << "Operation pushed: " << priority << " " << intr->getOpDepth() << " " << msg.buildMessage() << " " << main_optext << std::endl;
    }
    
    virtual void busyCheck(bool interrupted,
                          float percent,
                          float longpercent) override 
    {
        std::cout << "Progress: " << interrupted << " " << percent << " " << longpercent << "%" << " " << std::endl;
    }
    
    virtual void pop() override {}
    virtual void stop() override {}
    virtual void interruptAllowed(bool allowed, bool allow_ui) override {}
};

int
theMain(int argc, char *argv[])
{
    if (argc != 4)
        usage(argv[0]);

    const char* hda_path = argv[1];
    const char* node_type = argv[2];
    const char* output_bgeo = argv[3];

    // Initialize Houdini
    MOT_Director* boss = new MOT_Director("standalone");
    OPsetDirector(boss);
    PIcreateResourceManager();

    // Load and install the HDA
    OP_OTLManager& manager = boss->getOTLManager();
    manager.installLibrary(hda_path);

    // Find the root /obj network
    OP_Network* obj = (OP_Network*)boss->findNode("/obj");
    if (!obj)
    {
        std::cerr << "Failed to find obj network" << std::endl;
        return 1;
    }

    // Create geo node
    OP_Network* geo_node = (OP_Network*)obj->createNode("geo", "processor_parent");
    if (!geo_node || !geo_node->runCreateScript())
    {
        std::cerr << "Failed to create geo node" << std::endl;
        return 1;
    }

    // Create the SOP node
    OP_Node* node = geo_node->createNode(node_type, "processor");
    if (!node || !node->runCreateScript())
    {
        std::cerr << "Failed to create node of type: " << node_type << std::endl;
        return 1;
    }

    // Install status handler
    StatusHandler status_handler;
    UT_Interrupt* interrupt = UTgetInterrupt();
    interrupt->setInterruptHandler(&status_handler);
    interrupt->setEnabled(true);

    // Cook the node
    OP_Context context(0.0);
    if (!node->cook(context))
    {
        std::cerr << "Failed to cook node" << std::endl;
        return 1;
    }

    // Remove status handler
    interrupt->setInterruptHandler(nullptr);

    // Get geometry from the node
    SOP_Node* sop = node->castToSOPNode();
    if (!sop)
    {
        std::cerr << "Node is not a SOP node" << std::endl;
        return 1;
    }

    const GU_Detail* gdp = sop->getCookedGeo(context);
    if (!gdp)
    {
        std::cerr << "Failed to get cooked geometry" << std::endl;
        return 1;
    }

    // Save to bgeo
    if (!gdp->save(output_bgeo, nullptr))
    {
        std::cerr << "Failed to save bgeo file" << std::endl;
        return 1;
    }

    std::cout << "Successfully saved bgeo file" << std::endl;
    return 0;
}

UT_MAIN(theMain);