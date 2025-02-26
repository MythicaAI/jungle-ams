#include "types.h"

#include <UT/UT_JSONValue.h>
#include <iostream>

namespace util
{

bool parse_request(const std::string& message, CookRequest& request)
{
    // Parse message type
    UT_JSONValue root;
    if (!root.parseValue(message) || !root.isMap())
    {
        std::cerr << "Worker: Failed to parse JSON message" << std::endl;
        return false;
    }

    const UT_JSONValue* op = root.get("op");
    if (!op || op->getType() != UT_JSONValue::JSON_STRING || op->getString().toStdString() != "cook")
    {
        std::cerr << "Worker: Operation is not cook" << std::endl;
        return false;
    }

    const UT_JSONValue* data = root.get("data");
    if (!data || data->getType() != UT_JSONValue::JSON_MAP)
    {
        std::cerr << "Worker: Data is not a map" << std::endl;
        return false;
    }

    // Parse parameter set
    ParameterSet paramSet;
    for (const auto& [idx, key, value] : data->enumerateMap()) {
        switch (value.getType()) {
            case UT_JSONValue::JSON_INT:
                paramSet[key.toStdString()] = Parameter(value.getI());
                break;
            case UT_JSONValue::JSON_REAL:
                paramSet[key.toStdString()] = Parameter((double)value.getF());
                break;
            case UT_JSONValue::JSON_STRING:
                paramSet[key.toStdString()] = Parameter(value.getString().toStdString());
                break;
            case UT_JSONValue::JSON_BOOL:
                paramSet[key.toStdString()] = Parameter(value.getB());
                break;
            /*
            case UT_JSONValue::JSON_MAP:
                paramSet[key.toStdString()] = Parameter(value.getMap());
                break;
            case UT_JSONValue::JSON_ARRAY:
                paramSet[key.toStdString()] = Parameter(value.getArray());
                break;
            */
        }
    }

    // Bind to cook request
    auto hda_path_iter = paramSet.find("hda_path");
    if (hda_path_iter == paramSet.end() || !std::holds_alternative<std::string>(hda_path_iter->second))
    {
        std::cerr << "Worker: Request missing required field: hda_path" << std::endl;
        return false;
    }

    auto definition_index_iter = paramSet.find("definition_index");
    if (definition_index_iter == paramSet.end() || !std::holds_alternative<int64_t>(definition_index_iter->second))
    {
        std::cerr << "Worker: Request missing required field: definition_index" << std::endl;
        return false;
    }

    request.hda_file = std::get<std::string>(hda_path_iter->second);
    request.definition_index = std::get<int64_t>(definition_index_iter->second);

    paramSet.erase("hda_path");
    paramSet.erase("definition_index");
    request.parameters = paramSet;

    std::cerr << "Worker: Parsed cook request " 
              << "HDA: " << request.hda_file << " " 
              << "Definition index: " << request.definition_index << " "
              << "Parameters: " << request.parameters.size() << std::endl;

    return true;
}

}
