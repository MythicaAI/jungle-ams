#pragma once

#include <map>
#include <optional>
#include <string>
#include <variant>
#include <vector>

struct FileParameter
{
    std::string file_id;
    std::optional<std::string> file_path;
};

using Parameter = std::variant<
    int,
    float,
    std::string,
    bool,
    FileParameter,
    std::vector<int>,
    std::vector<float>,
    std::vector<std::string>,
    std::vector<FileParameter>
>;
using ParameterSet = std::map<std::string, Parameter>;

struct CookRequest
{
    std::string hda_file;
    int definition_index;
    std::map<int, std::string> inputs;
    ParameterSet parameters;
};

namespace util
{
    bool parse_request(const std::string& message, CookRequest& request);
}