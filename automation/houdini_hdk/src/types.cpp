#include "types.h"

#include <UT/UT_JSONParser.h>
#include <iostream>

namespace util
{

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

}
