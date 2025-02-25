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
static const int PRIORITY_THRESHOLD = 1;

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
    StatusHandler(const std::function<void(const std::string&, const std::string&)>& send_response)
        : start_time(std::chrono::steady_clock::now()), send_response(send_response) {}

    virtual void start(UT_Interrupt *intr,
                      const UT_InterruptMessage &msg,
                      const UT_StringRef &main_optext,
                      int priority) override 
    {
        if (priority >= PRIORITY_THRESHOLD)
        {
            std::string message = msg.buildMessage().toStdString();
            send_response("status", message);
        }
    }
    
    virtual void push(UT_Interrupt *intr,
                     const UT_InterruptMessage &msg,
                     const UT_StringRef &main_optext,
                     int priority) override 
    {
        if (priority >= PRIORITY_THRESHOLD)
        {
            std::string message = msg.buildMessage().toStdString();
            send_response("status", message);
        }

        auto now = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now - start_time).count();
        
        if (elapsed >= COOK_TIMEOUT_SECONDS)
        {
            send_response("error", "Timeout");
            intr->interrupt();
        }
    }
    
    virtual void busyCheck(bool interrupted,
                          float percent,
                          float longpercent) override 
    {
        send_response("progress", std::to_string(percent) + " " + std::to_string(longpercent));
    }
    
    virtual void pop() override {}
    virtual void stop() override {}
    virtual void interruptAllowed(bool allowed, bool allow_ui) override {}

private:
    std::chrono::steady_clock::time_point start_time;
    std::function<void(const std::string&, const std::string&)> send_response;
};

bool process_message(const std::string& message, MOT_Director* boss)
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
    OP_Node* node = geo_node->createNode(node_type, "processor");
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

    std::cout << "Successfully saved bgeo file" << std::endl;
    return true;
}

int
theMain(int argc, char *argv[])
{
    if (argc != 3)
        usage(argv[0]);

    int read_fd = std::stoi(argv[1]);
    int write_fd = std::stoi(argv[2]);

    auto send_response = [write_fd](const std::string& op, const std::string& data)
    {
        std::cout << "Worker: Sending response: " << op << " " << data << std::endl;
        std::string response = std::string("{\"op\":\"") + op + "\",\"data\":\"" + data + "\"}\n";
        write(write_fd, response.c_str(), response.length());
    };

    // Initialize Houdini
    MOT_Director* boss = new MOT_Director("standalone");
    OPsetDirector(boss);
    PIcreateResourceManager();

    StatusHandler status_handler(send_response);
    UT_Interrupt* interrupt = UTgetInterrupt();
    interrupt->setInterruptHandler(&status_handler);
    interrupt->setEnabled(true);

    // Process messages from pipe
    while (true)
    {
        std::cout << "Worker: Waiting for message" << std::endl;

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

                std::cout << "Worker: Received message: " << message << std::endl;
                break;
            }
        }

        if (bytes_read < 0) {
            std::cerr << "Error reading from pipe" << std::endl;
            return 1;
        }

        bool result = process_message(message, boss);
        message.clear();

        send_response("cook_response", result ? "success" : "failure");
    }

    return 0;
}

UT_MAIN(theMain);