#pragma once

class MOT_Director;
class Request;
class StreamWriter;

namespace util
{
    bool cook(MOT_Director* boss, Request& request, StreamWriter& writer);
}