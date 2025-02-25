#include <OP/OP_Director.h>
#include <GU/GU_Detail.h>
#include <SOP/SOP_Node.h>
#include <MOT/MOT_Director.h>
#include <PI/PI_ResourceManager.h>
#include <UT/UT_Exit.h>
#include <UT/UT_Interrupt.h>
#include <UT/UT_Main.h>
#include <chrono>
#include <iostream>

static const int COOK_TIMEOUT_SECONDS = 1;

static void
usage(const char *program)
{
    std::cerr << "Usage: " << program << " <read_fd> <write_fd>\n";
    std::cerr << "Reads JSON messages from read_fd, processes them, writes results to write_fd\n";
    UT_Exit::fail();
}

class StatusHandler : public UT_InterruptHandler
{
public:
    StatusHandler() : start_time(std::chrono::steady_clock::now()) {}

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

        auto now = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now - start_time).count();
        
        if (elapsed >= COOK_TIMEOUT_SECONDS)
        {
            std::cout << "Interrupting after " << elapsed << " seconds" << std::endl;
            intr->interrupt();
        }
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

private:
    std::chrono::steady_clock::time_point start_time;
};


int process_message(const std::string& message, MOT_Director* boss)
{
    const char* hda_path = "test_cube.hda";
    const char* node_type = "test_cube";
    const char* output_bgeo = "output.bgeo";

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


    // Cook the node
    OP_Context context(0.0);
    if (!node->cook(context))
    {
        std::cerr << "Failed to cook node" << std::endl;
        return 1;
    }

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

int
theMain(int argc, char *argv[])
{
    if (argc != 3)
        usage(argv[0]);

    int read_fd = std::stoi(argv[1]);
    int write_fd = std::stoi(argv[2]);

    // Initialize Houdini
    MOT_Director* boss = new MOT_Director("standalone");
    OPsetDirector(boss);
    PIcreateResourceManager();

    StatusHandler status_handler;
    UT_Interrupt* interrupt = UTgetInterrupt();
    interrupt->setInterruptHandler(&status_handler);
    interrupt->setEnabled(true);

    // Process messages from pipe
    while (true)
    {
        std::string buffer;
        std::string message;
        char chunk[4096];
        ssize_t bytes_read;
        while ((bytes_read = read(read_fd, chunk, sizeof(chunk))) > 0) 
        {
            buffer.append(chunk, bytes_read);
            
            // Look for newline indicating complete message
            size_t newline_pos = buffer.find('\n');
            if (newline_pos != std::string::npos) {
                // Extract message up to newline
                message = buffer.substr(0, newline_pos);
                buffer.erase(0, newline_pos + 1);

                std::cout << "Received message: " << message << std::endl;                
                break;
            }
        }

        if (bytes_read < 0) {
            std::cerr << "Error reading from pipe" << std::endl;
            return 1;
        }

        int result = process_message(message, boss);
        assert(result == 0);
        message.clear();

        // Send hardcoded response
        std::string response = "{\"op\":\"cook_response\",\"status\":\"success\"}\n";
        write(write_fd, response.c_str(), response.length());
    }

    return 0;
}

UT_MAIN(theMain);