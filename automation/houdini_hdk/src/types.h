#pragma once

#include <string>

struct Request
{
    std::string op;
    std::string hda_file;
    int definition_index;
};

namespace util
{
    bool parse_request(const std::string& message, Request& request);
}