#pragma once

#include <string>

class StreamReader
{
public:
    StreamReader(int fd) : m_fd(fd) {}

    bool readMessage(std::string& message);

private:
    int m_fd;
    std::string m_buffer;
};

enum class AutomationState
{
    Start,
    End
};

class StreamWriter
{
public:
    StreamWriter(struct mg_connection* conn) : m_conn(conn) {}

    void state(AutomationState state);
    void status(const std::string& message);
    void error(const std::string& message);
    void file(const std::string& path);

private:
    void writeToStream(const std::string& op, const std::string& data);

    struct mg_connection* m_conn;
};