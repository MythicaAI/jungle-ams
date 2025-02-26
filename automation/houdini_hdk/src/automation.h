#pragma once

class MOT_Director;
class CookRequest;
class StreamWriter;

namespace util
{
    bool cook(MOT_Director* boss, const CookRequest& request, StreamWriter& writer);
}