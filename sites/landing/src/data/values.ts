
export interface Value {
    title: string;
    description: string;
    imgSrc?: string;
}

export const values: Value[] = [
    {
        title: "Courage",
        description: "We trust our skills and confront challenges head-on, taking decisive action where others might hesitate.",
        imgSrc: "/images/values/forest.png"
    },
    {
        title: "Patience",
        description: "Even when faced with daunting tasks, we sustain persistent effort over time, focusing on incremental advancement.",
        imgSrc: "/images/values/storm.png"
    },
    {
        title: "Agency",
        description: "We act autonomously and trust in each other's capabilities, uniting for larger challenges as needed.",
        imgSrc: "/images/values/flora.png"
    },
    {
        title: "Quality",
        description: "We aim for work that we're proud of, maintaining a balance between efficiency and refusing to be mired in perfectionism.",
        imgSrc: "/images/values/water.png"
    },
    {
        title: "Humility",
        description: "We work diligently and are always prepared to learn, conscious that there's more to master and new hurdles to overcome.",
        imgSrc: "/images/values/pebble.png"
    }
];