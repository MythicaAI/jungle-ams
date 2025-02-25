#include "streaming.h"

#include <iostream>
#include <unistd.h>

bool StreamReader::readMessage(std::string& message)
{
    message.clear();

    while (true)
    {
        size_t newline_pos = m_buffer.find('\n');
        if (newline_pos != std::string::npos)
        {
            message = m_buffer.substr(0, newline_pos);
            m_buffer.erase(0, newline_pos + 1);
            return true;
        }

        char chunk[4096];
        ssize_t bytes_read = read(m_fd, chunk, sizeof(chunk));
        if (bytes_read <= 0)
        {
            return false;
        }

        m_buffer.append(chunk, bytes_read);
    }

    return false;
}

void StreamWriter::state(AutomationState state)
{
    writeToStream("automation", state == AutomationState::Start ? "start" : "end");
}

void StreamWriter::status(const std::string& message)
{
    writeToStream("status", message);
}

void StreamWriter::error(const std::string& message)
{
    writeToStream("error", message);
}

void StreamWriter::file(const std::string& path)
{
    writeToStream("file", path);
}

void StreamWriter::writeToStream(const std::string& op, const std::string& data)
{
    std::cout << "Worker: Sending response: " << op << " " << data << std::endl;
    std::string json = "{\"op\":\"" + op + "\",\"data\":\"" + data + "\"}\n";
    write(m_fd, json.c_str(), json.size());
}