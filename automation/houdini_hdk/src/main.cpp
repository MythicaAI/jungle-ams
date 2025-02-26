#include "automation.h"
#include "interrupt.h"
#include "streaming.h"
#include "types.h"

#include <MOT/MOT_Director.h>
#include <PI/PI_ResourceManager.h>
#include <UT/UT_Main.h>
#include <iostream>

static const int COOK_TIMEOUT_SECONDS = 1;

static void usage(const char *program)
{
    std::cerr << "Usage: " << program << " <read_fd> <write_fd>\n";
    std::cerr << "Reads requests from read_fd, processes them, streams results to write_fd\n";
    UT_Exit::fail();
}

static bool process_message(const std::string& message, MOT_Director* boss, StreamWriter& writer)
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

    return util::cook(boss, request, writer);
}

int theMain(int argc, char *argv[])
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