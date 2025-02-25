#include <OP/OP_Director.h>
#include <OP/OP_OTLLibrary.h>
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

enum class AutomationState
{
    Start,
    End
};

class StreamWriter
{
public:
    StreamWriter(int fd) : m_fd(fd) {}

    void state(AutomationState state)
    {
        writeToStream("automation", state == AutomationState::Start ? "start" : "end");
    }

    void status(const std::string& message)
    {
        writeToStream("status", message);
    }

    void error(const std::string& message)
    {
        writeToStream("error", message);
    }

    void file(const std::string& path)
    {
        writeToStream("file", path);
    }

private:
    void writeToStream(const std::string& op, const std::string& data)
    {
        std::cout << "Worker: Sending response: " << op << " " << data << std::endl;
        std::string json = "{\"op\":\"" + op + "\",\"data\":\"" + data + "\"}\n";
        write(m_fd, json.c_str(), json.size());
    }

    int m_fd;
};

class StatusHandler : public UT_InterruptHandler
{
public:
    StatusHandler(StreamWriter& writer)
        : m_writer(writer) {}

    void reset_timeout()
    {
        start_time = std::chrono::steady_clock::now();
    }

    virtual void start(UT_Interrupt *intr,
                      const UT_InterruptMessage &msg,
                      const UT_StringRef &main_optext,
                      int priority) override 
    {
        if (priority >= PRIORITY_THRESHOLD)
        {
            std::string message = msg.buildMessage().toStdString();
            m_writer.status(message);
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
            m_writer.status(message);
        }

        auto now = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now - start_time).count();
        
        if (elapsed >= COOK_TIMEOUT_SECONDS)
        {
            m_writer.error("Timeout");
            intr->interrupt();
        }
    }
    
    virtual void busyCheck(bool interrupted,
                          float percent,
                          float longpercent) override 
    {
        m_writer.status("Progress: " + std::to_string(percent) + " " + std::to_string(longpercent));
    }
    
    virtual void pop() override {}
    virtual void stop() override {}
    virtual void interruptAllowed(bool allowed, bool allow_ui) override {}

private:
    std::chrono::steady_clock::time_point start_time;
    StreamWriter& m_writer;
};

struct Request
{
    std::string op;
    std::string hda_file;
    int64 definition_index;
};

bool parse_request(const std::string& message, Request& request)
{
    UT_AutoJSONParser parser(message.c_str(), message.size());
    
    UT_StringHolder op, hda_file;
    int64 definition_index = -1;
    
    UT_JSONParser::iterator outer_it = parser->beginMap();
    while (!outer_it.atEnd())
    {
        UT_StringHolder key;
        if (!outer_it.getKey(key))
        {
            return false;
        }

        if (key == "op")
        {
            if (!parser->parseString(op))
            {
                return false;
            }
        }
        else if (key == "data")
        {
            UT_JSONParser::iterator data_it = parser->beginMap();
            while (!data_it.atEnd())
            {
                UT_StringHolder data_key;
                if (!data_it.getKey(data_key))
                {
                    return false;
                }

                if (data_key == "hda_path")
                {
                    if (!parser->parseString(hda_file))
                    {
                        return false;
                    }
                }
                else if (data_key == "definition_index")
                {
                    if (!parser->parseInt(definition_index))
                    {
                        return false;
                    }
                }
                else
                {
                    if (!parser->skipNextObject())
                    {
                        return false;
                    }
                }
                ++data_it;
            }
        }
        else
        {
            if (!parser->skipNextObject())
            {
                return false;
            }
        }
        ++outer_it;
    }

    if (hda_file.isEmpty() || definition_index < 0)
    {
        std::cerr << "Missing required fields" << std::endl;
        return false;
    }    

    request.op = op.toStdString();
    request.hda_file = hda_file.toStdString();
    request.definition_index = definition_index;
    return true;
}

bool process_message(const std::string& message, MOT_Director* boss, StreamWriter& writer)
{
    Request request;
    if (!parse_request(message, request))
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

    int read_fd = std::stoi(argv[1]);
    int write_fd = std::stoi(argv[2]);

    StreamWriter writer(write_fd);

    // Initialize Houdini
    MOT_Director* boss = new MOT_Director("standalone");
    OPsetDirector(boss);
    PIcreateResourceManager();

    StatusHandler status_handler(writer);
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
        ssize_t bytes_read = 0;
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

        if (bytes_read <= 0)
        {
            std::cerr << "Error reading from pipe" << std::endl;
            return 1;
        }

        writer.state(AutomationState::Start);

        status_handler.reset_timeout();
        bool result = process_message(message, boss, writer);
        message.clear();

        writer.state(AutomationState::End);
    }

    return 0;
}

UT_MAIN(theMain);